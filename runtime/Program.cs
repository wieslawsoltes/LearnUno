using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System.Runtime.InteropServices.JavaScript;

namespace LearnUnoRunner;

public static class Program
{
    private static App? _app;
    public static void Main(string[] args) => Application.Start(_ => _app = new App());
}

public sealed class App : Application
{
    internal static ContentControl Surface { get; } = new();
    private Window? _window;
    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        Resources.MergedDictionaries.Add(new XamlControlsResources());
        _window = new Window { Content = new ScrollViewer { Content = Surface } };
        Surface.Content = new TextBlock { Text = "Uno is ready. Run your lesson to begin.", Margin = new Thickness(24), TextWrapping = TextWrapping.Wrap };
        _window.Activate();
        Bridge.Ready();
    }
}

public static partial class Bridge
{
    private static readonly LanguageEngine Engine = new();
    [JSImport("globalThis.learnUnoRuntimeReady")]
    internal static partial void Ready();

    [JSExport]
    public static async Task<string> Request(string json)
    {
        try
        {
            var request = System.Text.Json.JsonSerializer.Deserialize<EngineRequest>(json, LanguageEngine.JsonOptions)
                ?? throw new ArgumentException("A request is required.");
            if (request.Code.Length > 100_000) throw new ArgumentException("Keep a lesson below 100,000 characters.");
            var result = await Engine.HandleAsync(request);
            return System.Text.Json.JsonSerializer.Serialize(new { ok = true, result }, LanguageEngine.JsonOptions);
        }
        catch (Exception error)
        {
            return System.Text.Json.JsonSerializer.Serialize(new { ok = false, error = error.GetBaseException().Message }, LanguageEngine.JsonOptions);
        }
    }
}

public sealed record EngineRequest(string Method, string Code = "", string Language = "csharp", int Position = 0, string? Name = null);
