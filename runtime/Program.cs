using Microsoft.Extensions.Logging;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;

namespace LearnUnoRunner;

public static class Program
{
    private static App? _app;
    private static ILoggerFactory? _logging;
    internal static string Stage { get; private set; } = "Assembly loaded";

    internal static void Report(string stage)
    {
        Stage = stage;
        Console.WriteLine("[LearnUno] " + stage);
    }

    public static void Main(string[] args)
    {
        Report("Main entered");
        _logging = LoggerFactory.Create(builder => builder
            .AddProvider(new Uno.Extensions.Logging.WebAssembly.WebAssemblyConsoleLoggerProvider())
            .SetMinimumLevel(LogLevel.Warning));
        Uno.Extensions.LogExtensionPoint.AmbientLoggerFactory = _logging;
        AppDomain.CurrentDomain.UnhandledException += (_, error) => Console.Error.WriteLine(error.ExceptionObject);
        TaskScheduler.UnobservedTaskException += (_, error) => Console.Error.WriteLine(error.Exception);
        Report("Starting Uno Application");
        Application.Start(_ =>
        {
            Report("Application factory entered");
            _app = new App();
            Report("Application constructed");
        });
        Report("Application.Start returned");
    }
}

public sealed class App : Application
{
    private static ContentControl? _surface;
    internal static ContentControl Surface => _surface ?? throw new InvalidOperationException("Uno has not created its preview surface yet.");
    private Window? _window;

    public App()
    {
        UnhandledException += (_, error) => Console.Error.WriteLine("[LearnUno] UI exception: " + error.Exception);
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        try
        {
            Program.Report("OnLaunched entered");
            Resources.MergedDictionaries.Add(new XamlControlsResources());
            _surface = new ContentControl();
            _window = new Window { Content = new ScrollViewer { Content = _surface } };
            _surface.Content = new TextBlock
            {
                Text = "Uno is ready. Run your lesson to begin.",
                Margin = new Thickness(24), TextWrapping = TextWrapping.Wrap
            };
            _window.Activate();
            Program.Report("Window activated");
            Bridge.Ready();
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error);
            Bridge.BootFailed(error.ToString());
        }
    }
}

public static partial class Bridge
{
    private static readonly Lazy<LanguageEngine> Engine = new(() => new LanguageEngine());

    [JSImport("globalThis.learnUnoRuntimeReady")]
    internal static partial void Ready();

    [JSImport("globalThis.learnUnoBootError")]
    internal static partial void BootFailed(string message);

    [JSExport]
    public static string Diagnostics() => JsonSerializer.Serialize(new
    {
        stage = Program.Stage,
        application = Application.Current?.GetType().FullName,
        runtime = Environment.Version.ToString()
    });

    [JSExport]
    public static async Task<string> Request(string json)
    {
        try
        {
            var request = JsonSerializer.Deserialize<EngineRequest>(json, LanguageEngine.JsonOptions)
                ?? throw new ArgumentException("A request is required.");
            if (request.Code.Length > 100_000) throw new ArgumentException("Keep a lesson below 100,000 characters.");
            var result = await Engine.Value.HandleAsync(request);
            return JsonSerializer.Serialize(new { ok = true, result }, LanguageEngine.JsonOptions);
        }
        catch (Exception error)
        {
            return JsonSerializer.Serialize(new { ok = false, error = error.GetBaseException().Message }, LanguageEngine.JsonOptions);
        }
    }
}

public sealed record EngineRequest(string Method, string Code = "", string Language = "csharp", int Position = 0, string? Name = null);
