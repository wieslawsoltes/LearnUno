using System.Collections.Immutable;
using System.Reflection;
using System.Text.Json;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Completion;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Formatting;
using Microsoft.CodeAnalysis.Host.Mef;
using Microsoft.CodeAnalysis.QuickInfo;
using Microsoft.CodeAnalysis.Text;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Markup;

namespace LearnUnoRunner;

/// <summary>Real Roslyn and Uno services. No remote compiler and no HTML imitation of XAML.</summary>
public sealed class LanguageEngine
{
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private AdhocWorkspace? _workspace;
    private Project? _project;
    private Document? _document;
    private string? _lastCode;
    private int _runCount;
    private ImmutableArray<MetadataReference> _references;
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<object> HandleAsync(EngineRequest request)
    {
        await _gate.WaitAsync();
        try
        {
            if (request.Method == "schema") return XamlSchema.Describe();
            if (request.Method == "run" && request.Language == "xml") return RunXaml(request.Code);
            var document = GetDocument(request.Code);
            var position = Math.Clamp(request.Position, 0, request.Code.Length);
            return request.Method switch
            {
                "complete" => await CompleteAsync(document, position),
                "hover" => await HoverAsync(document, position),
                "diagnostics" => await DiagnosticsAsync(document),
                "definition" => await DefinitionAsync(document, position),
                "signature" => await SignatureAsync(document, position),
                "format" => new { text = (await (await Formatter.FormatAsync(document)).GetTextAsync()).ToString() },
                "run" => await RunCSharpAsync(document),
                _ => throw new ArgumentException($"Unknown language operation: {request.Method}")
            };
        }
        finally { _gate.Release(); }
    }

    private Document GetDocument(string code)
    {
        if (_workspace is null)
        {
            var assemblies = MefHostServices.DefaultAssemblies.Concat(new[]
            {
                Assembly.Load("Microsoft.CodeAnalysis.CSharp.Workspaces"),
                Assembly.Load("Microsoft.CodeAnalysis.CSharp.Features"),
                Assembly.Load("Microsoft.CodeAnalysis.Features")
            }).Distinct();
            _workspace = new AdhocWorkspace(MefHostServices.Create(assemblies));
            var ownAssembly = typeof(LanguageEngine).Assembly;
            _references = ownAssembly.GetManifestResourceNames()
                .Where(name => name.StartsWith("refs.", StringComparison.Ordinal) && name.EndsWith(".dll", StringComparison.OrdinalIgnoreCase))
                .Select(name =>
                {
                    using var stream = ownAssembly.GetManifestResourceStream(name)!;
                    return (MetadataReference)MetadataReference.CreateFromStream(stream, filePath: name[5..]);
                }).ToImmutableArray();
            if (_references.Length < 5) throw new InvalidOperationException("Compiler reference metadata was not embedded by the build.");
            _project = _workspace.AddProject(ProjectInfo.Create(ProjectId.CreateNewId(), VersionStamp.Create(), "Lesson", "Lesson", LanguageNames.CSharp,
                compilationOptions: new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, concurrentBuild: false, optimizationLevel: OptimizationLevel.Debug),
                parseOptions: new CSharpParseOptions(LanguageVersion.Latest), metadataReferences: _references));
            _document = _project.AddDocument("Lesson.cs", SourceText.From(code));
            _lastCode = code;
        }
        if (_lastCode != code)
        {
            _document = _document!.WithText(SourceText.From(code));
            _lastCode = code;
        }
        return _document!;
    }

    private static async Task<object> CompleteAsync(Document document, int position)
    {
        var service = CompletionService.GetService(document) ?? throw new InvalidOperationException("Roslyn C# completion service is unavailable.");
        var list = await service.GetCompletionsAsync(document, position);
        if (list is null) return new { items = Array.Empty<object>(), incomplete = false };
        var results = new List<object>();
        foreach (var item in list.ItemsList.Take(180))
        {
            var change = await service.GetChangeAsync(document, item);
            results.Add(new
            {
                label = item.DisplayTextPrefix + item.DisplayText + item.DisplayTextSuffix,
                detail = item.InlineDescription,
                insertText = change.TextChange.NewText ?? item.DisplayText,
                start = change.TextChange.Span.Start,
                length = change.TextChange.Span.Length,
                sortText = item.SortText,
                tags = item.Tags
            });
        }
        return new { items = results, incomplete = list.ItemsList.Count > 180 };
    }

    private static async Task<object> HoverAsync(Document document, int position)
    {
        var service = QuickInfoService.GetService(document);
        var info = service is null ? null : await service.GetQuickInfoAsync(document, position);
        return info is null ? new { text = "", start = position, length = 0 } : new
        {
            text = string.Join("\n\n", info.Sections.Select(section => string.Concat(section.TaggedParts.Select(part => part.Text)))),
            start = info.Span.Start,
            length = info.Span.Length
        };
    }

    private static async Task<object> DiagnosticsAsync(Document document)
    {
        var compilation = await document.Project.GetCompilationAsync();
        return new { diagnostics = compilation!.GetDiagnostics().Where(d => d.Location.IsInSource).Select(ToDiagnostic).ToArray() };
    }

    private static object ToDiagnostic(Diagnostic diagnostic)
    {
        var line = diagnostic.Location.GetLineSpan();
        return new
        {
            message = diagnostic.GetMessage(), code = diagnostic.Id,
            severity = diagnostic.Severity.ToString(),
            startLine = line.StartLinePosition.Line + 1, startColumn = line.StartLinePosition.Character + 1,
            endLine = line.EndLinePosition.Line + 1, endColumn = line.EndLinePosition.Character + 1
        };
    }

    private static async Task<object> DefinitionAsync(Document document, int position)
    {
        var root = await document.GetSyntaxRootAsync();
        var model = await document.GetSemanticModelAsync();
        var node = root!.FindToken(Math.Min(position, Math.Max(0, root.FullSpan.End - 1))).Parent;
        var symbol = node is null ? null : model!.GetSymbolInfo(node).Symbol ?? model.GetDeclaredSymbol(node);
        var source = symbol?.Locations.FirstOrDefault(location => location.IsInSource);
        return new { start = source?.SourceSpan.Start ?? -1, length = source?.SourceSpan.Length ?? 0, symbol = symbol?.ToDisplayString() ?? "" };
    }

    private static async Task<object> SignatureAsync(Document document, int position)
    {
        var root = await document.GetSyntaxRootAsync();
        var model = await document.GetSemanticModelAsync();
        var invocation = root!.FindToken(Math.Max(0, position - 1)).Parent?.AncestorsAndSelf().OfType<InvocationExpressionSyntax>().FirstOrDefault();
        if (invocation is null) return new { signatures = Array.Empty<object>(), activeParameter = 0 };
        var symbols = model!.GetMemberGroup(invocation.Expression).OfType<IMethodSymbol>();
        return new
        {
            signatures = symbols.Select(method => new { label = method.ToDisplayString(), parameters = method.Parameters.Select(p => new { label = p.ToDisplayString() }).ToArray() }).ToArray(),
            activeParameter = invocation.ArgumentList.Arguments.GetSeparators().Count(separator => separator.SpanStart < position)
        };
    }

    private object RunXaml(string code)
    {
        if (code.Contains("x:Class=", StringComparison.Ordinal) || code.Contains("{x:Bind", StringComparison.Ordinal))
            throw new ArgumentException("Runtime XAML does not compile x:Class or x:Bind. Use Binding here; use the downloadable project for compiled XAML.");
        var view = XamlReader.Load(code) as UIElement ?? throw new ArgumentException("The XAML root must be a UIElement.");
        App.Surface.Content = view;
        return new { rendered = true, type = view.GetType().FullName, engine = "Uno NativeRenderer / WebAssembly", runCount = ++_runCount, text = Describe(view) };
    }

    private async Task<object> RunCSharpAsync(Document document)
    {
        if (_runCount >= 30) throw new InvalidOperationException("Reset the runtime after 30 runs to release dynamically loaded assemblies.");
        var compilation = (await document.Project.GetCompilationAsync())!.WithAssemblyName("LearnUnoLesson" + Guid.NewGuid().ToString("N"));
        using var stream = new MemoryStream();
        var result = compilation.Emit(stream);
        if (!result.Success) return new { rendered = false, diagnostics = result.Diagnostics.Select(ToDiagnostic).ToArray() };
        var assembly = Assembly.Load(stream.ToArray());
        var lesson = assembly.GetType("Lesson") ?? throw new ArgumentException("Define public static class Lesson with public static UIElement Build().");
        var method = lesson.GetMethod("Build", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes)
            ?? throw new ArgumentException("Define a public static parameterless Build method on Lesson.");
        var view = method.Invoke(null, null) as UIElement ?? throw new ArgumentException("Lesson.Build() must return a Uno UIElement.");
        App.Surface.Content = view;
        return new { rendered = true, type = view.GetType().FullName, engine = "Roslyn + Uno / WebAssembly", runCount = ++_runCount, text = Describe(view) };
    }

    private static string Describe(UIElement element)
    {
        if (element is TextBlock text) return text.Text;
        if (element is TextBox input) return input.Text;
        if (element is Panel panel) return string.Join(" | ", panel.Children.Select(Describe));
        if (element is Border border && border.Child is UIElement child) return Describe(child);
        if (element is ContentControl content) return content.Content is UIElement view ? Describe(view) : content.Content?.ToString() ?? "";
        return element.GetType().Name;
    }
}
