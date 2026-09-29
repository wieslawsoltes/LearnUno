// Authored app-building lessons; each example is a complete single-document lab.
export default [
  {
    "id": "composition-root",
    "title": "Assemble an application at one composition root",
    "summary": "Register capabilities once and construct view models through explicit dependencies.",
    "track": "app-composition",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddSingleton<IWorkspaceName>(new WorkspaceName(\"Learning studio\"));\n        services.AddTransient<WorkspaceModel>();\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions {\n            ValidateOnBuild = true, ValidateScopes = true\n        });\n        var model = provider.GetRequiredService<WorkspaceModel>();\n        return new TextBlock { Text = model.Heading, FontSize = 26, Margin = new Thickness(24), TextWrapping = TextWrapping.Wrap };\n    }\n}\n\npublic interface IWorkspaceName { string Value { get; } }\npublic sealed record WorkspaceName(string Value) : IWorkspaceName;\npublic sealed class WorkspaceModel\n{\n    private readonly IWorkspaceName _name;\n    public WorkspaceModel(IWorkspaceName name) => _name = name;\n    public string Heading => \"Welcome to \" + _name.Value;\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddSingleton<IWorkspaceName>(new WorkspaceName(\"Project desk\"));\n        services.AddTransient<WorkspaceModel>();\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions {\n            ValidateOnBuild = true, ValidateScopes = true\n        });\n        var model = provider.GetRequiredService<WorkspaceModel>();\n        return new TextBlock { Text = model.Heading, FontSize = 26, Margin = new Thickness(24), TextWrapping = TextWrapping.Wrap };\n    }\n}\n\npublic interface IWorkspaceName { string Value { get; } }\npublic sealed record WorkspaceName(string Value) : IWorkspaceName;\npublic sealed class WorkspaceModel\n{\n    private readonly IWorkspaceName _name;\n    public WorkspaceModel(IWorkspaceName name) => _name = name;\n    public string Heading => \"Welcome to \" + _name.Value;\n}\n",
    "anchor": "WorkspaceName(\"Learning studio\")",
    "challenge": "Change the registered workspace without changing WorkspaceModel",
    "rules": [
      {
        "contains": "WorkspaceName(\"Project desk\")",
        "label": "Change the registered workspace without changing WorkspaceModel"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Register capabilities once and construct view models through explicit dependencies.",
      "Change the registered workspace without changing WorkspaceModel"
    ],
    "hints": [
      "Locate WorkspaceName(\"Learning studio\") and predict the current behavior.",
      "Try WorkspaceName(\"Project desk\"); then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Where should service resolution normally be concentrated?",
      "options": [
        "At the composition boundary rather than throughout business methods",
        "Inside every property getter",
        "In static fields shared by unrelated tests"
      ],
      "answer": 0,
      "explanation": "A composition root assembles the object graph. Ordinary classes expose their dependencies through constructors instead of locating arbitrary services during behavior."
    },
    "source": "dependency-injection",
    "diagram": "pipeline",
    "concepts": [
      [
        "Describe a capability before choosing an implementation",
        "An interface is useful when it names a replaceable capability rather than merely copying every member of a concrete class. WorkspaceModel needs a workspace name; it does not need to know how configuration was read or where a settings screen stores the value. Constructor injection makes that requirement visible to the compiler and to tests."
      ],
      [
        "Register the object graph at the boundary",
        "ServiceCollection records construction policies; it does not immediately instantiate every registered type. Register a shared immutable name as a singleton and WorkspaceModel as transient. Build one provider for the intended application or test boundary. Creating providers inside each feature can duplicate singletons and split ownership into unrelated graphs."
      ],
      [
        "Validate wiring without overstating validation",
        "ValidateOnBuild and ValidateScopes help expose invalid construction or lifetime relationships. They do not prove that an HTTP endpoint is reachable, a factory returns correct data, or every runtime argument is valid. Factory bodies may defer work until resolution, and some open generic registrations cannot be fully constructed during validation. Treat validation as one layer of evidence."
      ]
    ],
    "predict": "A workspace screen needs a display name today and may need a repository tomorrow. Constructing every collaborator inside the view model hides those choices and makes tests harder. Use the actual Microsoft dependency-injection container to assemble the graph in one place, then keep the model unaware of the container that built it.",
    "transfer": "In an Uno application, place registrations in the host/composition setup and inject a repository into a view model. Keep IServiceProvider out of ordinary feature methods. Test direct construction separately from registration validation, then document ownership of application-wide services and shorter editing sessions.",
    "pitfall": "This construction-time example displays a completed string and then disposes its provider. A live bound feature that retains services needs a provider or scope owned for the entire feature lifetime.",
    "packages": {
      "Microsoft.Extensions.DependencyInjection": "10.0.12"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection",
      "https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/DependencyInjection/Overview.html"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "dependency-injection"
    ]
  },
  {
    "id": "scope-ownership",
    "title": "Give an editing session its own service scope",
    "summary": "Observe scoped identity, separation between scopes, and deterministic disposal.",
    "track": "app-composition",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddScoped<EditingSession>();\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = true });\n        bool sameWithinScope; bool disposedAfterScope; string firstId;\n        EditingSession first;\n        using (var scope = provider.CreateScope()) {\n            first = scope.ServiceProvider.GetRequiredService<EditingSession>();\n            var again = scope.ServiceProvider.GetRequiredService<EditingSession>();\n            firstId = first.Id;\n            sameWithinScope = ReferenceEquals(first, again);\n        }\n        disposedAfterScope = first.IsDisposed;\n        using var secondScope = provider.CreateScope();\n        var second = secondScope.ServiceProvider.GetRequiredService<EditingSession>();\n        return new TextBlock { Text = $\"Same within scope: {sameWithinScope}\\nFirst disposed: {disposedAfterScope}\\nDifferent session: {firstId != second.Id}\",\n            TextWrapping = TextWrapping.Wrap, FontSize = 22, Margin = new Thickness(24) };\n    }\n}\n\npublic sealed class EditingSession : IDisposable\n{\n    public string Id { get; } = Guid.NewGuid().ToString(\"N\");\n    public bool IsDisposed { get; private set; }\n    public void Dispose() => IsDisposed = true;\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddTransient<EditingSession>();\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = true });\n        bool sameWithinScope; bool disposedAfterScope; string firstId;\n        EditingSession first;\n        using (var scope = provider.CreateScope()) {\n            first = scope.ServiceProvider.GetRequiredService<EditingSession>();\n            var again = scope.ServiceProvider.GetRequiredService<EditingSession>();\n            firstId = first.Id;\n            sameWithinScope = ReferenceEquals(first, again);\n        }\n        disposedAfterScope = first.IsDisposed;\n        using var secondScope = provider.CreateScope();\n        var second = secondScope.ServiceProvider.GetRequiredService<EditingSession>();\n        return new TextBlock { Text = $\"Same within scope: {sameWithinScope}\\nFirst disposed: {disposedAfterScope}\\nDifferent session: {firstId != second.Id}\",\n            TextWrapping = TextWrapping.Wrap, FontSize = 22, Margin = new Thickness(24) };\n    }\n}\n\npublic sealed class EditingSession : IDisposable\n{\n    public string Id { get; } = Guid.NewGuid().ToString(\"N\");\n    public bool IsDisposed { get; private set; }\n    public void Dispose() => IsDisposed = true;\n}\n",
    "anchor": "services.AddScoped<EditingSession>();",
    "challenge": "Compare transient identity with the original scoped identity",
    "rules": [
      {
        "contains": "services.AddTransient<EditingSession>();",
        "label": "Compare transient identity with the original scoped identity"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Observe scoped identity, separation between scopes, and deterministic disposal.",
      "Compare transient identity with the original scoped identity"
    ],
    "hints": [
      "Locate services.AddScoped<EditingSession>(); and predict the current behavior.",
      "Try services.AddTransient<EditingSession>();; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "What defines a scope in a desktop or browser client?",
      "options": [
        "An explicit owner boundary chosen by the application",
        "Every mouse click automatically",
        "An HTTP request even when the app has no server"
      ],
      "answer": 0,
      "explanation": "A client application must create scopes for meaningful lifetimes such as a document, editing workflow, or window. Server request-scoping conventions do not automatically create client scopes."
    },
    "source": "dependency-injection",
    "diagram": "pipeline",
    "concepts": [
      [
        "Choose the semantic lifetime first",
        "A scope should correspond to a meaningful application lifetime rather than an arbitrary block of code. A document, modal editing workflow, or workspace can be a good candidate when several collaborators need shared session state. The UI framework does not automatically equate Loaded/Unloaded, navigation, and document lifetime. Decide which owner creates and closes the scope."
      ],
      [
        "Observe identity rather than infer it",
        "The lab compares object references, not just identical property values. AddScoped caches the constructed instance within the resolving scope. AddTransient constructs a new instance per resolution. Two objects can expose equal text and still be different sessions, which matters when subscriptions, caches, and pending operations belong to those instances."
      ],
      [
        "Dispose the owner, not random collaborators",
        "Disposing a scope releases container-owned disposable services created through that scope. Feature code should not independently dispose a shared injected session while another component still uses it. For asynchronously disposable services, use an asynchronous scope and await disposal where the owner permits it. Disposal is a resource protocol, not a guarantee that the garbage collector immediately reclaims every object."
      ]
    ],
    "predict": "Two controls in one document should share the same editing session, while a second document needs an independent one. The application is not an HTTP server, so no request middleware will create that boundary for you. Create scopes explicitly, observe service identity, and verify disposal when the session closes.",
    "transfer": "Give a multi-document Uno shell a scope per open document. Resolve its view model and session services from that scope, and dispose them when the document truly closes. Test shared identity within one document, isolation between documents, and deterministic cleanup without assuming navigation callbacks equal ownership.",
    "pitfall": "A longer-lived service must not retain a shorter-lived session. Move the consumer into the session or create an explicit scoped operation; hiding resolution behind a service locator does not repair ownership.",
    "packages": {
      "Microsoft.Extensions.DependencyInjection": "10.0.12"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "dependency-injection"
    ]
  },
  {
    "id": "captive-dependencies",
    "title": "Detect a singleton that captures scoped state",
    "summary": "Use container validation to expose lifetime mismatches before users open the feature.",
    "track": "app-composition",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddScoped<DocumentSession>();\n        services.AddSingleton<WorkspaceConsumer>();\n        string outcome;\n        try {\n            using var provider = services.BuildServiceProvider(new ServiceProviderOptions {\n                ValidateOnBuild = true, ValidateScopes = true\n            });\n            using var scope = provider.CreateScope();\n            _ = scope.ServiceProvider.GetRequiredService<WorkspaceConsumer>();\n            outcome = \"Graph accepted: consumer and dependency lifetimes are compatible.\";\n        }\n        catch (Exception error) when (error is AggregateException || error is InvalidOperationException) {\n            outcome = \"Graph rejected: a singleton cannot capture the scoped document session.\";\n        }\n        return new TextBlock { Text = outcome, FontSize = 22, TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic sealed class DocumentSession { }\npublic sealed class WorkspaceConsumer\n{\n    public DocumentSession Session { get; }\n    public WorkspaceConsumer(DocumentSession session) => Session = session;\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddScoped<DocumentSession>();\n        services.AddScoped<WorkspaceConsumer>();\n        string outcome;\n        try {\n            using var provider = services.BuildServiceProvider(new ServiceProviderOptions {\n                ValidateOnBuild = true, ValidateScopes = true\n            });\n            using var scope = provider.CreateScope();\n            _ = scope.ServiceProvider.GetRequiredService<WorkspaceConsumer>();\n            outcome = \"Graph accepted: consumer and dependency lifetimes are compatible.\";\n        }\n        catch (Exception error) when (error is AggregateException || error is InvalidOperationException) {\n            outcome = \"Graph rejected: a singleton cannot capture the scoped document session.\";\n        }\n        return new TextBlock { Text = outcome, FontSize = 22, TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic sealed class DocumentSession { }\npublic sealed class WorkspaceConsumer\n{\n    public DocumentSession Session { get; }\n    public WorkspaceConsumer(DocumentSession session) => Session = session;\n}\n",
    "anchor": "services.AddSingleton<WorkspaceConsumer>();",
    "challenge": "Move the consumer into the document scope",
    "rules": [
      {
        "contains": "services.AddScoped<WorkspaceConsumer>();",
        "label": "Move the consumer into the document scope"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Use container validation to expose lifetime mismatches before users open the feature.",
      "Move the consumer into the document scope"
    ],
    "hints": [
      "Locate services.AddSingleton<WorkspaceConsumer>(); and predict the current behavior.",
      "Try services.AddScoped<WorkspaceConsumer>();; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why is a scoped dependency inside a singleton constructor a problem?",
      "options": [
        "The singleton retains session-specific state beyond its intended lifetime",
        "Every singleton is inherently invalid",
        "Constructor injection disables disposal"
      ],
      "answer": 0,
      "explanation": "The long-lived consumer captures a shorter-lived service. Align the consumer lifetime or redesign the operation boundary; disabling validation does not repair ownership."
    },
    "source": "dependency-injection",
    "diagram": "pipeline",
    "concepts": [
      [
        "Draw the lifetime relationship",
        "Think of constructor references as ownership edges that can keep a dependency reachable as long as its consumer. A singleton consumer is shared across the provider lifetime. A scoped document session is supposed to vary with each document scope. Capturing one session in the singleton constructor cannot express that changing relationship correctly."
      ],
      [
        "Make invalid wiring fail deliberately",
        "Enable ValidateOnBuild and ValidateScopes in the composition test. The provider can inspect supported registration graphs and report the captive relationship early. Keep the expected rejection in a negative test with a specific reason. Do not turn all startup errors into success or catch unrelated failures without reporting them."
      ],
      [
        "Choose a real repair, not a bypass",
        "Making the consumer scoped is appropriate when its behavior belongs to a document. A genuinely application-wide coordinator may instead invoke a scoped operation through a factory or scope-owning service boundary. It must not store the returned scoped service after that operation closes. Injecting IServiceProvider everywhere merely hides the edge from a readable constructor contract."
      ]
    ],
    "predict": "A workspace coordinator survives for the whole app, but one of its constructor dependencies belongs to a single document. The graph compiles and may appear to work with one document, then leaks state across documents or retains disposed resources. Reproduce that lifetime mismatch with the actual DI container and repair the ownership rather than turning off the warning.",
    "transfer": "Audit a real Uno feature’s registrations by drawing lifetime edges. Add a negative test for a deliberately captive service, then test two independent feature scopes. Use container diagnostics as evidence about the graph, not as a substitute for subscription and resource-lifecycle tests.",
    "pitfall": "Container validation only reasons about the graph it can inspect. Manual references, static state, event subscriptions and factory-created objects still require separate lifecycle tests.",
    "packages": {
      "Microsoft.Extensions.DependencyInjection": "10.0.12"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "dependency-injection"
    ]
  },
  {
    "id": "service-factories",
    "title": "Combine injected services with runtime arguments",
    "summary": "Keep service-provider knowledge inside a typed factory at the construction boundary.",
    "track": "app-composition",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddSingleton<IReportClock, FixedReportClock>();\n        services.AddTransient<ReportFactory>();\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });\n        var factory = provider.GetRequiredService<ReportFactory>();\n        var report = factory.Create(\"Weekly learning\");\n        return new TextBlock { Text = report.Caption, FontSize = 22, TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic interface IReportClock { string Today { get; } }\npublic sealed class FixedReportClock : IReportClock { public string Today => \"Training day\"; }\npublic sealed class ReportFactory\n{\n    private readonly IServiceProvider _services;\n    public ReportFactory(IServiceProvider services) => _services = services;\n    public ReportModel Create(string title) => ActivatorUtilities.CreateInstance<ReportModel>(_services, title);\n}\npublic sealed class ReportModel\n{\n    public string Caption { get; }\n    public ReportModel(IReportClock clock, string title) => Caption = $\"{title} / {clock.Today}\";\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddSingleton<IReportClock, FixedReportClock>();\n        services.AddTransient<ReportFactory>();\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });\n        var factory = provider.GetRequiredService<ReportFactory>();\n        var report = factory.Create(\"Release readiness\");\n        return new TextBlock { Text = report.Caption, FontSize = 22, TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic interface IReportClock { string Today { get; } }\npublic sealed class FixedReportClock : IReportClock { public string Today => \"Training day\"; }\npublic sealed class ReportFactory\n{\n    private readonly IServiceProvider _services;\n    public ReportFactory(IServiceProvider services) => _services = services;\n    public ReportModel Create(string title) => ActivatorUtilities.CreateInstance<ReportModel>(_services, title);\n}\npublic sealed class ReportModel\n{\n    public string Caption { get; }\n    public ReportModel(IReportClock clock, string title) => Caption = $\"{title} / {clock.Today}\";\n}\n",
    "anchor": "factory.Create(\"Weekly learning\")",
    "challenge": "Supply a different report title through the factory",
    "rules": [
      {
        "contains": "factory.Create(\"Release readiness\")",
        "label": "Supply a different report title through the factory"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Keep service-provider knowledge inside a typed factory at the construction boundary.",
      "Supply a different report title through the factory"
    ],
    "hints": [
      "Locate factory.Create(\"Weekly learning\") and predict the current behavior.",
      "Try factory.Create(\"Release readiness\"); then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Who owns disposal of an object created directly by ActivatorUtilities?",
      "options": [
        "The caller or an explicitly designed owner, not automatic registration tracking of that newly created object",
        "The TextBlock always owns it",
        "The garbage collector immediately calls Dispose"
      ],
      "answer": 0,
      "explanation": "ActivatorUtilities constructs the requested object with supplied arguments and resolved dependencies. The created object needs explicit ownership if disposable; container-owned dependencies retain their own lifetime policy."
    },
    "source": "dependency-injection",
    "diagram": "pipeline",
    "concepts": [
      [
        "Separate operation data from shared services",
        "A report title belongs to one request; a clock capability can be shared and replaced in tests. Treating both as arbitrary global services hides which values vary per operation. An explicit Create(title) method communicates that distinction and makes simultaneous reports possible without mutating a singleton settings object."
      ],
      [
        "Use the provider at the construction seam",
        "ReportFactory is intentionally a composition adapter. It may know IServiceProvider because its single job is construction; ReportModel does not. ActivatorUtilities combines the explicit string argument with IReportClock from the provider. Keep constructor selection unambiguous and prefer a clear typed factory contract over passing an unstructured object array through the application."
      ],
      [
        "Define ownership of factory products",
        "An object created by ActivatorUtilities is not automatically a normal container-tracked registration instance. A disposable product needs a caller or explicit owner responsible for cleanup. Services resolved from the provider keep their own container lifetimes, so disposing the product must not arbitrarily dispose a shared singleton collaborator."
      ]
    ],
    "predict": "A details view model needs a repository from DI and a document identifier chosen by the user. Registering the selected identifier globally makes simultaneous documents interfere with each other. Use a typed construction boundary that combines stable service dependencies with per-request data without exposing a service provider to the feature’s normal behavior.",
    "transfer": "Introduce an IDetailsFactory.Create(documentId) boundary for an Uno details feature. Keep the view model container-independent, validate the ID before loading, and document how the caller owns both the feature and any required scope. Test direct construction, factory wiring, and teardown separately.",
    "pitfall": "ActivatorUtilities combines runtime arguments with registered dependencies; it does not authorize the requested resource or automatically own every product it creates. Keep authorization and product disposal explicit.",
    "packages": {
      "Microsoft.Extensions.DependencyInjection": "10.0.12"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "dependency-injection"
    ]
  },
  {
    "id": "service-decorators",
    "title": "Add behavior with a service decorator",
    "summary": "Wrap a capability without recursive resolution or coupling the view to caching.",
    "track": "app-composition",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddSingleton<MemoryCatalog>();\n        services.AddSingleton<ICatalog>(p => new CachedCatalog(p.GetRequiredService<MemoryCatalog>()));\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });\n        var catalog = provider.GetRequiredService<ICatalog>();\n        var first = catalog.Read(\"uno\");\n        var second = catalog.Read(\"uno\");\n        var reads = provider.GetRequiredService<MemoryCatalog>().Reads;\n        return new TextBlock { Text = $\"First: {first}\\nSecond: {second}\\nUnderlying reads: {reads}\", FontSize = 22,\n            TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic interface ICatalog { string Read(string key); }\npublic sealed class MemoryCatalog : ICatalog\n{\n    public int Reads { get; private set; }\n    public string Read(string key) { Reads++; return \"Entry: \" + key; }\n}\npublic sealed class CachedCatalog : ICatalog\n{\n    private readonly ICatalog _inner;\n    private readonly Dictionary<string, string> _cache = new(StringComparer.Ordinal);\n    public CachedCatalog(ICatalog inner) => _inner = inner;\n    public string Read(string key)\n    {\n        if (_cache.TryGetValue(key, out var value)) return value;\n        return _cache[key] = _inner.Read(key);\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddSingleton<MemoryCatalog>();\n        services.AddSingleton<ICatalog>(p => new CachedCatalog(p.GetRequiredService<MemoryCatalog>()));\n        using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });\n        var catalog = provider.GetRequiredService<ICatalog>();\n        var first = catalog.Read(\"uno\");\n        var second = catalog.Read(\"xaml\");\n        var reads = provider.GetRequiredService<MemoryCatalog>().Reads;\n        return new TextBlock { Text = $\"First: {first}\\nSecond: {second}\\nUnderlying reads: {reads}\", FontSize = 22,\n            TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic interface ICatalog { string Read(string key); }\npublic sealed class MemoryCatalog : ICatalog\n{\n    public int Reads { get; private set; }\n    public string Read(string key) { Reads++; return \"Entry: \" + key; }\n}\npublic sealed class CachedCatalog : ICatalog\n{\n    private readonly ICatalog _inner;\n    private readonly Dictionary<string, string> _cache = new(StringComparer.Ordinal);\n    public CachedCatalog(ICatalog inner) => _inner = inner;\n    public string Read(string key)\n    {\n        if (_cache.TryGetValue(key, out var value)) return value;\n        return _cache[key] = _inner.Read(key);\n    }\n}\n",
    "anchor": "var second = catalog.Read(\"uno\");",
    "challenge": "Read a different key on the second request",
    "rules": [
      {
        "contains": "var second = catalog.Read(\"xaml\");",
        "label": "Read a different key on the second request"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Wrap a capability without recursive resolution or coupling the view to caching.",
      "Read a different key on the second request"
    ],
    "hints": [
      "Locate var second = catalog.Read(\"uno\"); and predict the current behavior.",
      "Try var second = catalog.Read(\"xaml\");; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why does the registration resolve MemoryCatalog rather than ICatalog inside the ICatalog factory?",
      "options": [
        "Resolving the same service from its own factory would recurse",
        "Concrete classes cannot implement interfaces",
        "The cache requires an HTML element"
      ],
      "answer": 0,
      "explanation": "The factory must construct a wrapper around an independently resolvable inner implementation. Asking for ICatalog while constructing ICatalog recursively requests the same unresolved service."
    },
    "source": "dependency-injection",
    "diagram": "pipeline",
    "concepts": [
      [
        "Keep the caller’s contract stable",
        "Both MemoryCatalog and CachedCatalog implement ICatalog. The caller asks for Read(key) and does not need to know whether a cached value or the inner source produced the result. This pattern can add logging, metrics, retry policy, or validation when those behaviors preserve the capability’s observable contract."
      ],
      [
        "Compose a nonrecursive graph",
        "Register the concrete inner source independently, then register ICatalog with a factory that wraps that concrete source. Resolving ICatalog inside its own factory recursively asks for the service being constructed. Make the order and identity of layers explicit when several decorators are involved; caching before authorization can have very different consequences from caching a permission-safe result."
      ],
      [
        "State the cache’s validity and resource policy",
        "A production cache needs capacity, expiration or invalidation, concurrency behavior, and a definition of all inputs that affect a result. The small dictionary in this lesson intentionally omits those policies. It is safe only as a bounded teaching interaction; it should not be copied as an unlimited application-wide cache for arbitrary user data."
      ]
    ],
    "predict": "A screen needs a catalog capability, while the application wants to add caching without changing every caller. Compose a decorator around an inner implementation and observe real call counts. The example uses a tiny synchronous cache to teach composition; it deliberately does not claim to be a thread-safe, bounded, production cache.",
    "transfer": "Wrap an injected repository with a bounded cache or structured-logging decorator. Document the order of authorization, retry, and cache layers, then test behavior and provider wiring independently. Keep measured timing claims separate from the call-count experiment and do not ship the lesson’s unlimited dictionary unchanged.",
    "pitfall": "The demonstration cache is deliberately small and local, not a complete production cache. Define capacity, invalidation, concurrency and tenant boundaries before applying the decorator to real data.",
    "packages": {
      "Microsoft.Extensions.DependencyInjection": "10.0.12"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "dependency-injection"
    ]
  },
  {
    "id": "options-validation",
    "title": "Validate typed settings at the configuration boundary",
    "summary": "Distinguish registering options from constructing and validating their effective value.",
    "track": "app-composition",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\nusing Microsoft.Extensions.Options;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddOptions<PageSettings>()\n            .Configure(settings => settings.PageSize = 200)\n            .Validate(settings => settings.PageSize >= 1 && settings.PageSize <= 100, \"PageSize must be between 1 and 100.\");\n        using var provider = services.BuildServiceProvider();\n        string result;\n        try {\n            var settings = provider.GetRequiredService<IOptions<PageSettings>>().Value;\n            result = $\"Validated page size: {settings.PageSize}\";\n        }\n        catch (OptionsValidationException error) { result = \"Configuration rejected: \" + string.Join(\"; \", error.Failures); }\n        return new TextBlock { Text = result, FontSize = 22, TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic sealed class PageSettings { public int PageSize { get; set; } = 25; }\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing Microsoft.Extensions.DependencyInjection;\nusing Microsoft.Extensions.Options;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var services = new ServiceCollection();\n        services.AddOptions<PageSettings>()\n            .Configure(settings => settings.PageSize = 50)\n            .Validate(settings => settings.PageSize >= 1 && settings.PageSize <= 100, \"PageSize must be between 1 and 100.\");\n        using var provider = services.BuildServiceProvider();\n        string result;\n        try {\n            var settings = provider.GetRequiredService<IOptions<PageSettings>>().Value;\n            result = $\"Validated page size: {settings.PageSize}\";\n        }\n        catch (OptionsValidationException error) { result = \"Configuration rejected: \" + string.Join(\"; \", error.Failures); }\n        return new TextBlock { Text = result, FontSize = 22, TextWrapping = TextWrapping.Wrap, Margin = new Thickness(24) };\n    }\n}\n\npublic sealed class PageSettings { public int PageSize { get; set; } = 25; }\n",
    "anchor": "settings.PageSize = 200",
    "challenge": "Replace the invalid page size with a valid value",
    "rules": [
      {
        "contains": "settings.PageSize = 50",
        "label": "Replace the invalid page size with a valid value"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Distinguish registering options from constructing and validating their effective value.",
      "Replace the invalid page size with a valid value"
    ],
    "hints": [
      "Locate settings.PageSize = 200 and predict the current behavior.",
      "Try settings.PageSize = 50; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "When does this example trigger options validation?",
      "options": [
        "When IOptions<PageSettings>.Value is first constructed/accessed",
        "When the C# file is opened in Monaco",
        "Only when the application shuts down"
      ],
      "answer": 0,
      "explanation": "Registration records configuration and validation actions. The options factory applies them when constructing the value. A hosted ValidateOnStart policy is a separate startup integration, not present in this small provider-only example."
    },
    "source": "configuration",
    "diagram": "pipeline",
    "concepts": [
      [
        "Give settings a typed contract",
        "A PageSettings object makes the intended PageSize value visible to consumers and tests. It does not automatically make every integer valid. Configuration providers supply inputs, options construction assembles them, and validation checks the application’s constraints. Keep defaults and valid ranges documented together so an environment override cannot quietly violate the contract."
      ],
      [
        "Understand when validation actually runs",
        "AddOptions, Configure, and Validate record actions in the service collection. Resolving IOptions<T> and reading Value causes the effective instance to be created and validated in this example. Building a bare provider is not the same as starting a Generic Host. Do not add ValidateOnStart and then assume it ran without actually exercising the corresponding host startup path."
      ],
      [
        "Surface actionable errors without exposing secrets",
        "A configuration error should identify the failed rule and relevant setting without dumping credentials or an entire sensitive configuration object. OptionsValidationException exposes failures that can be logged or shown in a support-friendly startup message. A client bundle cannot keep server secrets confidential, regardless of whether those values are bound to an options class."
      ]
    ],
    "predict": "A list page uses a configured page size. A misspelled setting, an invalid bound, or an environment override should produce a useful configuration error rather than an enormous request or a later layout failure. Use the actual options library to construct a typed settings object and validate it at a clear boundary.",
    "transfer": "In a hosted Uno project, bind a typed settings section, validate individual and cross-field rules, and test the real host startup or first-access path. Decide whether preferences are immutable snapshots or reloadable state, and keep confidential server credentials out of the client configuration bundle.",
    "pitfall": "A valid configuration reload can still disrupt an in-flight operation. Capture the configuration snapshot required by that operation and apply new settings only at a defined boundary.",
    "packages": {
      "Microsoft.Extensions.DependencyInjection": "10.0.12",
      "Microsoft.Extensions.Options": "10.0.12"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/options",
      "https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/Configuration/Overview.html"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "configuration"
    ]
  }
];
