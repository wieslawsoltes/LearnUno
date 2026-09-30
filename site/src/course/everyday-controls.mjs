// Authored app-building lessons; each example is a complete single-document lab.
export default [
  {
    "id": "textbox-editing",
    "title": "Build a text field that preserves the user’s intent",
    "summary": "Coordinate editing, validation feedback, and explicit submission.",
    "track": "everyday-controls",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var input = new TextBox { Header = \"Task title\", PlaceholderText = \"Name the next action\", MaxLength = 40 };\n        var status = new TextBlock { Text = \"0 characters\" };\n        var saved = new TextBlock { Text = \"Nothing saved\", TextWrapping = TextWrapping.Wrap };\n        var commit = new Button { Content = \"Save title\", IsEnabled = false };\n        input.TextChanged += (_, _) => { status.Text = $\"{input.Text.Length} characters\"; commit.IsEnabled = input.Text.Trim().Length >= 3; };\n        commit.Click += (_, _) => saved.Text = \"Saved: \" + input.Text.Trim();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(status); root.Children.Add(commit); root.Children.Add(saved); return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var input = new TextBox { Header = \"Task title\", PlaceholderText = \"Name the next action\", MaxLength = 60 };\n        var status = new TextBlock { Text = \"0 characters\" };\n        var saved = new TextBlock { Text = \"Nothing saved\", TextWrapping = TextWrapping.Wrap };\n        var commit = new Button { Content = \"Save title\", IsEnabled = false };\n        input.TextChanged += (_, _) => { status.Text = $\"{input.Text.Length} characters\"; commit.IsEnabled = input.Text.Trim().Length >= 3; };\n        commit.Click += (_, _) => saved.Text = \"Saved: \" + input.Text.Trim();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(input); root.Children.Add(status); root.Children.Add(commit); root.Children.Add(saved); return root;\n    }\n}\n\n\n",
    "anchor": "MaxLength = 40",
    "challenge": "Allow a task title of up to sixty characters",
    "rules": [
      {
        "contains": "MaxLength = 60",
        "label": "Allow a task title of up to sixty characters"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Coordinate editing, validation feedback, and explicit submission.",
      "Allow a task title of up to sixty characters"
    ],
    "hints": [
      "Locate MaxLength = 40 and predict the current behavior.",
      "Try MaxLength = 60; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why use a Header as well as a placeholder?",
      "options": [
        "A placeholder disappears while editing; a persistent label keeps the field’s meaning visible",
        "A placeholder enforces a schema",
        "A Header automatically saves the value"
      ],
      "answer": 0,
      "explanation": "A persistent label remains useful while the user has entered text. Placeholder examples and validation rules have different roles."
    },
    "source": "uno-howto-create-a-repro",
    "diagram": "pipeline",
    "concepts": [
      [
        "Give the field a stable meaning",
        "A Header describes the field, while PlaceholderText can show an example or short hint before input exists. Do not make disappearing text the only indication of the field’s purpose. Keep the wording concise and verify the accessible name on the actual platform. A character counter can be supplemental feedback, but it should not replace a meaningful label or overwhelm announcements."
      ],
      [
        "Preserve intermediate editing states",
        "TextChanged reports edits, including changes caused by programmatic assignments. A user may temporarily have an empty string while replacing a title, and an input method editor can produce composition-related transitions. Avoid rewriting the Text property on every event simply to enforce presentation preferences. Rewriting can move the caret, interfere with selection, or disrupt composition."
      ],
      [
        "Expose commit availability and feedback",
        "A disabled action should correspond to a rule the user can understand. This lab requires three trimmed characters and caps input length at the control. The view’s rule is a usability aid; the application service must still validate accepted data. Show the committed result separately so the user can see the difference between a draft and a saved value."
      ]
    ],
    "predict": "Create a task-title editor that is understandable before, during, and after typing. The field must preserve the draft, explain whether Save is available, and keep the last committed title separate. Test keyboard input, paste, whitespace, and a long title instead of assuming that a TextBox with a border is already a complete form interaction.",
    "transfer": "Build a reusable title editor with a persistent label, visible validation, dirty state, Save, and Cancel. Test IME and paste behavior on your actual targets. Extract rules into a view model or application service while leaving focus, caret, and selection operations in the view layer.",
    "pitfall": "MaxLength constrains one UI entry point; it does not validate imported data or service requests. Keep the same domain rule at the boundary used by non-UI callers.",
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/text-box"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "debug-loop"
    ]
  },
  {
    "id": "combobox-keys",
    "title": "Select values by key, not by display text",
    "summary": "Use ComboBox item data and a stable SelectedValue contract.",
    "track": "everyday-controls",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var options = new[] { new Priority(\"low\", \"Low priority\"), new Priority(\"high\", \"High priority\") };\n        var choices = new ComboBox { Header = \"Priority\", ItemsSource = options, DisplayMemberPath = \"Name\", SelectedValuePath = \"Code\", SelectedIndex = 0, MinWidth = 240 };\n        var output = new TextBlock { Text = \"Key: \" + (choices.SelectedValue as string ?? \"none\") };\n        choices.SelectionChanged += (_, _) => output.Text = \"Key: \" + (choices.SelectedValue as string ?? \"none\");\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(choices); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed record Priority(string Code, string Name);\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var options = new[] { new Priority(\"low\", \"Low priority\"), new Priority(\"high\", \"High priority\") };\n        var choices = new ComboBox { Header = \"Priority\", ItemsSource = options, DisplayMemberPath = \"Name\", SelectedValuePath = \"Code\", SelectedIndex = 1, MinWidth = 240 };\n        var output = new TextBlock { Text = \"Key: \" + (choices.SelectedValue as string ?? \"none\") };\n        choices.SelectionChanged += (_, _) => output.Text = \"Key: \" + (choices.SelectedValue as string ?? \"none\");\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(choices); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed record Priority(string Code, string Name);\n",
    "anchor": "SelectedIndex = 0",
    "challenge": "Start with the high-priority item selected",
    "rules": [
      {
        "contains": "SelectedIndex = 1",
        "label": "Start with the high-priority item selected"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Use ComboBox item data and a stable SelectedValue contract.",
      "Start with the high-priority item selected"
    ],
    "hints": [
      "Locate SelectedIndex = 0 and predict the current behavior.",
      "Try SelectedIndex = 1; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Which value should normally be stored for a localized choice?",
      "options": [
        "Its stable code",
        "The translated display label",
        "The visual container’s current row number"
      ],
      "answer": 0,
      "explanation": "A stable code survives translation and reordering. Presentation text can change without changing the underlying domain choice."
    },
    "source": "data-template",
    "diagram": "pipeline",
    "concepts": [
      [
        "Separate identity from presentation",
        "A choice has a meaning independent of its label. Code low can be displayed as Low priority, translated into another language, or shown with an icon without changing the saved value. Model both fields explicitly. Avoid using localized strings as database keys or branching on text that a designer may legitimately edit."
      ],
      [
        "Understand each selection property",
        "SelectedIndex is a position, SelectedItem is an object, and SelectedValue is the result of the configured path. They are related but not interchangeable. An index is convenient for an initial fixture, while a stable key is usually safer for restoration. Handle null when the control has no selection or its source is replaced."
      ],
      [
        "Let the control own its containers",
        "Provide ordinary data through ItemsSource and use DisplayMemberPath for a simple label. When richer visuals are required, use an ItemTemplate rather than turning the domain collection into a list of UI controls. The control should own selection behavior, keyboard navigation, and item-container lifecycle; the application should own the chosen domain value."
      ]
    ],
    "predict": "An app offers Low and High priority, but a translated label or reordered menu must not change what is saved. Bind the selector to data objects, choose a display member for people and a stable value for application logic, and handle the absence of a selection instead of assuming every ComboBox always contains a valid item.",
    "transfer": "Add priority selection to the task workspace. Store its key, restore by key, test an unknown saved code, and provide accessible labels for richer templates. Compare the upstream ComboBox sample with your source-replacement behavior and keep any platform picker differences explicit.",
    "pitfall": "A removed choice must not silently become a different choice with the same old index. Detect missing stable keys and present an explicit reconciliation policy.",
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/combo-box"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "data-templates"
    ]
  },
  {
    "id": "listview-selection",
    "title": "Treat list selection as application state",
    "summary": "Distinguish selected items from item invocation and visible positions.",
    "track": "everyday-controls",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var tasks = new[] { new Row(11, \"Draft\"), new Row(22, \"Review\"), new Row(33, \"Publish\") };\n        var list = new ListView { ItemsSource = tasks, DisplayMemberPath = \"Title\", SelectionMode = ListViewSelectionMode.Multiple, Height = 220 };\n        var output = new TextBlock { Text = \"Selected IDs: none\", TextWrapping = TextWrapping.Wrap };\n        list.SelectionChanged += (_, _) => output.Text = \"Selected IDs: \" + string.Join(\", \", list.SelectedItems.Cast<Row>().Select(item => item.Id));\n        var clear = new Button { Content = \"Clear selection\" };\n        clear.Click += (_, _) => list.SelectedItems.Clear();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(list); root.Children.Add(clear); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed record Row(int Id, string Title);\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var tasks = new[] { new Row(11, \"Draft\"), new Row(22, \"Review\"), new Row(33, \"Publish\") };\n        var list = new ListView { ItemsSource = tasks, DisplayMemberPath = \"Title\", SelectionMode = ListViewSelectionMode.Single, Height = 220 };\n        var output = new TextBlock { Text = \"Selected IDs: none\", TextWrapping = TextWrapping.Wrap };\n        list.SelectionChanged += (_, _) => output.Text = \"Selected IDs: \" + string.Join(\", \", list.SelectedItems.Cast<Row>().Select(item => item.Id));\n        var clear = new Button { Content = \"Clear selection\" };\n        clear.Click += (_, _) => list.SelectedItems.Clear();\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(list); root.Children.Add(clear); root.Children.Add(output); return root;\n    }\n}\n\npublic sealed record Row(int Id, string Title);\n",
    "anchor": "ListViewSelectionMode.Multiple",
    "challenge": "Change the list to single selection",
    "rules": [
      {
        "contains": "ListViewSelectionMode.Single",
        "label": "Change the list to single selection"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Distinguish selected items from item invocation and visible positions.",
      "Change the list to single selection"
    ],
    "hints": [
      "Locate ListViewSelectionMode.Multiple and predict the current behavior.",
      "Try ListViewSelectionMode.Single; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Is selecting an item necessarily the same as invoking its primary action?",
      "options": [
        "No; selection and invocation are separate interaction contracts",
        "Yes; every selected item must navigate immediately",
        "Only text items can be selected"
      ],
      "answer": 0,
      "explanation": "Selection can prepare a batch operation or a details view; invocation can open or activate an item. Design the two behaviors deliberately."
    },
    "source": "items-source",
    "diagram": "pipeline",
    "concepts": [
      [
        "Choose the interaction contract",
        "ListView supports different selection policies and optional item-click behavior. A multi-select list often represents a pending batch operation; a browse list may use single selection for a details pane. Do not attach destructive work directly to SelectionChanged without understanding that keyboard navigation and programmatic changes can also alter selection."
      ],
      [
        "Project selected data into stable keys",
        "SelectedItems contains selected data objects when ItemsSource is data-based. Convert them into stable keys before invoking a batch service and capture that set at the moment the action starts. Do not keep enumerating a changing selection while an asynchronous delete is in progress, or the operation may act on a different set than the user confirmed."
      ],
      [
        "Handle source changes deliberately",
        "Filtering, replacing, or reordering ItemsSource can change visible membership and container identity. Keep domain IDs as the durable selection reference and reconcile them against the new source. Decide what happens when selected data becomes hidden or deleted; neither preserving every stale selection nor silently selecting another row is universally correct."
      ]
    ],
    "predict": "A task list needs both single-item details and future batch actions. Begin by making selected IDs visible, then decide whether clicking selects, invokes, or both. Keep selection independent of current row positions so filtering and sorting cannot make a delete or edit operation target the wrong task.",
    "transfer": "Connect ListView selection to a details view model and a separate batch-command model. Preserve keys across sorting, reconcile removed items, and test keyboard behavior. Keep item invocation and batch confirmation as explicit actions rather than overloading SelectionChanged.",
    "pitfall": "Selection expresses user intent, not proof that an entity still exists or that the caller is authorized to mutate it. Revalidate captured IDs at the operation boundary.",
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "observable-collections"
    ]
  },
  {
    "id": "navigationview-shell",
    "title": "Build an adaptive NavigationView shell",
    "summary": "Keep top-level menu selection separate from the content it controls.",
    "track": "everyday-controls",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var view = new NavigationView { PaneDisplayMode = NavigationViewPaneDisplayMode.LeftCompact, IsSettingsVisible = false, Height = 340 };\n        view.MenuItems.Add(new NavigationViewItem { Content = \"Overview\", Tag = \"overview\" });\n        view.MenuItems.Add(new NavigationViewItem { Content = \"Tasks\", Tag = \"tasks\" });\n        var content = new TextBlock { Text = \"Choose a destination\", FontSize = 24, Margin = new Thickness(24) };\n        view.Content = content;\n        view.ItemInvoked += (_, e) => {\n            if (e.InvokedItemContainer is NavigationViewItem item)\n                content.Text = \"Destination: \" + item.Tag;\n        };\n        return view;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var view = new NavigationView { PaneDisplayMode = NavigationViewPaneDisplayMode.Top, IsSettingsVisible = false, Height = 340 };\n        view.MenuItems.Add(new NavigationViewItem { Content = \"Overview\", Tag = \"overview\" });\n        view.MenuItems.Add(new NavigationViewItem { Content = \"Tasks\", Tag = \"tasks\" });\n        var content = new TextBlock { Text = \"Choose a destination\", FontSize = 24, Margin = new Thickness(24) };\n        view.Content = content;\n        view.ItemInvoked += (_, e) => {\n            if (e.InvokedItemContainer is NavigationViewItem item)\n                content.Text = \"Destination: \" + item.Tag;\n        };\n        return view;\n    }\n}\n\n\n",
    "anchor": "NavigationViewPaneDisplayMode.LeftCompact",
    "challenge": "Present top-level destinations in a top navigation layout",
    "rules": [
      {
        "contains": "NavigationViewPaneDisplayMode.Top",
        "label": "Present top-level destinations in a top navigation layout"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Keep top-level menu selection separate from the content it controls.",
      "Present top-level destinations in a top navigation layout"
    ],
    "hints": [
      "Locate NavigationViewPaneDisplayMode.LeftCompact and predict the current behavior.",
      "Try NavigationViewPaneDisplayMode.Top; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "What does NavigationView provide by itself?",
      "options": [
        "A navigation shell and menu interaction, not every application routing policy",
        "A complete persistence and authorization server",
        "Automatic navigation to any string in Content"
      ],
      "answer": 0,
      "explanation": "NavigationView supplies the shell. The app or Uno.Extensions.Navigation connects destinations, parameters, history, and guards."
    },
    "source": "navigation",
    "diagram": "pipeline",
    "concepts": [
      [
        "Separate the shell from its pages",
        "A NavigationView owns menu presentation and content placement. It does not automatically define your repository, authentication policy, or page lifecycle. Keep the shell stable while the content region changes. A Frame or Uno.Extensions region can later supply page navigation without requiring every page to recreate the global menu."
      ],
      [
        "Use stable destination metadata",
        "Menu Content is for presentation; a Tag or view-model property can hold a stable key. Read the invoked item’s data rather than comparing translated labels. Distinguish an invocation event from a selection-state update, because selecting an item programmatically may reflect navigation that already occurred through a deep link or back action."
      ],
      [
        "Adapt presentation without changing intent",
        "PaneDisplayMode can alter the placement and compactness of the navigation UI. The destinations remain conceptually the same. Test the available width, text scaling, keyboard access, and current selection in each mode. Do not remove essential destinations on narrow screens merely because a desktop menu has become inconvenient."
      ]
    ],
    "predict": "Your application has several top-level areas that must remain recognizable on a wide desktop window and a narrow view. Use NavigationView as a shell, give each menu item a stable destination key, and connect invocation to content deliberately. Do not confuse a highlighted menu item with a completed navigation operation.",
    "transfer": "Connect this shell to the Frame and route-registration lessons. Add settings, a back action, and state restoration, then verify that rejected navigation and deep links keep menu selection coherent. Compare the pinned Uno NavigationView guidance with the renderer and target you actually deploy.",
    "pitfall": "A menu highlight can change before a requested navigation succeeds. Keep selection consistent with the active destination, including failures and cancelled transitions.",
    "references": [
      "https://platform.uno/docs/articles/controls/NavigationView.html"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "navigation"
    ]
  },
  {
    "id": "dialog-decisions",
    "title": "Use ContentDialog for an explicit decision",
    "summary": "Await the result and commit only the action the user accepted.",
    "track": "everyday-controls",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        var output = new TextBlock { Text = \"No decision yet\", TextWrapping = TextWrapping.Wrap };\n        var open = new Button { Content = \"Review delete decision\" };\n        open.Click += async (_, _) => {\n            open.IsEnabled = false;\n            try {\n                var dialog = new ContentDialog {\n                    Title = \"Delete this draft?\", Content = \"The example records a decision; no file is deleted.\",\n                    PrimaryButtonText = \"Delete\", CloseButtonText = \"Keep draft\", XamlRoot = root.XamlRoot\n                };\n                var result = await dialog.ShowAsync();\n                output.Text = result == ContentDialogResult.Primary ? \"Accepted delete decision\" : \"Draft kept\";\n            }\n            catch (Exception error) { output.Text = \"Dialog failed: \" + error.Message; }\n            finally { open.IsEnabled = true; }\n        };\n        root.Children.Add(open); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        var output = new TextBlock { Text = \"No decision yet\", TextWrapping = TextWrapping.Wrap };\n        var open = new Button { Content = \"Review delete decision\" };\n        open.Click += async (_, _) => {\n            open.IsEnabled = false;\n            try {\n                var dialog = new ContentDialog {\n                    Title = \"Delete this draft?\", Content = \"The example records a decision; no file is deleted.\",\n                    PrimaryButtonText = \"Delete\", CloseButtonText = \"Cancel deletion\", XamlRoot = root.XamlRoot\n                };\n                var result = await dialog.ShowAsync();\n                output.Text = result == ContentDialogResult.Primary ? \"Accepted delete decision\" : \"Draft kept\";\n            }\n            catch (Exception error) { output.Text = \"Dialog failed: \" + error.Message; }\n            finally { open.IsEnabled = true; }\n        };\n        root.Children.Add(open); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "anchor": "CloseButtonText = \"Keep draft\"",
    "challenge": "Make the safe dismissal action say Cancel deletion",
    "rules": [
      {
        "contains": "CloseButtonText = \"Cancel deletion\"",
        "label": "Make the safe dismissal action say Cancel deletion"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Await the result and commit only the action the user accepted.",
      "Make the safe dismissal action say Cancel deletion"
    ],
    "hints": [
      "Locate CloseButtonText = \"Keep draft\" and predict the current behavior.",
      "Try CloseButtonText = \"Cancel deletion\"; then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "When should the caller apply the destructive action?",
      "options": [
        "After an accepted result, not merely after showing the dialog",
        "As soon as the dialog object is constructed",
        "Whenever the dialog loses focus"
      ],
      "answer": 0,
      "explanation": "Showing a dialog requests a decision. Inspect the returned ContentDialogResult and treat dismissal as a separate outcome."
    },
    "source": "events",
    "diagram": "pipeline",
    "concepts": [
      [
        "State the consequence clearly",
        "A dialog title should describe the decision, and button labels should identify actions rather than force the user to decode Yes and No. Use a dialog for a meaningful interruption, not every minor interaction. The safe dismissal path should preserve existing data. Keep the actual operation outside the display-construction code until the result is known."
      ],
      [
        "Associate the dialog with its host",
        "Create and show the dialog after the initiating view is attached, and supply the correct XamlRoot when the hosting API requires it. Multi-window or embedded scenarios cannot assume one global root is always appropriate. Avoid showing several dialogs concurrently in the same context; serialize the decision workflow and keep the initiating action disabled while it is active."
      ],
      [
        "Await and interpret the result",
        "ShowAsync completes with a result describing the accepted action or dismissal. Branch explicitly on Primary before committing destructive work. A closed dialog is not necessarily an accepted dialog. Errors and cancellation should restore action availability while preserving the draft and enough context to explain what happened."
      ]
    ],
    "predict": "A delete operation needs a clear decision, not an ambiguous popup whose dismissal accidentally commits the action. Show a ContentDialog from a loaded Uno view, await its result, and leave the draft intact unless the primary action is accepted. The lab records decisions only; it deliberately deletes no files or persisted data.",
    "transfer": "Add a dialog service boundary that returns a typed decision to a view model while the view adapter owns XamlRoot and focus. Test accept, dismiss, host failure, and repeated opening. Keep the real mutation after acceptance and handle repository failure without pretending that the dialog itself performed a successful save or delete.",
    "pitfall": "A dialog can work once and leave its launcher disabled or retain stale state. Test close, cancellation, repeated opening, host lifetime and focus restoration.",
    "references": [
      "https://platform.uno/docs/articles/controls/ContentDialog.html",
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/dialogs-and-flyouts/dialogs"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "events"
    ]
  },
  {
    "id": "autosuggest-search",
    "title": "Build suggestions without feedback loops",
    "summary": "Separate user edits, chosen suggestions, and submitted queries.",
    "track": "everyday-controls",
    "code": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var values = new[] { \"Grid\", \"GridView\", \"ListView\", \"TextBox\", \"NavigationView\", \"ContentDialog\" };\n        var search = new AutoSuggestBox { PlaceholderText = \"Find a control\" };\n        var output = new TextBlock { Text = \"Nothing submitted\", TextWrapping = TextWrapping.Wrap };\n        search.TextChanged += (sender, e) => {\n            if (e.Reason != AutoSuggestionBoxTextChangeReason.UserInput) return;\n            sender.ItemsSource = values.Where(value => value.Contains(sender.Text, StringComparison.OrdinalIgnoreCase)).Take(4).ToArray();\n        };\n        search.QuerySubmitted += (_, e) => output.Text = \"Submitted: \" + (e.ChosenSuggestion as string ?? e.QueryText);\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(new TextBlock { Text = \"Search controls\", FontSize = 24 });\n        root.Children.Add(search); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "solution": "using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing System.Collections.ObjectModel;\nusing System.ComponentModel;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Data;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var values = new[] { \"Grid\", \"GridView\", \"ListView\", \"TextBox\", \"NavigationView\", \"ContentDialog\" };\n        var search = new AutoSuggestBox { PlaceholderText = \"Find a control\" };\n        var output = new TextBlock { Text = \"Nothing submitted\", TextWrapping = TextWrapping.Wrap };\n        search.TextChanged += (sender, e) => {\n            if (e.Reason != AutoSuggestionBoxTextChangeReason.UserInput) return;\n            sender.ItemsSource = values.Where(value => value.Contains(sender.Text, StringComparison.OrdinalIgnoreCase)).Take(6).ToArray();\n        };\n        search.QuerySubmitted += (_, e) => output.Text = \"Submitted: \" + (e.ChosenSuggestion as string ?? e.QueryText);\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };\n        root.Children.Add(new TextBlock { Text = \"Search controls\", FontSize = 24 });\n        root.Children.Add(search); root.Children.Add(output); return root;\n    }\n}\n\n\n",
    "anchor": "Take(4)",
    "challenge": "Show up to six matching suggestions",
    "rules": [
      {
        "contains": "Take(6)",
        "label": "Show up to six matching suggestions"
      }
    ],
    "language": "csharp",
    "minutes": 20,
    "objectives": [
      "Separate user edits, chosen suggestions, and submitted queries.",
      "Show up to six matching suggestions"
    ],
    "hints": [
      "Locate Take(4) and predict the current behavior.",
      "Try Take(6); then test both the normal case and the boundary described in the chapter."
    ],
    "quiz": {
      "question": "Why inspect TextChangedEventArgs.Reason?",
      "options": [
        "To avoid treating selection or programmatic updates as fresh user typing",
        "To disable all keyboard input",
        "To make filtering automatically run on a server"
      ],
      "answer": 0,
      "explanation": "A suggestion selection can update Text. Checking the reason prevents unnecessary filtering or feedback loops when the change was not a new user edit."
    },
    "source": "async",
    "diagram": "pipeline",
    "concepts": [
      [
        "Separate suggestions from committed intent",
        "Typing changes the candidate list; submitting performs the task. Showing a suggestion does not mean the user selected it, and selecting an item can update text without representing another independent keystroke. Use separate state for the current phrase, available suggestions, and accepted query so a UI event cannot accidentally start the wrong operation."
      ],
      [
        "Filter only the appropriate changes",
        "AutoSuggestBox reports why Text changed. Restrict the local filtering handler to UserInput so a selection-driven text assignment does not recursively behave like a new typed query. A programmatic refresh may need its own explicit path. Keep the matching policy predictable, including culture, case sensitivity, maximum results, and empty input behavior."
      ],
      [
        "Respect the submitted value",
        "QuerySubmitted can contain a chosen suggestion or plain query text. Prefer the typed domain item when one was chosen, and otherwise validate the textual query. For object suggestions, keep stable IDs and a display property rather than interpreting the label as identity. Do not rely on a stale local variable captured before the user finalized the input."
      ]
    ],
    "predict": "A control search should suggest likely matches while keeping submitted intent separate from intermediate typing. AutoSuggestBox provides distinct events for text changes, suggestion choice, and submission. Learn to respect those boundaries before connecting the UI to an asynchronous remote search where duplicate requests and stale results become costly.",
    "transfer": "Create an entity picker backed by an injected search service. Keep stable IDs, expose loading/empty/error states, limit suggestions, and test stale completions and keyboard submission. Compare the upstream AutoSuggestBox event sample with your async acceptance policy rather than assuming a local filter demonstrates remote correctness.",
    "pitfall": "Filtering on UserInput prevents programmatic text changes from issuing new searches; it does not order asynchronous results. Add cancellation and a generation check when replacing the local fixture with I/O.",
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/auto-suggest-box"
    ],
    "introducedIn": "0.4.0",
    "prerequisiteLessons": [
      "async-cancellation"
    ]
  }
];
