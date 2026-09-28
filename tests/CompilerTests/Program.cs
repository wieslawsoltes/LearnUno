using System.Reflection;
using System.Text.Json;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

if (args.Length != 2) throw new ArgumentException("Usage: CompilerTests <runtime-assembly> <lessons-json>");
var assembly = Assembly.LoadFile(Path.GetFullPath(args[0]));
var references = assembly.GetManifestResourceNames().Where(n => n.StartsWith("refs.") && n.EndsWith(".dll"))
    .Select(name => { using var stream = assembly.GetManifestResourceStream(name)!; return MetadataReference.CreateFromStream(stream); }).ToArray();
if (references.Length < 5) throw new InvalidOperationException("Missing runtime compilation references.");
using var json = JsonDocument.Parse(File.ReadAllText(args[1]));
var failures = new List<object>();
int compiled = 0;
foreach (var lesson in json.RootElement.EnumerateArray())
{
    if (lesson.GetProperty("language").GetString() != "csharp") continue;
    foreach (string variant in new[] { "code", "solution" })
    {
        var code = lesson.GetProperty(variant).GetString()!;
        var syntax = CSharpSyntaxTree.ParseText(code, new CSharpParseOptions(LanguageVersion.Latest));
        var compilation = CSharpCompilation.Create("CourseValidation" + compiled++, new[] { syntax }, references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, concurrentBuild: false));
        using var output = new MemoryStream();
        var result = compilation.Emit(output);
        foreach (var diagnostic in result.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error))
            failures.Add(new { lesson = lesson.GetProperty("id").GetString(), variant, diagnostic = diagnostic.ToString() });
    }
}
Console.WriteLine($"Compiled {compiled} C# starters/solutions against {references.Length} actual runner references.");
Console.WriteLine(JsonSerializer.Serialize(failures, new JsonSerializerOptions { WriteIndented = true }));
return failures.Count == 0 ? 0 : 1;
