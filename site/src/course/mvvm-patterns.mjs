// Authored app-building lessons; each example is a complete single-document lab.
export default [
  {
    "id": "toolkit-observable",
    "title": "Use ObservableObject without hiding the notification contract",
    "summary": "Implement equality-guarded properties and dependent notifications with the MVVM Toolkit.",
    "track": "mvvm-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new CounterViewModel();\n        var output = new TextBlock { FontSize = 24 };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Summary\"), Mode = BindingMode.OneWay });\n        var increment = new Button { Content = \"Increment model\" };\n        increment.Click += (_, _) => model.Count += 1;\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(output); root.Children.Add(increment); return root;\n    }\n}\n\npublic sealed class CounterViewModel : ObservableObject\n{\n    private int _count;\n    public int Count\n    {\n        get => _count;\n        set { if (SetProperty(ref _count, value)) OnPropertyChanged(nameof(Summary)); }\n    }\n    public string Summary => $\"Count {Count}; doubled {Count * 2}\";\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new CounterViewModel();\n        var output = new TextBlock { FontSize = 24 };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Summary\"), Mode = BindingMode.OneWay });\n        var increment = new Button { Content = \"Increment model\" };\n        increment.Click += (_, _) => model.Count += 3;\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(output); root.Children.Add(increment); return root;\n    }\n}\n\npublic sealed class CounterViewModel : ObservableObject\n{\n    private int _count;\n    public int Count\n    {\n        get => _count;\n        set { if (SetProperty(ref _count, value)) OnPropertyChanged(nameof(Summary)); }\n    }\n    public string Summary => $\"Count {Count}; doubled {Count * 2}\";\n}\n",
    "anchor": "model.Count += 1",
    "challenge": "Increase the observable count by three per action",
    "rules": [
      {
        "contains": "model.Count += 3",
        "label": "Increase the observable count by three per action"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Implement equality-guarded properties and dependent notifications with the MVVM Toolkit.",
      "Increase the observable count by three per action"
    ],
    "hints": [
      "Locate model.Count += 1 and predict the current behavior.",
      "Try model.Count += 3; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why notify Summary after Count changes?",
      "options": [
        "A calculated property still needs notification when its dependencies change",
        "ObservableObject can never bind strings",
        "Every property is automatically re-read every frame"
      ],
      "answer": 0,
      "explanation": "The getter calculates a value when read. The binding needs a notification telling it to read Summary again after Count changes."
    },
    "source": "binding",
    "diagram": "pipeline",
    "concepts": [
      [
        "Keep presentation state outside controls",
        "The view model owns Count and the derived Summary; the TextBlock only displays Summary. This makes the state transition testable without constructing a Window. ObservableObject reduces repetitive event code but does not decide which properties belong together or where domain rules should live. Keep UI handles and renderer-specific objects out of the presentation state."
      ],
      [
        "Use the equality guard intentionally",
        "SetProperty returns whether the value actually changed. Guard follow-up notifications and expensive recomputation with that result so assigning the same Count does not create redundant work. Equality is part of the model contract: reference equality, record equality, and custom comparers can have different meanings for larger property values. Do not turn every assignment into a mandatory redraw."
      ],
      [
        "Notify every exposed dependency",
        "A calculated getter is not automatically observable just because it uses observable properties. Raise Summary when Count changes; for a total depending on Quantity and Price, either setter must notify Total. Source generators can express these relationships declaratively, but the generated code still implements this underlying notification contract."
      ]
    ],
    "predict": "You already know INotifyPropertyChanged. Now use CommunityToolkit.Mvvm to remove boilerplate while keeping the contract visible. Build a counter whose displayed Summary depends on Count, then inspect exactly which notifications must be raised. The live example uses the real ObservableObject class, not a locally renamed imitation or a source generator that never ran.",
    "transfer": "Extract the counter model into a test project and assert value changes and notification names. Then implement a Quantity/Price/Total model in both handwritten and generated forms. Keep the same tests and inspect the generated output rather than attributing correctness to syntax alone.",
    "pitfall": "ObservableProperty attributes require a compatible partial type and a project build that runs the source generator. The browser compiler does not generate members from those attributes, so its runnable example uses explicit properties.",
    "packages": {
      "CommunityToolkit.Mvvm": "8.4.0"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/observableobject"
    ],
    "projectCode": "using CommunityToolkit.Mvvm.ComponentModel;\n\npublic partial class GeneratedCounterViewModel : ObservableObject\n{\n    [ObservableProperty]\n    [NotifyPropertyChangedFor(nameof(Summary))]\n    private int count;\n\n    public string Summary => $\"Count {Count}; doubled {Count * 2}\";\n}",
    "projectNote": "Complete model class for a project with CommunityToolkit.Mvvm 8.4.0 and its source generator enabled. The dynamic playground uses the explicit-property version above.",
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "change-notification"
    ]
  },
  {
    "id": "toolkit-commands",
    "title": "Make command availability an observable contract",
    "summary": "Use RelayCommand and NotifyCanExecuteChanged instead of wiring business actions into controls.",
    "track": "mvvm-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new TitleCommandModel();\n        var input = new TextBox { Header = \"Task title\" };\n        input.TextChanged += (_, _) => model.Title = input.Text;\n        var save = new Button { Content = \"Create task\", Command = model.Create };\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Result\"), Mode = BindingMode.OneWay });\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(save); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class TitleCommandModel : ObservableObject\n{\n    private string _title = \"\";\n    private string _result = \"Enter a valid title to enable the command.\";\n    public TitleCommandModel() => Create = new RelayCommand(() => Result = \"Created: \" + Title.Trim(), () => Title.Trim().Length >= 3);\n    public RelayCommand Create { get; }\n    public string Title { get => _title; set { if (SetProperty(ref _title, value)) Create.NotifyCanExecuteChanged(); } }\n    public string Result { get => _result; private set => SetProperty(ref _result, value); }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new TitleCommandModel();\n        var input = new TextBox { Header = \"Task title\" };\n        input.TextChanged += (_, _) => model.Title = input.Text;\n        var save = new Button { Content = \"Create task\", Command = model.Create };\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Result\"), Mode = BindingMode.OneWay });\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(save); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class TitleCommandModel : ObservableObject\n{\n    private string _title = \"\";\n    private string _result = \"Enter a valid title to enable the command.\";\n    public TitleCommandModel() => Create = new RelayCommand(() => Result = \"Created: \" + Title.Trim(), () => Title.Trim().Length >= 5);\n    public RelayCommand Create { get; }\n    public string Title { get => _title; set { if (SetProperty(ref _title, value)) Create.NotifyCanExecuteChanged(); } }\n    public string Result { get => _result; private set => SetProperty(ref _result, value); }\n}\n",
    "anchor": "Title.Trim().Length >= 3",
    "challenge": "Require five trimmed characters before Create can execute",
    "rules": [
      {
        "contains": "Title.Trim().Length >= 5",
        "label": "Require five trimmed characters before Create can execute"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Use RelayCommand and NotifyCanExecuteChanged instead of wiring business actions into controls.",
      "Require five trimmed characters before Create can execute"
    ],
    "hints": [
      "Locate Title.Trim().Length >= 3 and predict the current behavior.",
      "Try Title.Trim().Length >= 5; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "What makes an existing button reevaluate command availability?",
      "options": [
        "NotifyCanExecuteChanged on the command",
        "Reconstructing the entire application",
        "Changing an unrelated font size"
      ],
      "answer": 0,
      "explanation": "The command raises CanExecuteChanged, and observing controls reevaluate CanExecute. Changing a property used by the predicate is not enough unless the command is notified."
    },
    "source": "mvvm",
    "diagram": "pipeline",
    "concepts": [
      [
        "Give the action a stable owner",
        "A command belongs to the presentation model that owns the operation’s state. Expose the same command instance to several controls instead of creating a new command every time a getter is read. The command can invoke an injected service, while controls remain adapters that present and trigger the action. This separation makes command behavior independently testable."
      ],
      [
        "Express a precondition, not a side effect",
        "CanExecute should report whether an action is currently allowed; it should not mutate state or perform expensive I/O. The predicate may be evaluated frequently by different consumers. Keep it deterministic from current presentation state and enforce important business rules again at the trusted application boundary. A disabled button is not authorization."
      ],
      [
        "Invalidate the predicate when inputs change",
        "The command cannot automatically infer every dependency captured by a delegate. When Title changes, call NotifyCanExecuteChanged on the existing command. The equality guard avoids raising it for unchanged input. Source-generation attributes can wire common relationships, but the generated behavior still raises an event that prompts consumers to reevaluate the predicate."
      ]
    ],
    "predict": "A Save button must work from a toolbar, a keyboard gesture, and a context menu without duplicating the business rule. Represent the operation as a command owned by the view model, express its precondition in CanExecute, and explicitly notify observers when that precondition changes. Use the actual RelayCommand implementation and inspect the enabled-state feedback.",
    "transfer": "Expose Create from a tested view model and bind it to two controls. Assert command identity, preconditions, notification behavior, and the exact service request. Then compare the generated RelayCommand form in a complete Uno project; do not replace async operations with blocking calls.",
    "pitfall": "Do not put an async lambda into an ordinary void-returning RelayCommand and lose its completion Task. Use an asynchronous command abstraction with an explicit concurrency and error policy.",
    "packages": {
      "CommunityToolkit.Mvvm": "8.4.0"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/relaycommand"
    ],
    "projectCode": "using CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic partial class GeneratedTitleModel : ObservableObject\n{\n    [ObservableProperty]\n    [NotifyCanExecuteChangedFor(nameof(CreateCommand))]\n    private string title = \"\";\n\n    [ObservableProperty]\n    private string result = \"Not created\";\n\n    private bool CanCreate() => Title.Trim().Length >= 3;\n\n    [RelayCommand(CanExecute = nameof(CanCreate))]\n    private void Create() => Result = \"Created: \" + Title.Trim();\n}",
    "projectNote": "Complete generated view-model class for a normal CommunityToolkit.Mvvm-enabled project. The browser lab uses explicit construction so no source generator is required at runtime.",
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "commands-validation"
    ]
  },
  {
    "id": "toolkit-async-command",
    "title": "Make asynchronous commands cancellable and observable",
    "summary": "Use AsyncRelayCommand to expose running state and cooperative cancellation.",
    "track": "mvvm-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new LoadCommandModel();\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Status\"), Mode = BindingMode.OneWay });\n        var load = new Button { Content = \"Load task list\", Command = model.Load };\n        var cancel = new Button { Content = \"Cancel load\", IsEnabled = false };\n        cancel.Click += (_, _) => model.Load.Cancel();\n        model.Load.PropertyChanged += (_, _) => cancel.IsEnabled = model.Load.CanBeCanceled;\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => model.Load.Cancel();\n        root.Children.Add(load); root.Children.Add(cancel); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class LoadCommandModel : ObservableObject\n{\n    private string _status = \"Idle\";\n    public LoadCommandModel() => Load = new AsyncRelayCommand(LoadAsync);\n    public AsyncRelayCommand Load { get; }\n    public string Status { get => _status; private set => SetProperty(ref _status, value); }\n    private async Task LoadAsync(CancellationToken token)\n    {\n        Status = \"Loading\";\n        try { await Task.Delay(700, token); Status = \"Loaded\"; }\n        catch (OperationCanceledException) when (token.IsCancellationRequested) { Status = \"Cancelled\"; }\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new LoadCommandModel();\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Status\"), Mode = BindingMode.OneWay });\n        var load = new Button { Content = \"Load task list\", Command = model.Load };\n        var cancel = new Button { Content = \"Cancel load\", IsEnabled = false };\n        cancel.Click += (_, _) => model.Load.Cancel();\n        model.Load.PropertyChanged += (_, _) => cancel.IsEnabled = model.Load.CanBeCanceled;\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => model.Load.Cancel();\n        root.Children.Add(load); root.Children.Add(cancel); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class LoadCommandModel : ObservableObject\n{\n    private string _status = \"Idle\";\n    public LoadCommandModel() => Load = new AsyncRelayCommand(LoadAsync);\n    public AsyncRelayCommand Load { get; }\n    public string Status { get => _status; private set => SetProperty(ref _status, value); }\n    private async Task LoadAsync(CancellationToken token)\n    {\n        Status = \"Loading\";\n        try { await Task.Delay(1200, token); Status = \"Loaded\"; }\n        catch (OperationCanceledException) when (token.IsCancellationRequested) { Status = \"Cancelled\"; }\n    }\n}\n",
    "anchor": "Task.Delay(700",
    "challenge": "Extend the cancellable operation to 1,200 milliseconds",
    "rules": [
      {
        "contains": "Task.Delay(1200",
        "label": "Extend the cancellable operation to 1,200 milliseconds"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Use AsyncRelayCommand to expose running state and cooperative cancellation.",
      "Extend the cancellable operation to 1,200 milliseconds"
    ],
    "hints": [
      "Locate Task.Delay(700 and predict the current behavior.",
      "Try Task.Delay(1200; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "What does Cancel do to the asynchronous operation?",
      "options": [
        "Requests cancellation through a token; the operation must cooperate",
        "Instantly kills any synchronous loop",
        "Automatically rolls back every external side effect"
      ],
      "answer": 0,
      "explanation": "Cancellation is cooperative. An operation must observe the token, and already-committed side effects require their own compensation or transaction policy."
    },
    "source": "async",
    "diagram": "pipeline",
    "concepts": [
      [
        "Expose the asynchronous operation",
        "An asynchronous command must preserve the Task representing completion. AsyncRelayCommand adds running and cancellation state to the ICommand shape consumed by controls. Keep the command instance stable and use its observable properties rather than inventing unrelated busy flags that can disagree. The delegate remains responsible for meaningful results and expected-error presentation."
      ],
      [
        "Pass the token through every cooperative boundary",
        "A CancellationToken-taking delegate lets the command request cancellation. Pass the same token to delay, I/O, and other cooperative operations. Cancellation does not preempt a CPU-bound loop that never checks it, and it does not undo an external operation that already committed. Catch expected cancellation separately from failure and explain its outcome in presentation state."
      ],
      [
        "Define duplicate-execution behavior",
        "Default command availability prevents ordinary UI consumers from starting overlapping executions, but command state is not a global lock on the service or a substitute for validating programmatic callers. Decide whether repeated intent should be ignored, queued, cancelled-and-replaced, or run concurrently. When allowing concurrency, identify results and cleanup by operation generation."
      ]
    ],
    "predict": "A task-list command should expose loading feedback, prevent accidental duplicate execution, and allow cancellation without blocking the UI. Use AsyncRelayCommand with a CancellationToken-taking delegate. The live example uses the actual toolkit command and a deterministic delay so running, cancellation, and completion can be tested without a network service.",
    "transfer": "Replace the delay with an injected repository call, propagate cancellation, and test every outcome by awaiting the command’s Task. Add a generation guard for replaceable searches and an idempotency policy for writes. Keep command error handling explicit instead of relying on a global unhandled-exception hook.",
    "pitfall": "Cancellation is cooperative, not a forced thread abort. After cancellation or failure, verify both the displayed outcome and whether the command can execute again without stale completion state.",
    "packages": {
      "CommunityToolkit.Mvvm": "8.4.0"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/asyncrelaycommand"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "async-cancellation"
    ]
  },
  {
    "id": "toolkit-validation",
    "title": "Model validation errors as observable data",
    "summary": "Use ObservableValidator and data annotations without silently rejecting the draft.",
    "track": "mvvm-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new RegistrationModel();\n        var input = new TextBox { Header = \"Workspace name\" };\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        void Render() => output.Text = model.HasErrors ? string.Join(\"; \", model.GetErrors(nameof(RegistrationModel.Name)).Select(error => error.ErrorMessage)) : \"Ready to submit\";\n        input.TextChanged += (_, _) => { model.Name = input.Text; Render(); };\n        model.ErrorsChanged += (_, _) => Render();\n        model.Check(); Render();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class RegistrationModel : ObservableValidator\n{\n    private string _name = \"\";\n    [System.ComponentModel.DataAnnotations.Required]\n    [System.ComponentModel.DataAnnotations.MinLength(3)]\n    public string Name { get => _name; set => SetProperty(ref _name, value, true); }\n    public void Check() => ValidateProperty(Name, nameof(Name));\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new RegistrationModel();\n        var input = new TextBox { Header = \"Workspace name\" };\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        void Render() => output.Text = model.HasErrors ? string.Join(\"; \", model.GetErrors(nameof(RegistrationModel.Name)).Select(error => error.ErrorMessage)) : \"Ready to submit\";\n        input.TextChanged += (_, _) => { model.Name = input.Text; Render(); };\n        model.ErrorsChanged += (_, _) => Render();\n        model.Check(); Render();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class RegistrationModel : ObservableValidator\n{\n    private string _name = \"\";\n    [System.ComponentModel.DataAnnotations.Required]\n    [System.ComponentModel.DataAnnotations.MinLength(5)]\n    public string Name { get => _name; set => SetProperty(ref _name, value, true); }\n    public void Check() => ValidateProperty(Name, nameof(Name));\n}\n",
    "anchor": "MinLength(3)",
    "challenge": "Require at least five characters in the workspace name",
    "rules": [
      {
        "contains": "MinLength(5)",
        "label": "Require at least five characters in the workspace name"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Use ObservableValidator and data annotations without silently rejecting the draft.",
      "Require at least five characters in the workspace name"
    ],
    "hints": [
      "Locate MinLength(3) and predict the current behavior.",
      "Try MinLength(5); then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why explicitly validate the initial model?",
      "options": [
        "No changed setter may have run yet, so initial invalid data can have no recorded errors",
        "Validation only works after deleting the control",
        "Required guarantees that an empty backing field cannot exist"
      ],
      "answer": 0,
      "explanation": "Annotations describe rules; validation must execute. An initial empty field can remain unchanged, so an equality-guarded setter may not trigger validation before submission."
    },
    "source": "mvvm",
    "diagram": "pipeline",
    "concepts": [
      [
        "Keep invalid draft data observable",
        "A user may need to see and correct an invalid value. ObservableValidator can update the property and record validation errors rather than silently refusing every intermediate input. This is useful for forms with explicit Save. A TrySetProperty policy is different: it can reject an assignment. Choose the behavior that matches the task and explain it to the user."
      ],
      [
        "Trigger validation at deliberate times",
        "Setting a property through the validating SetProperty overload evaluates its attributes when the value changes. Initial values may need explicit validation because an equal assignment can be skipped. Cross-property rules need invalidation when any dependency changes. Do not assume attributes run continuously or that HasErrors proves untouched fields were evaluated."
      ],
      [
        "Read errors without inventing validity",
        "GetErrors exposes recorded validation results and ErrorsChanged tells the view when to read them again. Keep property-specific messages close to the corresponding field and provide an aggregate summary for submission. Avoid disabling Save without explanation, and avoid treating a lack of local annotation errors as proof that a server accepted the operation."
      ]
    ],
    "predict": "A form should explain why a value is invalid while preserving the text being edited. ObservableValidator represents errors through INotifyDataErrorInfo as well as ordinary property changes. Learn when validation runs, how errors are read, and why draft validation must remain separate from the trusted service’s validation and authorization rules.",
    "transfer": "Add validation to the task editor, including initial validation and a cross-property rule. Connect errors to accessible field feedback, test annotation semantics, and keep remote validation asynchronous and cancellable. The source sample explains MVVM wiring; Microsoft’s ObservableValidator contract supplies the validation-specific API details.",
    "pitfall": "Data annotations do not choose your normalization policy. Required, minimum length, trimming and accepted whitespace must describe the same domain value and produce consistent feedback.",
    "packages": {
      "CommunityToolkit.Mvvm": "8.4.0"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/observablevalidator"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "commands-validation"
    ]
  },
  {
    "id": "toolkit-messaging",
    "title": "Use messages at deliberate component boundaries",
    "summary": "Send typed notifications without turning the messenger into hidden global state.",
    "track": "mvvm-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\nusing CommunityToolkit.Mvvm.Messaging;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var messenger = new CommunityToolkit.Mvvm.Messaging.WeakReferenceMessenger();\n        var recipient = new NoticeModel();\n        messenger.Register<NoticeModel, CommunityToolkit.Mvvm.Messaging.Messages.ValueChangedMessage<string>>(recipient,\n            static (target, message) => target.Text = message.Value);\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = recipient, Path = new PropertyPath(\"Text\"), Mode = BindingMode.OneWay });\n        var send = new Button { Content = \"Send typed notice\" };\n        var stop = new Button { Content = \"Deactivate recipient\" };\n        send.Click += (_, _) => messenger.Send(new CommunityToolkit.Mvvm.Messaging.Messages.ValueChangedMessage<string>(\"Task changed\"));\n        stop.Click += (_, _) => messenger.UnregisterAll(recipient);\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => messenger.UnregisterAll(recipient);\n        root.Children.Add(send); root.Children.Add(stop); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class NoticeModel : ObservableObject\n{\n    private string _text = \"No notice received\";\n    public string Text { get => _text; set => SetProperty(ref _text, value); }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\nusing CommunityToolkit.Mvvm.Messaging;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var messenger = new CommunityToolkit.Mvvm.Messaging.WeakReferenceMessenger();\n        var recipient = new NoticeModel();\n        messenger.Register<NoticeModel, CommunityToolkit.Mvvm.Messaging.Messages.ValueChangedMessage<string>>(recipient,\n            static (target, message) => target.Text = message.Value);\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        output.SetBinding(TextBlock.TextProperty, new Binding { Source = recipient, Path = new PropertyPath(\"Text\"), Mode = BindingMode.OneWay });\n        var send = new Button { Content = \"Send typed notice\" };\n        var stop = new Button { Content = \"Deactivate recipient\" };\n        send.Click += (_, _) => messenger.Send(new CommunityToolkit.Mvvm.Messaging.Messages.ValueChangedMessage<string>(\"Workspace changed\"));\n        stop.Click += (_, _) => messenger.UnregisterAll(recipient);\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => messenger.UnregisterAll(recipient);\n        root.Children.Add(send); root.Children.Add(stop); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class NoticeModel : ObservableObject\n{\n    private string _text = \"No notice received\";\n    public string Text { get => _text; set => SetProperty(ref _text, value); }\n}\n",
    "anchor": "ValueChangedMessage<string>(\"Task changed\")",
    "challenge": "Send Workspace changed as the typed notice payload",
    "rules": [
      {
        "contains": "ValueChangedMessage<string>(\"Workspace changed\")",
        "label": "Send Workspace changed as the typed notice payload"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Send typed notifications without turning the messenger into hidden global state.",
      "Send Workspace changed as the typed notice payload"
    ],
    "hints": [
      "Locate ValueChangedMessage<string>(\"Task changed\") and predict the current behavior.",
      "Try ValueChangedMessage<string>(\"Workspace changed\"); then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "What does weak registration not guarantee?",
      "options": [
        "A complete activation or delivery policy",
        "That the recipient can implement observable properties",
        "That message types can carry data"
      ],
      "answer": 0,
      "explanation": "Weak references can reduce retention, but they do not decide when a component should receive messages, replay missed events, or make handlers run on the UI thread."
    },
    "source": "events",
    "diagram": "pipeline",
    "concepts": [
      [
        "Choose messaging for an appropriate boundary",
        "Constructor injection is clearer for a direct required dependency. Messaging can be useful when independently owned components publish notifications without knowing every listener. Avoid using a global bus for every property assignment or as an undocumented service locator. Define the message’s meaning, sender expectations, and whether a recipient needs current state or only future notifications."
      ],
      [
        "Keep handlers independent of accidental captures",
        "The typed Register overload passes the recipient into the handler, allowing a static lambda that does not capture external state. This helps make retention and ownership easier to inspect. The messenger invokes the handler according to its own contract; it does not automatically dispatch UI-bound work onto the correct thread or turn a notification into durable storage."
      ],
      [
        "Define activation even with weak references",
        "Weak retention is not the same as a component being inactive. A recipient can remain alive through another reference and still receive messages unless unregistered. Explicit deactivation prevents hidden screens from performing work and makes tests deterministic. Reactivation should avoid duplicate registration and should decide how to obtain any state missed while inactive."
      ]
    ],
    "predict": "Two independently owned components need to learn that a task changed, but neither should locate the other’s view controls. Use a typed messenger notification for that boundary and define when the recipient is active. The example creates its own WeakReferenceMessenger so experiments do not leave registrations in an application-wide default instance.",
    "transfer": "Add task-change notifications between two view models using an injected IMessenger instance, explicit activation, and a typed payload. Keep state reload separate from notification delivery. Test active, inactive, reactivated, and background-publisher cases without relying on forced garbage collection for correctness.",
    "pitfall": "A transient message is not durable state. Keep authoritative values in an owned model or service, and unregister inactive recipients when semantic inactivity matters even if the messenger uses weak references.",
    "packages": {
      "CommunityToolkit.Mvvm": "8.4.0"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/messenger"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "events"
    ]
  },
  {
    "id": "mvvm-drafts",
    "title": "Design Save and Cancel around a real draft",
    "summary": "Keep committed state, dirty state, and command availability coherent.",
    "track": "mvvm-patterns",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new DraftModel();\n        var input = new TextBox { Header = \"Draft title\", Text = model.Draft };\n        input.TextChanged += (_, _) => model.Draft = input.Text;\n        model.PropertyChanged += (_, e) => { if (e.PropertyName == nameof(DraftModel.Draft) && input.Text != model.Draft) input.Text = model.Draft; };\n        var save = new Button { Content = \"Commit draft\", Command = model.Save };\n        var cancel = new Button { Content = \"Discard edits\", Command = model.Cancel };\n        var summary = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        summary.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Summary\"), Mode = BindingMode.OneWay });\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(save); root.Children.Add(cancel); root.Children.Add(summary); return root;\n    }\n}\n\npublic sealed class DraftModel : ObservableObject\n{\n    private string _draft = \"Original title\";\n    private string _saved = \"Original title\";\n    public DraftModel()\n    {\n        Save = new RelayCommand(() => { _saved = Draft.Trim(); Draft = _saved; Refresh(); }, () => IsDirty && Draft.Trim().Length >= 3);\n        Cancel = new RelayCommand(() => { Draft = _saved; Refresh(); }, () => IsDirty);\n    }\n    public string Draft { get => _draft; set { if (SetProperty(ref _draft, value)) Refresh(); } }\n    public bool IsDirty => Draft != _saved;\n    public string Summary => $\"Saved: {_saved}\\nDirty: {IsDirty}\";\n    public RelayCommand Save { get; }\n    public RelayCommand Cancel { get; }\n    private void Refresh() { OnPropertyChanged(nameof(IsDirty)); OnPropertyChanged(nameof(Summary)); Save.NotifyCanExecuteChanged(); Cancel.NotifyCanExecuteChanged(); }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\nusing CommunityToolkit.Mvvm.ComponentModel;\nusing CommunityToolkit.Mvvm.Input;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var model = new DraftModel();\n        var input = new TextBox { Header = \"Draft title\", Text = model.Draft };\n        input.TextChanged += (_, _) => model.Draft = input.Text;\n        model.PropertyChanged += (_, e) => { if (e.PropertyName == nameof(DraftModel.Draft) && input.Text != model.Draft) input.Text = model.Draft; };\n        var save = new Button { Content = \"Commit draft\", Command = model.Save };\n        var cancel = new Button { Content = \"Discard edits\", Command = model.Cancel };\n        var summary = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        summary.SetBinding(TextBlock.TextProperty, new Binding { Source = model, Path = new PropertyPath(\"Summary\"), Mode = BindingMode.OneWay });\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(save); root.Children.Add(cancel); root.Children.Add(summary); return root;\n    }\n}\n\npublic sealed class DraftModel : ObservableObject\n{\n    private string _draft = \"Original title\";\n    private string _saved = \"Original title\";\n    public DraftModel()\n    {\n        Save = new RelayCommand(() => { _saved = Draft.Trim(); Draft = _saved; Refresh(); }, () => IsDirty && Draft.Trim().Length >= 5);\n        Cancel = new RelayCommand(() => { Draft = _saved; Refresh(); }, () => IsDirty);\n    }\n    public string Draft { get => _draft; set { if (SetProperty(ref _draft, value)) Refresh(); } }\n    public bool IsDirty => Draft != _saved;\n    public string Summary => $\"Saved: {_saved}\\nDirty: {IsDirty}\";\n    public RelayCommand Save { get; }\n    public RelayCommand Cancel { get; }\n    private void Refresh() { OnPropertyChanged(nameof(IsDirty)); OnPropertyChanged(nameof(Summary)); Save.NotifyCanExecuteChanged(); Cancel.NotifyCanExecuteChanged(); }\n}\n",
    "anchor": "Draft.Trim().Length >= 3",
    "challenge": "Require a five-character draft before committing",
    "rules": [
      {
        "contains": "Draft.Trim().Length >= 5",
        "label": "Require a five-character draft before committing"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Keep committed state, dirty state, and command availability coherent.",
      "Require a five-character draft before committing"
    ],
    "hints": [
      "Locate Draft.Trim().Length >= 3 and predict the current behavior.",
      "Try Draft.Trim().Length >= 5; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "When should the committed snapshot be replaced in a real async save?",
      "options": [
        "After the repository accepts the save",
        "Before the request is sent, regardless of outcome",
        "Whenever a character is typed"
      ],
      "answer": 0,
      "explanation": "A draft and a committed snapshot represent different states. Do not mark changes saved before the persistence operation actually succeeds."
    },
    "source": "mvvm",
    "diagram": "pipeline",
    "concepts": [
      [
        "Give draft and baseline different owners",
        "An editor’s current text is not the same as accepted domain state. Keep a baseline and a draft, then derive dirty state from their comparison. This makes Cancel meaningful and prevents every keystroke from mutating a shared record displayed elsewhere. Choose whether comparison occurs before or after normalization and keep that rule consistent with the save behavior."
      ],
      [
        "Derive action availability from the same state",
        "Save requires a dirty and valid draft; Cancel requires a dirty draft. Both predicates should observe the same model state and be invalidated after every relevant transition. Avoid separate manually maintained flags that drift apart, such as Save enabled while IsDirty is false. Calculated properties and command notifications must be kept coherent."
      ],
      [
        "Commit only at the accepted boundary",
        "The fixture’s Save action trims and replaces its in-memory baseline synchronously. A real repository save must be awaited before declaring success, and failures should preserve the draft. If the user can keep editing during the request, capture the submitted snapshot and avoid replacing a newer draft with an older accepted result. Use versions for concurrent writers."
      ]
    ],
    "predict": "An edit form needs Cancel that genuinely restores the last accepted value and Save that does not lie about persistence. Build a draft model with explicit dirty state and commands derived from it. The lesson commits to an in-memory snapshot; later repository integration must preserve the same distinction across asynchronous success, failure, and concurrent edits.",
    "transfer": "Add a repository, a versioned baseline, and an asynchronous Save command. Test failed saves, concurrent typing, cancel, and guarded navigation. Keep UI focus behavior in the view while the model owns draft state, validation, and the accepted transaction result.",
    "pitfall": "A Save command is intent; persisted acceptance is a later outcome. Do not clear a dirty flag or discard the baseline before an asynchronous save actually succeeds.",
    "packages": {
      "CommunityToolkit.Mvvm": "8.4.0"
    },
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/observableobject"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "mvvm"
    ]
  }
];
