// Authored app-building lessons; each example is a complete single-document lab.
export default [
  {
    "id": "frame-parameters",
    "title": "Navigate with a typed parameter",
    "summary": "Pass a stable destination value and read it in the page lifecycle.",
    "track": "navigation-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var frame = new Frame { Height = 220 };\n        var open = new Button { Content = \"Open task 42\" };\n        open.Click += (_, _) => frame.Navigate(typeof(TaskDetailPage), new TaskTarget(42));\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(open); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed record TaskTarget(int Id);\npublic sealed class TaskDetailPage : Page\n{\n    private readonly TextBlock _title = new() { FontSize = 24, Margin = new Thickness(16) };\n    public TaskDetailPage() => Content = _title;\n    protected override void OnNavigatedTo(Microsoft.UI.Xaml.Navigation.NavigationEventArgs e)\n    {\n        base.OnNavigatedTo(e);\n        _title.Text = e.Parameter is TaskTarget target ? $\"Task details: {target.Id}\" : \"Missing task parameter\";\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var frame = new Frame { Height = 220 };\n        var open = new Button { Content = \"Open task 42\" };\n        open.Click += (_, _) => frame.Navigate(typeof(TaskDetailPage), new TaskTarget(84));\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(open); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed record TaskTarget(int Id);\npublic sealed class TaskDetailPage : Page\n{\n    private readonly TextBlock _title = new() { FontSize = 24, Margin = new Thickness(16) };\n    public TaskDetailPage() => Content = _title;\n    protected override void OnNavigatedTo(Microsoft.UI.Xaml.Navigation.NavigationEventArgs e)\n    {\n        base.OnNavigatedTo(e);\n        _title.Text = e.Parameter is TaskTarget target ? $\"Task details: {target.Id}\" : \"Missing task parameter\";\n    }\n}\n",
    "anchor": "new TaskTarget(42)",
    "challenge": "Navigate to task 84 using the typed parameter",
    "rules": [
      {
        "contains": "new TaskTarget(84)",
        "label": "Navigate to task 84 using the typed parameter"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Pass a stable destination value and read it in the page lifecycle.",
      "Navigate to task 84 using the typed parameter"
    ],
    "hints": [
      "Locate new TaskTarget(42) and predict the current behavior.",
      "Try new TaskTarget(84); then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Where should navigation parameters be inspected in this Page?",
      "options": [
        "OnNavigatedTo, where NavigationEventArgs carries the parameter",
        "In a random TextBlock getter",
        "Only when the application exits"
      ],
      "answer": 0,
      "explanation": "The navigation lifecycle supplies the parameter with the transition. Constructor state and navigation parameters are different inputs."
    },
    "source": "navigation",
    "diagram": "pipeline",
    "concepts": [
      [
        "Describe the destination, not the control",
        "A stable task ID is sufficient to request details in this lesson. Passing a ListViewItem or a whole live view model creates ownership and restoration problems: the destination becomes coupled to the previous view’s object graph. Prefer a typed descriptor that expresses intent and can be checked before data is loaded."
      ],
      [
        "Read context at navigation time",
        "A Page constructor creates its local visual structure. OnNavigatedTo receives the parameter for the transition and is the appropriate place to interpret navigation context. A cached Page can receive new parameters without matching your assumption about constructor frequency, so do not capture destination state only in construction code."
      ],
      [
        "Validate before loading domain data",
        "The parameter is an input boundary. Check its type, required fields, and domain constraints, then request data through an injected service. A well-typed ID still does not prove that the entity exists or that the user may access it. Represent missing, unauthorized, loading, and failed outcomes explicitly in the destination state."
      ]
    ],
    "predict": "A task list opens details for one item. The destination should receive a stable description of the task, not a reference to the selected ListView container. Use a typed parameter, validate it at the destination, and distinguish page construction from navigation activation before adding asynchronous loading or state restoration.",
    "transfer": "Create a typed task-details route and a repository-backed view model. Test valid, missing, stale, and unauthorized IDs, then test rapid navigation between targets. Keep the parameter compact and the destination’s asynchronous work owned by its activation.",
    "pitfall": "Passing the correct typed parameter does not prevent stale asynchronous loading. The destination must own cancellation and decide which activation may apply a result.",
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/basics/navigate-between-two-pages"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "navigation"
    ]
  },
  {
    "id": "frame-history",
    "title": "Design back navigation as a history contract",
    "summary": "Coordinate BackStack, forward navigation, and current destination state.",
    "track": "navigation-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var frame = new Frame { Height = 200 };\n        var report = new TextBlock { Text = \"History is empty\" };\n        var open = new Button { Content = \"Open another page\" };\n        var back = new Button { Content = \"Go back\", IsEnabled = false };\n        var sequence = 0;\n        void Report() { back.IsEnabled = frame.CanGoBack; report.Text = $\"Back entries: {frame.BackStack.Count}\"; }\n        open.Click += (_, _) => { frame.Navigate(typeof(HistoryPage), \"Visit \" + ++sequence); Report(); };\n        back.Click += (_, _) => { if (frame.CanGoBack) frame.GoBack(); Report(); };\n        frame.Navigated += (_, _) => Report();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(open); root.Children.Add(back); root.Children.Add(report); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed class HistoryPage : Page\n{\n    private readonly TextBlock _title = new() { FontSize = 24, Margin = new Thickness(16) };\n    public HistoryPage() => Content = _title;\n    protected override void OnNavigatedTo(Microsoft.UI.Xaml.Navigation.NavigationEventArgs e)\n    {\n        base.OnNavigatedTo(e); _title.Text = e.Parameter as string ?? \"Unknown visit\";\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var frame = new Frame { Height = 200 };\n        var report = new TextBlock { Text = \"History is empty\" };\n        var open = new Button { Content = \"Open another page\" };\n        var back = new Button { Content = \"Go back\", IsEnabled = false };\n        var sequence = 0;\n        void Report() { back.IsEnabled = frame.CanGoBack; report.Text = $\"Back entries: {frame.BackStack.Count}\"; }\n        open.Click += (_, _) => { frame.Navigate(typeof(HistoryPage), \"Task view \" + ++sequence); Report(); };\n        back.Click += (_, _) => { if (frame.CanGoBack) frame.GoBack(); Report(); };\n        frame.Navigated += (_, _) => Report();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(open); root.Children.Add(back); root.Children.Add(report); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed class HistoryPage : Page\n{\n    private readonly TextBlock _title = new() { FontSize = 24, Margin = new Thickness(16) };\n    public HistoryPage() => Content = _title;\n    protected override void OnNavigatedTo(Microsoft.UI.Xaml.Navigation.NavigationEventArgs e)\n    {\n        base.OnNavigatedTo(e); _title.Text = e.Parameter as string ?? \"Unknown visit\";\n    }\n}\n",
    "anchor": "\"Visit \" + ++sequence",
    "challenge": "Label each history entry as a task view",
    "rules": [
      {
        "contains": "\"Task view \" + ++sequence",
        "label": "Label each history entry as a task view"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Coordinate BackStack, forward navigation, and current destination state.",
      "Label each history entry as a task view"
    ],
    "hints": [
      "Locate \"Visit \" + ++sequence and predict the current behavior.",
      "Try \"Task view \" + ++sequence; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Should Back be invoked when CanGoBack is false?",
      "options": [
        "No; the action should be unavailable or handled explicitly",
        "Yes, to manufacture an earlier page",
        "Only when the page contains a TextBox"
      ],
      "answer": 0,
      "explanation": "A back action depends on the actual navigation history. Check availability and define root-level behavior rather than assuming an entry exists."
    },
    "source": "navigation",
    "diagram": "pipeline",
    "concepts": [
      [
        "Observe history rather than guessing",
        "Frame owns its navigation history. A page’s constructor count or the number of menu clicks is not a reliable substitute for BackStack and CanGoBack. Other transitions, failed requests, state restoration, and explicit history edits can change the relationship. Let the shell project the current Frame state into its back-button availability."
      ],
      [
        "Treat Back as a distinct transition",
        "GoBack uses an existing entry and its parameter; Navigate creates a new forward request. Calling Navigate to a familiar Page type is not the same as returning to its historical instance or state. Keep the distinction visible in navigation services, tests, and analytics so repeated route requests do not accidentally inflate the back stack."
      ],
      [
        "Keep shell state synchronized",
        "Use navigation events to refresh the shell after accepted transitions, including those initiated outside its buttons. A deep link, keyboard gesture, or platform back request may change the current destination. Avoid updating a separate counter optimistically before navigation succeeds, or the UI may enable Back while the Frame cannot perform it."
      ]
    ],
    "predict": "A shell exposes a Back action, but history is not simply the number of pages you constructed. Observe Frame history as destinations are opened and revisited, update action availability from the actual state, and distinguish going back from issuing another forward navigation to a page that happens to look similar.",
    "transfer": "Connect back navigation to NavigationView and a keyboard action, derive availability from Frame state, and test root behavior. Add validated restoration and distinguish application-level history from modal dismissal and nested-region history.",
    "pitfall": "A historical route may refer to a deleted entity or a destination that is no longer authorized. Validate restored entries and define a fallback rather than assuming history guarantees availability.",
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/basics/navigation-history-and-backwards-navigation"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "navigation"
    ]
  },
  {
    "id": "route-registry",
    "title": "Register routes instead of activating arbitrary names",
    "summary": "Use an explicit route table and understand Uno.Extensions ViewMap and RouteMap roles.",
    "track": "navigation-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var routes = new Dictionary<string, Type>(StringComparer.Ordinal) { [\"Tasks\"] = typeof(TasksRoutePage), [\"Reports\"] = typeof(ReportsRoutePage) };\n        var input = new TextBox { Header = \"Registered route\", Text = \"Tasks\" };\n        var frame = new Frame { Height = 200 };\n        var status = new TextBlock { Text = \"No request yet\" };\n        var go = new Button { Content = \"Resolve route\" };\n        go.Click += (_, _) => {\n            if (!routes.TryGetValue(input.Text, out var target)) { status.Text = \"Unknown route\"; return; }\n            status.Text = frame.Navigate(target) ? \"Accepted: \" + input.Text : \"Navigation rejected\";\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(go); root.Children.Add(status); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed class TasksRoutePage : Page { public TasksRoutePage() => Content = new TextBlock { Text = \"Tasks destination\", FontSize = 24 }; }\npublic sealed class ReportsRoutePage : Page { public ReportsRoutePage() => Content = new TextBlock { Text = \"Reports destination\", FontSize = 24 }; }\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var routes = new Dictionary<string, Type>(StringComparer.Ordinal) { [\"Tasks\"] = typeof(TasksRoutePage), [\"Reports\"] = typeof(ReportsRoutePage) };\n        var input = new TextBox { Header = \"Registered route\", Text = \"Reports\" };\n        var frame = new Frame { Height = 200 };\n        var status = new TextBlock { Text = \"No request yet\" };\n        var go = new Button { Content = \"Resolve route\" };\n        go.Click += (_, _) => {\n            if (!routes.TryGetValue(input.Text, out var target)) { status.Text = \"Unknown route\"; return; }\n            status.Text = frame.Navigate(target) ? \"Accepted: \" + input.Text : \"Navigation rejected\";\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(go); root.Children.Add(status); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed class TasksRoutePage : Page { public TasksRoutePage() => Content = new TextBlock { Text = \"Tasks destination\", FontSize = 24 }; }\npublic sealed class ReportsRoutePage : Page { public ReportsRoutePage() => Content = new TextBlock { Text = \"Reports destination\", FontSize = 24 }; }\n",
    "anchor": "Text = \"Tasks\"",
    "challenge": "Start from the registered Reports route",
    "rules": [
      {
        "contains": "Text = \"Reports\"",
        "label": "Start from the registered Reports route"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Use an explicit route table and understand Uno.Extensions ViewMap and RouteMap roles.",
      "Start from the registered Reports route"
    ],
    "hints": [
      "Locate Text = \"Tasks\" and predict the current behavior.",
      "Try Text = \"Reports\"; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "What does an explicit route table prevent?",
      "options": [
        "Blindly treating any input string as an activatable type",
        "Every possible authorization failure",
        "The need to handle navigation results"
      ],
      "answer": 0,
      "explanation": "A registry constrains names to approved destinations. It does not replace authorization, data validation, or handling rejected transitions."
    },
    "source": "navigation",
    "diagram": "pipeline",
    "concepts": [
      [
        "Separate public names from implementation types",
        "A stable route name can survive a view-class rename and can be validated before activation. Keep the accepted names in an explicit registry. Do not call Type.GetType on untrusted route input and instantiate whatever it resolves. The registry is a structural boundary that makes supported destinations discoverable and testable."
      ],
      [
        "Keep view mapping distinct from route structure",
        "Uno.Extensions separates view/model association from route topology. ViewMap connects types; RouteMap can describe names, nested regions, default destinations, and dependencies. The tiny dictionary lab intentionally omits that full region system. Read the official extension documentation when moving from a core Frame example to a project configured with Navigation."
      ],
      [
        "Handle lookup and transition outcomes separately",
        "A route can be known while its transition is rejected or fails. Check both lookup and navigation outcome. Keep menu selection aligned with the accepted destination, and avoid marking a route active before the host confirms the transition. Parameter validation and authorization remain independent even when the route itself is registered."
      ]
    ],
    "predict": "A route name should describe an approved destination, not serve as an arbitrary reflection instruction. Build a small registry over real Frame navigation, then compare it with Uno.Extensions.Navigation: ViewMap associates view and model types, while RouteMap describes named and nested routes. The browser experiment demonstrates the core contract without pretending that the extensions package is installed.",
    "transfer": "Create an Uno project with the Navigation feature and translate the explicit mappings into ViewMap and RouteMap registrations. Add typed data maps only where needed, test unknown and nested routes, and keep the browser dictionary example labeled as a core-Frame teaching subset.",
    "pitfall": "The local allowlist is not an implementation of Uno.Extensions routing. In a full project, validate actual ViewMap/RouteMap registrations and test that every shell item resolves to the intended destination.",
    "references": [
      "https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/Navigation/HowTo-DefineRoutes.html",
      "https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/Navigation/HowTo-NavigateInCode.html"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "navigation"
    ]
  },
  {
    "id": "deep-link-contracts",
    "title": "Validate deep links as external input",
    "summary": "Parse a URI into a bounded typed destination before navigation.",
    "track": "navigation-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var input = new TextBox { Header = \"Task link\", Text = \"learnuno://task/42\" };\n        var output = new TextBlock { Text = \"No link processed\", TextWrapping = TextWrapping.Wrap };\n        var parse = new Button { Content = \"Validate link\" };\n        parse.Click += (_, _) => {\n            var valid = Uri.TryCreate(input.Text, UriKind.Absolute, out var uri) && uri.Scheme == \"learnuno\" && uri.Host == \"task\" &&\n                string.IsNullOrEmpty(uri.Query) && string.IsNullOrEmpty(uri.Fragment) &&\n                int.TryParse(Uri.UnescapeDataString(uri.AbsolutePath).Trim('/'), System.Globalization.NumberStyles.None, System.Globalization.CultureInfo.InvariantCulture, out var id) && id > 0;\n            output.Text = valid ? \"Accepted task link\" : \"Rejected: expected learnuno://task/<positive integer>\";\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(parse); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var input = new TextBox { Header = \"Task link\", Text = \"learnuno://task/84\" };\n        var output = new TextBlock { Text = \"No link processed\", TextWrapping = TextWrapping.Wrap };\n        var parse = new Button { Content = \"Validate link\" };\n        parse.Click += (_, _) => {\n            var valid = Uri.TryCreate(input.Text, UriKind.Absolute, out var uri) && uri.Scheme == \"learnuno\" && uri.Host == \"task\" &&\n                string.IsNullOrEmpty(uri.Query) && string.IsNullOrEmpty(uri.Fragment) &&\n                int.TryParse(Uri.UnescapeDataString(uri.AbsolutePath).Trim('/'), System.Globalization.NumberStyles.None, System.Globalization.CultureInfo.InvariantCulture, out var id) && id > 0;\n            output.Text = valid ? \"Accepted task link\" : \"Rejected: expected learnuno://task/<positive integer>\";\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(parse); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "anchor": "Text = \"learnuno://task/42\"",
    "challenge": "Start from a deep link identifying task 84",
    "rules": [
      {
        "contains": "Text = \"learnuno://task/84\"",
        "label": "Start from a deep link identifying task 84"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Parse a URI into a bounded typed destination before navigation.",
      "Start from a deep link identifying task 84"
    ],
    "hints": [
      "Locate Text = \"learnuno://task/42\" and predict the current behavior.",
      "Try Text = \"learnuno://task/84\"; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Does a syntactically valid deep link authorize access to its entity?",
      "options": [
        "No; existence and authorization must still be checked",
        "Yes, because Uri parsed it",
        "Only when the ID is an integer"
      ],
      "answer": 0,
      "explanation": "URI parsing validates representation and route policy. It does not establish identity, permissions, or current entity existence."
    },
    "source": "interop",
    "diagram": "pipeline",
    "concepts": [
      [
        "Treat activation data as untrusted",
        "A deep link may come from a browser, another application, a document, or copied text. Its presence does not prove it was created by your UI. Parse with a URI API, bound its size at the application boundary, and allow only the schemes and route shapes your product supports. Keep arbitrary type activation and command execution out of the parser."
      ],
      [
        "Define decoding and optional-field policy",
        "Percent decoding, path separators, query fields, and fragments can change interpretation. Decode at a deliberate point and validate the resulting path shape. This simple grammar accepts one positive Int32 task identifier and rejects query strings and fragments. Expanding the grammar later should be a reviewed contract change, not an accidental side effect of permissive parsing."
      ],
      [
        "Resolve domain state after parsing",
        "A parsed task key is only a request. Load the entity, verify authorization, and handle missing or deleted data before presenting an editable view. Authentication may need to complete first, after which the original validated destination can be resumed. Avoid trusting an ID simply because it came from your own application’s custom scheme."
      ]
    ],
    "predict": "An external link can arrive before the app’s normal menu flow and can contain malformed, obsolete, or unauthorized data. Parse it into a typed request before activating a view. Define the supported scheme, host, path, and optional fields explicitly, then test decoding and rejection behavior rather than treating any URI-shaped string as a trustworthy destination.",
    "transfer": "Build a typed deep-link parser with a table of accepted and rejected cases, then integrate it with Uno.Extensions DataViewMap query conversion in a configured project. Test cold startup, warm activation, dirty-state guards, missing data, and superseded requests. Never pass raw route strings directly into reflection.",
    "pitfall": "A syntactically accepted external URI does not grant authorization or override an unsaved-edit guard. Route external intent through the same state-preservation and access-control policies as internal navigation.",
    "references": [
      "https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/Navigation/HowTo-DefineRoutes.html"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "browser-interop"
    ]
  },
  {
    "id": "navigation-guards",
    "title": "Protect drafts with an awaited navigation guard",
    "summary": "Serialize leave decisions and navigate only after the decision is accepted.",
    "track": "navigation-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var frame = new Frame { Height = 180 };\n        var status = new TextBlock { Text = \"Edit the draft, then request navigation\" };\n        var leave = new Button { Content = \"Leave editor\" };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Loaded += (_, _) => { if (frame.Content is null) frame.Navigate(typeof(GuardedEditorPage)); };\n        leave.Click += async (_, _) => {\n            leave.IsEnabled = false;\n            try {\n                if (frame.Content is GuardedEditorPage editor && editor.IsDirty) {\n                    var dialog = new ContentDialog { Title = \"Discard unsaved edits?\", PrimaryButtonText = \"Discard and leave\", CloseButtonText = \"Stay\", XamlRoot = root.XamlRoot };\n                    if (await dialog.ShowAsync() != ContentDialogResult.Primary) { status.Text = \"Stayed in editor\"; return; }\n                }\n                status.Text = frame.Navigate(typeof(GuardedDestinationPage)) ? \"Navigation accepted\" : \"Navigation rejected\";\n            }\n            catch (Exception error) { status.Text = \"Navigation failed: \" + error.Message; }\n            finally { leave.IsEnabled = true; }\n        };\n        root.Children.Add(leave); root.Children.Add(status); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed class GuardedEditorPage : Page\n{\n    private readonly TextBox _input = new() { Header = \"Draft\", Text = \"Original\" };\n    public bool IsDirty => _input.Text != \"Original\";\n    public GuardedEditorPage() => Content = _input;\n}\npublic sealed class GuardedDestinationPage : Page\n{\n    public GuardedDestinationPage() => Content = new TextBlock { Text = \"Destination opened\", FontSize = 24 };\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var frame = new Frame { Height = 180 };\n        var status = new TextBlock { Text = \"Edit the draft, then request navigation\" };\n        var leave = new Button { Content = \"Leave editor\" };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Loaded += (_, _) => { if (frame.Content is null) frame.Navigate(typeof(GuardedEditorPage)); };\n        leave.Click += async (_, _) => {\n            leave.IsEnabled = false;\n            try {\n                if (frame.Content is GuardedEditorPage editor && editor.IsDirty) {\n                    var dialog = new ContentDialog { Title = \"Discard unsaved edits?\", PrimaryButtonText = \"Discard and leave\", CloseButtonText = \"Keep editing\", XamlRoot = root.XamlRoot };\n                    if (await dialog.ShowAsync() != ContentDialogResult.Primary) { status.Text = \"Stayed in editor\"; return; }\n                }\n                status.Text = frame.Navigate(typeof(GuardedDestinationPage)) ? \"Navigation accepted\" : \"Navigation rejected\";\n            }\n            catch (Exception error) { status.Text = \"Navigation failed: \" + error.Message; }\n            finally { leave.IsEnabled = true; }\n        };\n        root.Children.Add(leave); root.Children.Add(status); root.Children.Add(frame); return root;\n    }\n}\n\npublic sealed class GuardedEditorPage : Page\n{\n    private readonly TextBox _input = new() { Header = \"Draft\", Text = \"Original\" };\n    public bool IsDirty => _input.Text != \"Original\";\n    public GuardedEditorPage() => Content = _input;\n}\npublic sealed class GuardedDestinationPage : Page\n{\n    public GuardedDestinationPage() => Content = new TextBlock { Text = \"Destination opened\", FontSize = 24 };\n}\n",
    "anchor": "CloseButtonText = \"Stay\"",
    "challenge": "Make the rejected-navigation action explicitly say Keep editing",
    "rules": [
      {
        "contains": "CloseButtonText = \"Keep editing\"",
        "label": "Make the rejected-navigation action explicitly say Keep editing"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Serialize leave decisions and navigate only after the decision is accepted.",
      "Make the rejected-navigation action explicitly say Keep editing"
    ],
    "hints": [
      "Locate CloseButtonText = \"Stay\" and predict the current behavior.",
      "Try CloseButtonText = \"Keep editing\"; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "When should navigation occur after asking to discard edits?",
      "options": [
        "Only after an accepted decision",
        "Before the dialog is shown",
        "Whenever the editor is dirty"
      ],
      "answer": 0,
      "explanation": "The prompt requests a decision. Keep the current destination and draft until the result permits the transition."
    },
    "source": "navigation",
    "diagram": "pipeline",
    "concepts": [
      [
        "Evaluate the state before leaving",
        "The current editor exposes whether its draft differs from the baseline. The navigation request asks the guard before replacing the page. Keep that state in a model in a production app rather than extracting arbitrary controls from the visual tree. A guard is part of navigation policy and should apply consistently to menu, back, and external-link requests."
      ],
      [
        "Await the decision without blocking",
        "A dialog result is asynchronous. Await it from a Task-aware navigation operation and avoid blocking the UI thread with Result or Wait. Synchronous framework cancellation hooks cannot simply be turned into asynchronous approval by adding an unobserved async handler; use the framework’s supported deferral mechanism or coordinate the request before navigation."
      ],
      [
        "Serialize competing requests",
        "Disable or gate navigation requests while a decision is pending. In a larger shell, use a centralized transition coordinator because multiple buttons and deep links can request navigation concurrently. Decide whether a newer request replaces, queues behind, or is rejected by the pending one. A local disabled button alone does not govern every possible input path."
      ]
    ],
    "predict": "A user has edited a draft and clicks another destination. A guard must not destroy the draft before the user decides, and repeated clicks must not open overlapping prompts. Build a real Frame transition with an awaited ContentDialog decision, then distinguish staying, discarding, saving, and failing as separate outcomes.",
    "transfer": "Extract an awaitable guard interface from the view, use a dialog adapter for decisions, and test all navigation sources through one coordinator. Add a Save path with failure tests and preserve the distinction between cancelling navigation, cancelling editing, and cancelling I/O.",
    "pitfall": "A user choosing Save does not imply that saving succeeded. Under a save-before-leave policy, a failed write must stop navigation and retain the draft for correction or retry.",
    "references": [
      "https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/Navigation/NavigationOverview.html"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "navigation"
    ]
  },
  {
    "id": "navigation-results",
    "title": "Return a typed result from a selection flow",
    "summary": "Model accepted, cancelled, and abandoned selection outcomes explicitly.",
    "track": "navigation-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var host = new ContentControl();\n        var output = new TextBlock { Text = \"No result yet\" };\n        var open = new Button { Content = \"Choose workspace\" };\n        TaskCompletionSource<SelectionResult>? pending = null;\n        open.Click += async (_, _) => {\n            if (pending is not null) return;\n            var completion = new TaskCompletionSource<SelectionResult>(TaskCreationOptions.RunContinuationsAsynchronously);\n            pending = completion; open.IsEnabled = false;\n            var options = new ComboBox { Header = \"Workspace\", ItemsSource = new[] { \"Design\", \"Engineering\" }, SelectedIndex = 0 };\n            var accept = new Button { Content = \"Use workspace\" };\n            var cancel = new Button { Content = \"Cancel picker\" };\n            accept.Click += (_, _) => completion.TrySetResult(new SelectionResult(true, options.SelectedItem as string));\n            cancel.Click += (_, _) => completion.TrySetResult(new SelectionResult(false, null));\n            var picker = new StackPanel { Spacing = 8 }; picker.Children.Add(options); picker.Children.Add(accept); picker.Children.Add(cancel); host.Content = picker;\n            try { var result = await completion.Task; output.Text = result.Accepted ? \"Chosen: \" + result.Value : \"Picker cancelled\"; }\n            finally { if (ReferenceEquals(pending, completion)) pending = null; host.Content = null; open.IsEnabled = true; }\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => pending?.TrySetResult(new SelectionResult(false, null));\n        root.Children.Add(open); root.Children.Add(output); root.Children.Add(host); return root;\n    }\n}\n\npublic sealed record SelectionResult(bool Accepted, string? Value);\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var host = new ContentControl();\n        var output = new TextBlock { Text = \"No result yet\" };\n        var open = new Button { Content = \"Choose workspace\" };\n        TaskCompletionSource<SelectionResult>? pending = null;\n        open.Click += async (_, _) => {\n            if (pending is not null) return;\n            var completion = new TaskCompletionSource<SelectionResult>(TaskCreationOptions.RunContinuationsAsynchronously);\n            pending = completion; open.IsEnabled = false;\n            var options = new ComboBox { Header = \"Workspace\", ItemsSource = new[] { \"Design\", \"Engineering\" }, SelectedIndex = 1 };\n            var accept = new Button { Content = \"Use workspace\" };\n            var cancel = new Button { Content = \"Cancel picker\" };\n            accept.Click += (_, _) => completion.TrySetResult(new SelectionResult(true, options.SelectedItem as string));\n            cancel.Click += (_, _) => completion.TrySetResult(new SelectionResult(false, null));\n            var picker = new StackPanel { Spacing = 8 }; picker.Children.Add(options); picker.Children.Add(accept); picker.Children.Add(cancel); host.Content = picker;\n            try { var result = await completion.Task; output.Text = result.Accepted ? \"Chosen: \" + result.Value : \"Picker cancelled\"; }\n            finally { if (ReferenceEquals(pending, completion)) pending = null; host.Content = null; open.IsEnabled = true; }\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => pending?.TrySetResult(new SelectionResult(false, null));\n        root.Children.Add(open); root.Children.Add(output); root.Children.Add(host); return root;\n    }\n}\n\npublic sealed record SelectionResult(bool Accepted, string? Value);\n",
    "anchor": "SelectedIndex = 0",
    "challenge": "Start the picker on Engineering",
    "rules": [
      {
        "contains": "SelectedIndex = 1",
        "label": "Start the picker on Engineering"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Model accepted, cancelled, and abandoned selection outcomes explicitly.",
      "Start the picker on Engineering"
    ],
    "hints": [
      "Locate SelectedIndex = 0 and predict the current behavior.",
      "Try SelectedIndex = 1; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why use TrySetResult for competing completion paths?",
      "options": [
        "Only the first completion wins without throwing on a later duplicate attempt",
        "It automatically validates every payload",
        "It makes the task run on a dedicated UI thread"
      ],
      "answer": 0,
      "explanation": "Accept, cancel, and lifetime cleanup can race to complete a request. TrySetResult safely reports whether this call completed the Task; payload validity and threading are separate concerns."
    },
    "source": "navigation",
    "diagram": "pipeline",
    "concepts": [
      [
        "Model the caller’s continuation",
        "The caller starts a selection workflow and awaits one result before applying the choice. Keep the requested operation distinct from the visual mechanism used to display it: a dialog, page, flyout, or inline picker can implement the same result contract. This makes the caller testable without constructing the picker UI."
      ],
      [
        "Represent cancellation separately",
        "An accepted result and a cancelled workflow have different meaning. A nullable payload alone can be ambiguous when null is also a legitimate value. Use an outcome type or discriminated representation that makes acceptance explicit, then validate required data on the accepted path. Dismissal should not accidentally apply a default choice."
      ],
      [
        "Complete once and coordinate reentrancy",
        "Event-based workflows can receive Accept, Cancel, and owner-unload signals. TrySetResult allows the first terminal path to win without throwing when another path arrives later. RunContinuationsAsynchronously avoids running the caller’s continuation inline inside the button event that completes the Task, reducing surprising reentrancy while the picker is still handling input."
      ]
    ],
    "predict": "A settings screen asks a nested flow to choose a workspace and then continues with a result. Returning only a nullable string can confuse cancellation with a missing value, so define an explicit result contract. The lab uses a ContentControl picker and TaskCompletionSource to expose the underlying pattern; Uno.Extensions provides result-navigation abstractions in a configured project.",
    "transfer": "Create an injected selection service returning a typed result and test it without UI. Implement adapters for ContentDialog and Uno.Extensions result navigation, then test duplicate completion and abandoned owners. Keep the local TaskCompletionSource example scoped as an event-to-task pattern rather than a full navigation framework.",
    "pitfall": "An abandoned picker must still terminate its pending request and release references. Test unload and duplicate completion paths; an unresolved Task can retain state and strand the caller.",
    "references": [
      "https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/Navigation/HowTo-DefineRoutes.html"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "navigation"
    ]
  }
];
