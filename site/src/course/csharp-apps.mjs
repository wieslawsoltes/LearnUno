// Authored app-building lessons; each example is a complete single-document lab.
export default [
  {
    "id": "input-contracts",
    "title": "Turn text input into a validated value",
    "summary": "Separate missing values, parsing failures, and valid domain input.",
    "track": "csharp-apps",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        const int MaximumSeats = 12;\n        var input = new TextBox { Header = \"Seats to reserve\", Text = \"3\" };\n        var output = new TextBlock { Text = \"Not submitted\", TextWrapping = TextWrapping.Wrap };\n        var apply = new Button { Content = \"Validate seats\" };\n        apply.Click += (_, _) => {\n            var raw = input.Text;\n            output.Text = int.TryParse(raw, System.Globalization.NumberStyles.Integer,\n                System.Globalization.CultureInfo.InvariantCulture, out var seats) && seats >= 1 && seats <= MaximumSeats\n                ? $\"Accepted: {seats} seats\" : $\"Enter a whole number from 1 to {MaximumSeats}.\";\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(apply); root.Children.Add(output);\n        return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        const int MaximumSeats = 8;\n        var input = new TextBox { Header = \"Seats to reserve\", Text = \"3\" };\n        var output = new TextBlock { Text = \"Not submitted\", TextWrapping = TextWrapping.Wrap };\n        var apply = new Button { Content = \"Validate seats\" };\n        apply.Click += (_, _) => {\n            var raw = input.Text;\n            output.Text = int.TryParse(raw, System.Globalization.NumberStyles.Integer,\n                System.Globalization.CultureInfo.InvariantCulture, out var seats) && seats >= 1 && seats <= MaximumSeats\n                ? $\"Accepted: {seats} seats\" : $\"Enter a whole number from 1 to {MaximumSeats}.\";\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(apply); root.Children.Add(output);\n        return root;\n    }\n}\n\n\n",
    "anchor": "MaximumSeats = 12",
    "challenge": "Limit a reservation to eight seats",
    "rules": [
      {
        "contains": "MaximumSeats = 8",
        "label": "Limit a reservation to eight seats"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Separate missing values, parsing failures, and valid domain input.",
      "Limit a reservation to eight seats"
    ],
    "hints": [
      "Locate the MaximumSeats constant. Predict acceptance for 8 and 9.",
      "Set MaximumSeats to 8. The feedback text uses the same constant."
    ],
    "quiz": {
      "question": "What does the null-forgiving operator (!) do?",
      "options": [
        "It converts any string into a valid number",
        "It suppresses a nullable warning; it does not validate runtime input",
        "It throws whenever the value is empty"
      ],
      "answer": 1,
      "explanation": "Nullable annotations and warning suppression do not implement parsing or domain validation. Check the input and keep the error path explicit."
    },
    "source": "uno-howto-create-a-repro",
    "diagram": "pipeline",
    "concepts": [
      [
        "Keep the boundary explicit",
        "A TextBox owns editable text, including intermediate states that are not yet valid domain values. Nullable annotations help the compiler reason about references, while TryParse addresses representation and a range check addresses the business rule. These are separate contracts. Keep the original input until a successful commit so feedback can explain the problem without destroying the evidence."
      ],
      [
        "Parse before using the value",
        "Use a Try-style conversion when malformed user input is an expected event. Choose NumberStyles and CultureInfo deliberately rather than inheriting an arbitrary machine setting for a protocol-like integer field. A successful conversion proves only that the representation fits the target type. It does not prove that the requested operation is allowed."
      ],
      [
        "Commit one validated value",
        "Treat submission as a transition from an editable representation to a trusted local value. The sample uses short-circuit Boolean evaluation so range checks operate only on a successful parse. For a larger form, collect validation results into presentation state and perform one save action rather than writing every keystroke to durable storage."
      ]
    ],
    "predict": "Build a reservation field that must accept a small positive whole number. Empty text, a malformed number, and an out-of-range number are different situations even though none may be submitted. Follow the boundary from editable text to a validated value, then decide where the application should show feedback without erasing what the user typed.",
    "transfer": "Extract a pure TryCreateReservationCount function and table-test the boundaries. Keep TextBox editing and feedback in the view or view model, but pass only a validated count to the reservation service. Compare the upstream TextBox keyboard/input guidance with this validation contract; neither source claims that keyboard configuration enforces domain rules.",
    "pitfall": "A numeric keyboard is an input hint, not validation. Paste, accessibility tools, imported values and programmatic updates can still provide unexpected text; validate at the domain boundary.",
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "debug-loop"
    ]
  },
  {
    "id": "record-identity",
    "title": "Separate record equality from entity identity",
    "summary": "Preserve stable keys while immutable snapshots change their displayed values.",
    "track": "csharp-apps",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var original = new TaskRecord(7, \"Draft the plan\");\n        var edited = original with { Title = \"Review the plan\" };\n        var sameEntity = original.Id == edited.Id;\n        var sameValue = original == edited;\n        return new TextBlock {\n            Text = $\"Same entity: {sameEntity}\\nSame record value: {sameValue}\\nOriginal: {original.Title}\\nEdited: {edited.Title}\",\n            TextWrapping = TextWrapping.Wrap, FontSize = 20, Margin = new Thickness(24)\n        };\n    }\n}\n\npublic sealed record TaskRecord(int Id, string Title);\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var original = new TaskRecord(7, \"Draft the plan\");\n        var edited = original with { Title = \"Draft the plan\" };\n        var sameEntity = original.Id == edited.Id;\n        var sameValue = original == edited;\n        return new TextBlock {\n            Text = $\"Same entity: {sameEntity}\\nSame record value: {sameValue}\\nOriginal: {original.Title}\\nEdited: {edited.Title}\",\n            TextWrapping = TextWrapping.Wrap, FontSize = 20, Margin = new Thickness(24)\n        };\n    }\n}\n\npublic sealed record TaskRecord(int Id, string Title);\n",
    "anchor": "Title = \"Review the plan\"",
    "challenge": "Create a second snapshot whose fields equal the original",
    "rules": [
      {
        "contains": "Title = \"Draft the plan\"",
        "label": "Create a second snapshot whose fields equal the original"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Preserve stable keys while immutable snapshots change their displayed values.",
      "Create a second snapshot whose fields equal the original"
    ],
    "hints": [
      "Locate Title = \"Review the plan\" and predict the current behavior.",
      "Try Title = \"Draft the plan\"; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Which equality should locate a task after its title changes?",
      "options": [
        "The stable task identifier",
        "Its position in the filtered list",
        "Its complete record value including the title"
      ],
      "answer": 0,
      "explanation": "Entity identity usually survives edits. Record value equality changes when an included field changes; a list position changes when its projection changes."
    },
    "source": "tutorial",
    "diagram": "pipeline",
    "concepts": [
      [
        "Name the two questions",
        "Ask separately whether two values describe the same entity and whether their current contents are equal. A record supplies useful value equality, but it does not choose the identity rule for your application. A task identifier can remain constant while its title, status, or revision changes. Use the question that matches the operation instead of applying one equality test everywhere."
      ],
      [
        "Copy without losing the original",
        "A with-expression copies a record and changes the specified members. The original remains available for comparison or undo when its members are themselves immutable values. A record containing a mutable List would still share that reference unless you replace it. State what is immutable rather than treating the record keyword as a universal deep-copy operation."
      ],
      [
        "Carry keys through projections",
        "A sorted or filtered view is a projection, not the authoritative owner of identity. Store the selected task key, then resolve it in the current projection. Preserve the selected key when a title changes; clear or explicitly retain it when the item disappears. Avoid using the selected index as a durable reference to an entity."
      ]
    ],
    "predict": "A task changes its title while a details pane and a filtered list both refer to it. The old and new records can represent the same entity without being equal snapshots. Use this distinction to keep selection and routing stable as immutable data flows through an Uno application, especially when sorting and filtering change the visible positions.",
    "transfer": "Add stable IDs to the task capstone, retain selection across title edits, and test sorting, filtering, deletion, and reload. Use record snapshots for undo only after reviewing every nested member’s mutability. Connect this to the source collection examples: visible order and domain identity should not be coupled.",
    "pitfall": "A stable key identifies an entity but does not solve concurrent editing. Add a separate version or merge policy before treating two updates to the same ID as compatible.",
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "capstone-app"
    ]
  },
  {
    "id": "linq-projections",
    "title": "Know when a LINQ query actually runs",
    "summary": "Distinguish a deferred projection from a materialized snapshot.",
    "track": "csharp-apps",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var values = new List<int> { 1, 2, 3 };\n        var threshold = 3;\n        var query = values.Where(value => value >= threshold);\n        var snapshot = query.ToArray();\n        var label = new TextBlock { TextWrapping = TextWrapping.Wrap, FontSize = 20 };\n        void Render() => label.Text = $\"Deferred: {string.Join(\", \", query)}\\nSnapshot: {string.Join(\", \", snapshot)}\";\n        var add = new Button { Content = \"Append next value\" };\n        add.Click += (_, _) => { values.Add(values.Count + 1); Render(); };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(add); root.Children.Add(label); Render(); return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var values = new List<int> { 1, 2, 3 };\n        var threshold = 2;\n        var query = values.Where(value => value >= threshold);\n        var snapshot = query.ToArray();\n        var label = new TextBlock { TextWrapping = TextWrapping.Wrap, FontSize = 20 };\n        void Render() => label.Text = $\"Deferred: {string.Join(\", \", query)}\\nSnapshot: {string.Join(\", \", snapshot)}\";\n        var add = new Button { Content = \"Append next value\" };\n        add.Click += (_, _) => { values.Add(values.Count + 1); Render(); };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(add); root.Children.Add(label); Render(); return root;\n    }\n}\n\n\n",
    "anchor": "var threshold = 3;",
    "challenge": "Include values starting at two in the projection",
    "rules": [
      {
        "contains": "var threshold = 2;",
        "label": "Include values starting at two in the projection"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Distinguish a deferred projection from a materialized snapshot.",
      "Include values starting at two in the projection"
    ],
    "hints": [
      "Locate var threshold = 3; and predict the current behavior.",
      "Try var threshold = 2;; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "When does a deferred Where query normally read its source?",
      "options": [
        "Only when the variable is declared",
        "When the query is enumerated",
        "Only when a view model is disposed"
      ],
      "answer": 1,
      "explanation": "Where constructs a query. Enumeration executes it against the then-current source and captured values. ToArray materializes a snapshot at that moment."
    },
    "source": "items-source",
    "diagram": "pipeline",
    "concepts": [
      [
        "Separate query construction from evaluation",
        "Where returns an enumerable that keeps access to its source and predicate. Declaring the query does not necessarily inspect every item immediately. ToArray enumerates it and stores the resulting elements. Both are useful: a deferred query can reflect current data, while a snapshot can give a consistent point-in-time input to a save, comparison, or calculation."
      ],
      [
        "Account for changing inputs",
        "A query can observe both a mutated source collection and a changed variable captured by its predicate. This makes concise code sensitive to evaluation timing. Avoid side effects inside selectors and predicates unless the repeated-execution contract is intentional. A logging counter in a predicate may increment each time several UI consumers enumerate the same query."
      ],
      [
        "Choose an observable presentation boundary",
        "An IEnumerable is not automatically a source of collection-change events. Assigning a deferred query to ItemsSource does not promise that a control will discover mutations by itself. Use an observable projection, replace a materialized ItemsSource when appropriate, or update an ObservableCollection with a deliberate notification policy. Keep stable keys when replacing a projection."
      ]
    ],
    "predict": "Your search view filters a mutable list and later appends more data. A stored query and a stored array look similar in a debugger, but they answer different questions when read again. Make evaluation time explicit so collection views, summaries, and exported snapshots do not unexpectedly disagree after an edit or an asynchronous update.",
    "transfer": "Build a search projection over the capstone’s stable task IDs. Compare an explicit snapshot replacement with incremental ObservableCollection updates and verify that selected identity survives. Measure repeated enumeration before caching a projection, then define exactly when that cache becomes stale.",
    "pitfall": "ToArray snapshots the sequence membership and ordering, not the internal state of referenced objects. Use immutable items or an explicit deep-copy policy when a historical snapshot must not change.",
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "observable-collections"
    ]
  },
  {
    "id": "task-failure",
    "title": "Handle asynchronous failures at the right boundary",
    "summary": "Keep exception observation and UI recovery in the awaited operation.",
    "track": "csharp-apps",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var fail = new CheckBox { Content = \"Simulate failure\", IsChecked = true };\n        var output = new TextBlock { Text = \"Idle\", TextWrapping = TextWrapping.Wrap };\n        var run = new Button { Content = \"Run operation\" };\n        run.Click += async (_, _) => {\n            run.IsEnabled = false; output.Text = \"Working\";\n            try {\n                await Task.Delay(100);\n                if (fail.IsChecked == true) throw new InvalidOperationException(\"Fixture rejected the request\");\n                output.Text = \"Completed\";\n            }\n            catch (InvalidOperationException error) { output.Text = \"Recoverable: \" + error.Message; }\n            finally { run.IsEnabled = true; }\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(fail); root.Children.Add(run); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var fail = new CheckBox { Content = \"Simulate failure\", IsChecked = false };\n        var output = new TextBlock { Text = \"Idle\", TextWrapping = TextWrapping.Wrap };\n        var run = new Button { Content = \"Run operation\" };\n        run.Click += async (_, _) => {\n            run.IsEnabled = false; output.Text = \"Working\";\n            try {\n                await Task.Delay(100);\n                if (fail.IsChecked == true) throw new InvalidOperationException(\"Fixture rejected the request\");\n                output.Text = \"Completed\";\n            }\n            catch (InvalidOperationException error) { output.Text = \"Recoverable: \" + error.Message; }\n            finally { run.IsEnabled = true; }\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(fail); root.Children.Add(run); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "anchor": "IsChecked = true",
    "challenge": "Start with the successful operation path selected",
    "rules": [
      {
        "contains": "IsChecked = false",
        "label": "Start with the successful operation path selected"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Keep exception observation and UI recovery in the awaited operation.",
      "Start with the successful operation path selected"
    ],
    "hints": [
      "Locate IsChecked = true and predict the current behavior.",
      "Try IsChecked = false; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Where should a caller observe a Task-returning operation’s failure?",
      "options": [
        "Around the awaited operation",
        "Only around creation of an unrelated button",
        "By ignoring the returned Task"
      ],
      "answer": 0,
      "explanation": "Await observes the operation’s completion and propagates its exception. Recovery and restoring UI invariants belong at a boundary that actually observes that completion."
    },
    "source": "async",
    "diagram": "pipeline",
    "concepts": [
      [
        "Follow the returned Task",
        "A Task represents completion, not just the fact that work started. An async method can return before its awaited work finishes, so a try block that only calls it without awaiting may not observe a later failure. Event handlers may need async void signatures, but their bodies should still await Task-returning operations and handle expected failures explicitly."
      ],
      [
        "Classify instead of swallowing",
        "Catch failures you can interpret at the chosen boundary. Cancellation, validation errors, connectivity problems, and programming defects may require different treatment. A blanket catch that displays success hides corruption; a blanket rethrow from every UI event can make expected service failures unusable. Preserve diagnostic context while presenting a safe, actionable explanation."
      ],
      [
        "Restore invariants on every exit",
        "Place symmetric cleanup in finally when it must happen after success, failure, or cancellation. Restore command availability, release the operation’s owned resources, and avoid clearing a newer operation’s state by mistake. If overlapping operations are permitted, the cleanup must identify which operation it owns rather than blindly resetting a shared field."
      ]
    ],
    "predict": "A Save button works until a service rejects the request. Without an awaited boundary, the failure may escape the place that should restore the enabled state and preserve the user’s draft. Trace success and failure through the same operation, and make the UI recover to a usable state without pretending that a failed save succeeded.",
    "transfer": "Extract the operation into a Task-returning view-model method and inject a deterministic fake service. Test success, known failure, cancellation, and a second attempt. Keep the event adapter thin and compare your error policy with the source examples rather than copying async void into application services.",
    "pitfall": "A correct error label is insufficient if the view stays disabled after failure. Test a second attempt to verify that cleanup, availability and operation ownership were restored.",
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "async-cancellation"
    ]
  },
  {
    "id": "debounced-input",
    "title": "Debounce input without rendering stale results",
    "summary": "Combine cancellation, generation checks, and input ownership in a search flow.",
    "track": "csharp-apps",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var input = new TextBox { Header = \"Search phrase\" };\n        var output = new TextBlock { Text = \"Type to search\", TextWrapping = TextWrapping.Wrap };\n        CancellationTokenSource? pending = null;\n        var generation = 0;\n        input.TextChanged += async (_, _) => {\n            pending?.Cancel();\n            var current = new CancellationTokenSource(); pending = current;\n            var request = ++generation; var query = input.Text;\n            try {\n                await Task.Delay(300, current.Token);\n                if (request == generation) output.Text = \"Latest query: \" + query;\n            }\n            catch (OperationCanceledException) { }\n            finally { if (ReferenceEquals(pending, current)) pending = null; current.Dispose(); }\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => { generation++; pending?.Cancel(); };\n        root.Children.Add(input); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var input = new TextBox { Header = \"Search phrase\" };\n        var output = new TextBlock { Text = \"Type to search\", TextWrapping = TextWrapping.Wrap };\n        CancellationTokenSource? pending = null;\n        var generation = 0;\n        input.TextChanged += async (_, _) => {\n            pending?.Cancel();\n            var current = new CancellationTokenSource(); pending = current;\n            var request = ++generation; var query = input.Text;\n            try {\n                await Task.Delay(500, current.Token);\n                if (request == generation) output.Text = \"Latest query: \" + query;\n            }\n            catch (OperationCanceledException) { }\n            finally { if (ReferenceEquals(pending, current)) pending = null; current.Dispose(); }\n        };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => { generation++; pending?.Cancel(); };\n        root.Children.Add(input); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "anchor": "Task.Delay(300",
    "challenge": "Wait for 500 milliseconds of quiet before accepting the query",
    "rules": [
      {
        "contains": "Task.Delay(500",
        "label": "Wait for 500 milliseconds of quiet before accepting the query"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Combine cancellation, generation checks, and input ownership in a search flow.",
      "Wait for 500 milliseconds of quiet before accepting the query"
    ],
    "hints": [
      "Locate Task.Delay(300 and predict the current behavior.",
      "Try Task.Delay(500; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "What does a generation check protect against?",
      "options": [
        "An older completion overwriting newer intent",
        "All memory allocations in the app",
        "Every possible network failure"
      ],
      "answer": 0,
      "explanation": "Cancellation is cooperative and may arrive too late or be ignored by a dependency. A generation check independently rejects results belonging to superseded intent."
    },
    "source": "async",
    "diagram": "pipeline",
    "concepts": [
      [
        "Capture the intent at the event",
        "Read the input into a local query at the start of the operation. That snapshot describes the intent being processed; rereading the TextBox after an await could accidentally mix a newer phrase with an older request. Increment a generation and create a token source owned by this operation before awaiting the quiet interval."
      ],
      [
        "Cancel superseded waiting",
        "CancellationTokenSource.Cancel requests cancellation; it is not a synchronous kill switch for arbitrary work. Task.Delay observes its token, so an obsolete wait normally completes by throwing OperationCanceledException. Treat that expected path separately and dispose each source only when its own asynchronous operation has finished using it."
      ],
      [
        "Gate the result independently",
        "Even cancellable work can complete before it notices cancellation, and not every service honors a token. Compare the captured generation with the current one before publishing. This second condition protects the state transition rather than merely reducing work. Keep both checks when the debounce later starts a real search service."
      ]
    ],
    "predict": "An app filters as the user types, but each key should not start an expensive request and an old response must not overwrite the newest phrase. Build a local debounce first, then identify the additional contracts needed when the delay becomes real I/O. The browser lab uses a deterministic delay and never sends the search phrase to a remote server.",
    "transfer": "Move debounce and search into a view-model service with an injected clock or delay abstraction. Test rapid input, slow input, ignored cancellation, navigation away, and late cleanup. Use a request identity that cannot be overwritten by an older operation’s finally block.",
    "pitfall": "Unloaded does not always mean permanent destruction: a view can be reparented or reactivated. Cancellation on detach must fit a documented activation policy, and late results must not update a newer request.",
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "async-cancellation"
    ],
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads"
    ]
  },
  {
    "id": "subscription-lifetimes",
    "title": "Own subscriptions as disposable resources",
    "summary": "Make attachment, detachment, and cleanup an explicit lifecycle.",
    "track": "csharp-apps",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var publisher = new TickSource();\n        var received = 0;\n        var output = new TextBlock { Text = $\"Received: {received}\" };\n        EventHandler handler = (_, _) => output.Text = $\"Received: {++received}\";\n        IDisposable? subscription = publisher.Subscribe(handler);\n        var send = new Button { Content = \"Publish tick\" };\n        var detach = new Button { Content = \"Dispose subscription\" };\n        send.Click += (_, _) => publisher.Publish();\n        detach.Click += (_, _) => { subscription?.Dispose(); subscription = null; };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => { subscription?.Dispose(); subscription = null; };\n        root.Children.Add(send); root.Children.Add(detach); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class TickSource\n{\n    private event EventHandler? Tick;\n    public void Publish() => Tick?.Invoke(this, EventArgs.Empty);\n    public IDisposable Subscribe(EventHandler handler)\n    {\n        Tick += handler;\n        return new Subscription(() => Tick -= handler);\n    }\n}\npublic sealed class Subscription(Action release) : IDisposable\n{\n    private Action? _release = release;\n    public void Dispose() => Interlocked.Exchange(ref _release, null)?.Invoke();\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var publisher = new TickSource();\n        var received = 10;\n        var output = new TextBlock { Text = $\"Received: {received}\" };\n        EventHandler handler = (_, _) => output.Text = $\"Received: {++received}\";\n        IDisposable? subscription = publisher.Subscribe(handler);\n        var send = new Button { Content = \"Publish tick\" };\n        var detach = new Button { Content = \"Dispose subscription\" };\n        send.Click += (_, _) => publisher.Publish();\n        detach.Click += (_, _) => { subscription?.Dispose(); subscription = null; };\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Unloaded += (_, _) => { subscription?.Dispose(); subscription = null; };\n        root.Children.Add(send); root.Children.Add(detach); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed class TickSource\n{\n    private event EventHandler? Tick;\n    public void Publish() => Tick?.Invoke(this, EventArgs.Empty);\n    public IDisposable Subscribe(EventHandler handler)\n    {\n        Tick += handler;\n        return new Subscription(() => Tick -= handler);\n    }\n}\npublic sealed class Subscription(Action release) : IDisposable\n{\n    private Action? _release = release;\n    public void Dispose() => Interlocked.Exchange(ref _release, null)?.Invoke();\n}\n",
    "anchor": "var received = 0;",
    "challenge": "Start the received-event counter at ten",
    "rules": [
      {
        "contains": "var received = 10;",
        "label": "Start the received-event counter at ten"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Make attachment, detachment, and cleanup an explicit lifecycle.",
      "Start the received-event counter at ten"
    ],
    "hints": [
      "Locate var received = 0; and predict the current behavior.",
      "Try var received = 10;; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why retain the exact delegate when detaching?",
      "options": [
        "Event removal must identify the subscription that was actually attached",
        "Every newly written lambda is guaranteed to be equal",
        "The garbage collector automatically chooses which handler to remove"
      ],
      "answer": 0,
      "explanation": "An event holds a delegate. Store the exact handler or an owned subscription token rather than assuming a separately created lambda removes it."
    },
    "source": "events",
    "diagram": "pipeline",
    "concepts": [
      [
        "Identify the reference chain",
        "An event publisher retains its subscribers through delegates. A handler may retain a view, a view model, or captured locals even after that view is no longer displayed. The important question is who owns the publisher and subscription, not whether the handler was written as a method or a lambda. Make the reference direction explicit before diagnosing a leak."
      ],
      [
        "Return an owned registration",
        "A Subscribe method can return an IDisposable token that knows precisely which delegate to remove. This moves cleanup knowledge next to attachment and gives the consumer one resource to own. The token should avoid unnecessary captured state and should document whether disposal can race with an already-dispatched callback."
      ],
      [
        "Make release safe to repeat",
        "Interlocked.Exchange swaps the release action to null and returns the previous action. Only the first Dispose call invokes it. This makes a button-triggered cleanup and a later lifecycle cleanup safe to combine. Idempotence prevents double release; it does not automatically make every callback or the publisher’s implementation thread-safe."
      ]
    ],
    "predict": "A long-lived publisher can keep a short-lived screen reachable through its event handler. Hiding that screen is not proof that it has been released. Represent the subscription as an owned disposable resource, make cleanup safe to call twice, and verify that publishing after detachment no longer invokes the screen’s callback.",
    "transfer": "Apply owned subscriptions to navigation activation, service notifications, and reusable controls. Build a composite owner for several tokens, dispose it on the intended lifetime boundary, and test reactivation. Do not equate weak references with a complete delivery or lifecycle policy.",
    "pitfall": "Detaching a visual does not automatically remove a subscription held by a longer-lived publisher. Test registration and callback counts across activation, deactivation and reactivation.",
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "events"
    ],
    "references": [
      "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/how-to-subscribe-to-and-unsubscribe-from-events"
    ]
  }
];
