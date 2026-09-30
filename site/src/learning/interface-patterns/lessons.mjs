import {commonControlLessons} from "./common-controls.mjs";
/** Original source-informed design lessons. Mockups and Uno execution are explicitly separate. */
export const interfaceLessons = [
  {
    "id": "bounded-scrolling",
    "title": "Give scrolling one clear owner",
    "summary": "Keep a finite viewport, preserve input position, and avoid accidental nested scroll regions.",
    "features": [
      "ScrollViewer",
      "StackPanel",
      "ListView"
    ],
    "prerequisites": [
      "layout-panels",
      "virtualization"
    ],
    "steps": [
      {
        "title": "Separate extent from viewport",
        "explanation": "The viewport is the finite area through which content is visible. The extent is the content size along the scrolling axis. A scrollbar represents a relationship between those two sizes; it does not create a layout constraint by itself. Before adjusting wheel events, inspect the parent chain and identify who offers finite height. A vertical StackPanel commonly lets its content request as much height as it needs. Placing a list in that unbounded direction can therefore produce a long page rather than the contained list you expected.",
        "worked": "A detail panel contains a header, a document and a footer. Give the document a star-sized Grid row; the header and footer use Auto. The middle region can scroll without pushing the actions below the screen.",
        "prompt": "Does adding a ScrollViewer guarantee a finite viewport?",
        "answer": "No. The surrounding layout must still provide a bounded slot. Extent and viewport are distinct values."
      },
      {
        "title": "Choose one scrolling owner per task",
        "explanation": "Nested scrolling is sometimes intentional, but it must correspond to separate tasks. A source editor inside a document can own its own scroll. Two vertical scrollers around the same ListView usually compete for wheel, touch and keyboard input. Use the control’s built-in scroll behavior when it already virtualizes items. A plain ScrollViewer can show a long StackPanel, but that does not turn all its children into virtualized containers. Distinguish UI virtualization from downloading or paging data.",
        "worked": "In the mockup, the document region has a fixed height while the header stays visible. Compare its extent with the viewport and move the offset to the maximum.",
        "prompt": "Does wrapping many TextBlocks in ScrollViewer virtualize them?",
        "answer": "No. A scrollable panel can still create every TextBlock. Virtualization requires an appropriate items control and layout."
      },
      {
        "title": "Preserve a useful reading position",
        "explanation": "A refresh, selection or layout change should not unexpectedly move the reader to an unrelated location. Choose the item identity or anchor that matters, then restore its position when the layout is ready. Avoid recording only a raw pixel offset for data whose preceding rows can change height. ChangeView requests a change; layout and scrolling events are where you observe the final state. Do not force synchronous layout repeatedly as a workaround for an unclear ownership model.",
        "worked": "The Uno lab starts at the top. Its action requests an offset of 120 logical units; the viewport and text still belong to the same ScrollViewer.",
        "prompt": "When should you record the actual final scroll position?",
        "answer": "Observe the scrolling/layout state after the request is processed rather than assuming the requested position was used unchanged."
      },
      {
        "title": "Test the edges of the viewport",
        "explanation": "Exercise empty content, content shorter than the viewport, long unbroken text, keyboard navigation and large text scale. Ensure the last focusable control can be reached without needing a pointer. Test resize while scrolled near the end. A clipped screenshot alone cannot show whether keyboard focus moved offscreen, so combine geometry checks with a real interaction. Treat a diagram showing sample row heights as a teaching assumption, not a measurement of the actual template.",
        "worked": "Set the mock viewport taller than its content. The maximum modeled offset becomes zero; increasing content length introduces a scrollable range again.",
        "prompt": "What is the maximum offset in the fixed-size model?",
        "answer": "max(0, extent minus viewport). Real content may have additional platform-specific rounding and zoom behavior."
      }
    ],
    "tips": [
      "Keep persistent actions outside the content scroller.",
      "Do not put a virtualizing list inside an unbounded same-axis scroller.",
      "Test keyboard access to the last item and large text."
    ],
    "scenario": "Build a document pane with a persistent title, a scrolling body and an action footer. Test resizing without losing the selected paragraph.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var content = new StackPanel { Spacing = 10, Padding = new Thickness(16) };\n        for (var i = 1; i <= 30; i++) content.Children.Add(new TextBlock { Text = $\"Paragraph {i}: read, inspect, then change one assumption.\", TextWrapping = TextWrapping.Wrap });\n        var scroll = new ScrollViewer { Height = 220, Content = content, VerticalScrollBarVisibility = ScrollBarVisibility.Auto };\n        var action = new Button { Content = \"Scroll to 120\" };\n        action.Click += (_, _) => scroll.ChangeView(null, 120, null);\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(new TextBlock { Text = \"A bounded document\", FontSize = 24 });\n        root.Children.Add(scroll); root.Children.Add(action); return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var content = new StackPanel { Spacing = 10, Padding = new Thickness(16) };\n        for (var i = 1; i <= 30; i++) content.Children.Add(new TextBlock { Text = $\"Paragraph {i}: read, inspect, then change one assumption.\", TextWrapping = TextWrapping.Wrap });\n        var scroll = new ScrollViewer { Height = 300, Content = content, VerticalScrollBarVisibility = ScrollBarVisibility.Auto };\n        var action = new Button { Content = \"Scroll to 120\" };\n        action.Click += (_, _) => scroll.ChangeView(null, 120, null);\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(new TextBlock { Text = \"A bounded document\", FontSize = 24 });\n        root.Children.Add(scroll); root.Children.Add(action); return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": "Height = 220",
    "challenge": "Replace Height = 220 with Height = 300 and explain the changed behavior.",
    "rules": [
      {
        "contains": "Height = 300",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate Height = 220.",
      "Try Height = 300 and test a boundary case."
    ],
    "quiz": {
      "question": "Which object should own scrolling for a single virtualized list?",
      "options": [
        "Normally the list’s own scrolling mechanism, within a finite layout slot.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "Normally the list’s own scrolling mechanism, within a finite layout slot."
    },
    "concepts": [
      [
        "Separate extent from viewport",
        "The viewport is the finite area through which content is visible. The extent is the content size along the scrolling axis. A scrollbar represents a relationship between those two sizes; it does not create a layout constraint by itself. Before adjusting wheel events, inspect the parent chain and identify who offers finite height. A vertical StackPanel commonly lets its content request as much height as it needs. Placing a list in that unbounded direction can therefore produce a long page rather than the contained list you expected."
      ],
      [
        "Choose one scrolling owner per task",
        "Nested scrolling is sometimes intentional, but it must correspond to separate tasks. A source editor inside a document can own its own scroll. Two vertical scrollers around the same ListView usually compete for wheel, touch and keyboard input. Use the control’s built-in scroll behavior when it already virtualizes items. A plain ScrollViewer can show a long StackPanel, but that does not turn all its children into virtualized containers. Distinguish UI virtualization from downloading or paging data."
      ],
      [
        "Preserve a useful reading position",
        "A refresh, selection or layout change should not unexpectedly move the reader to an unrelated location. Choose the item identity or anchor that matters, then restore its position when the layout is ready. Avoid recording only a raw pixel offset for data whose preceding rows can change height. ChangeView requests a change; layout and scrolling events are where you observe the final state. Do not force synchronous layout repeatedly as a workaround for an unclear ownership model."
      ]
    ],
    "references": [
      "https://platform.uno/docs/articles/controls/ScrollViewer.html"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Build a document pane with a persistent title, a scrolling body and an action footer. Test resizing without losing the selected paragraph."
  },
  {
    "id": "choice-semantics",
    "title": "Choose the control that matches the decision",
    "summary": "Distinguish independent options, mutually exclusive choices and immediate settings.",
    "features": [
      "CheckBox",
      "RadioButton",
      "ToggleSwitch"
    ],
    "prerequisites": [
      "textbox-editing",
      "binding-flow"
    ],
    "steps": [
      {
        "title": "Describe the cardinality before drawing",
        "explanation": "Ask how many values can be selected and when the decision takes effect. Independent choices form a set: zero, one or several may be valid. Radio buttons express one choice from a related group. A ToggleSwitch communicates an immediate on/off setting, not a collection item selected for a future bulk action. Starting from these semantics prevents a visually fashionable control from carrying the wrong interaction contract. The domain should still validate illegal combinations.",
        "worked": "Delivery speed is one choice: Standard or Express. Email and SMS notifications are independent options; enabling one does not imply the other.",
        "prompt": "Would two independent checkboxes correctly enforce exactly one delivery speed?",
        "answer": "Not without extra policy. A radio group directly expresses mutual exclusivity."
      },
      {
        "title": "Label the resulting state",
        "explanation": "A label should explain what the user is changing, not merely repeat On or Off. Keep the meaning stable when the value changes. A switch titled Enable notifications means its checked state is an enabled setting; avoid a double negative such as Do not disable alerts. A three-state CheckBox can represent mixed child selection, but mixed is not equivalent to false. Make the aggregate rule explicit and provide textual feedback when it matters.",
        "worked": "The example’s Remember filters switch remains labelled the same in both states. Its output spells out the actual enabled value.",
        "prompt": "Is an indeterminate aggregate checkbox the same as no items selected?",
        "answer": "No. It commonly represents a mixture of selected and unselected children, depending on the application contract."
      },
      {
        "title": "Keep the stored value independent of the caption",
        "explanation": "Labels can change with language or editorial improvements. Persist stable keys or enum values, not displayed strings. When a server or repository changes the selected option, update the same state object that the view observes. Avoid storing independent copies of a Boolean in a view, model and control and then synchronizing them by convention. For submit-based forms, hold the choices in a draft and commit them together only after validation.",
        "worked": "A saved shipping key might be express while its visible label becomes Expedited delivery. The selection should remain intact after that wording change.",
        "prompt": "Why should a translated label not be the persistent selection key?",
        "answer": "Translations and wording are presentation data; stable identifiers preserve meaning across those changes."
      },
      {
        "title": "Verify keyboard and grouping behavior",
        "explanation": "Use a group name that is specific to the decision. Accidentally reusing a radio-group name across two unrelated settings can couple them. Test tabbing into the group, arrow navigation, disabled choices and initial defaults on the actual target. The mockup demonstrates the set and single-value models, not the platform’s full keyboard implementation. Ensure an action never interprets a missing required choice as an arbitrary first item.",
        "worked": "Create two shipping groups in different documents. They should not clear one another’s selection merely because their controls have the same caption.",
        "prompt": "Which test exposes accidental coupling?",
        "answer": "Change a choice in one group and assert that an unrelated group’s stored value and visible selection remain unchanged."
      }
    ],
    "tips": [
      "Use short positive setting labels.",
      "Group related radio choices under one visible question.",
      "Distinguish immediate settings from pending form drafts."
    ],
    "scenario": "Design a notification settings card with one delivery preference and two independent channels. Save stable identifiers and verify keyboard-only selection.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        var standard = new RadioButton { Content = \"Standard\", GroupName = \"delivery\", IsChecked = true };\n        var express = new RadioButton { Content = \"Express\", GroupName = \"delivery\" };\n        var email = new CheckBox { Content = \"Email updates\", IsChecked = true };\n        var sms = new CheckBox { Content = \"SMS updates\" };\n        var remember = new ToggleSwitch { Header = \"Remember filters\", IsOn = false };\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        var inspect = new Button { Content = \"Inspect choices\" };\n        inspect.Click += (_, _) => output.Text = $\"Delivery: {(express.IsChecked == true ? \"express\" : \"standard\")}; channels: email={email.IsChecked}, sms={sms.IsChecked}; remember={remember.IsOn}\";\n        root.Children.Add(standard); root.Children.Add(express); root.Children.Add(email); root.Children.Add(sms); root.Children.Add(remember); root.Children.Add(inspect); root.Children.Add(output); return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        var standard = new RadioButton { Content = \"Standard\", GroupName = \"delivery\", IsChecked = true };\n        var express = new RadioButton { Content = \"Express\", GroupName = \"delivery\" };\n        var email = new CheckBox { Content = \"Email updates\", IsChecked = true };\n        var sms = new CheckBox { Content = \"SMS updates\" };\n        var remember = new ToggleSwitch { Header = \"Remember filters\", IsOn = true };\n        var output = new TextBlock { TextWrapping = TextWrapping.Wrap };\n        var inspect = new Button { Content = \"Inspect choices\" };\n        inspect.Click += (_, _) => output.Text = $\"Delivery: {(express.IsChecked == true ? \"express\" : \"standard\")}; channels: email={email.IsChecked}, sms={sms.IsChecked}; remember={remember.IsOn}\";\n        root.Children.Add(standard); root.Children.Add(express); root.Children.Add(email); root.Children.Add(sms); root.Children.Add(remember); root.Children.Add(inspect); root.Children.Add(output); return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": "IsOn = false",
    "challenge": "Replace IsOn = false with IsOn = true and explain the changed behavior.",
    "rules": [
      {
        "contains": "IsOn = true",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate IsOn = false.",
      "Try IsOn = true and test a boundary case."
    ],
    "quiz": {
      "question": "What is the correct model for independent notification channels?",
      "options": [
        "A set of independently selected values, not one mutually exclusive selection.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "A set of independently selected values, not one mutually exclusive selection."
    },
    "concepts": [
      [
        "Describe the cardinality before drawing",
        "Ask how many values can be selected and when the decision takes effect. Independent choices form a set: zero, one or several may be valid. Radio buttons express one choice from a related group. A ToggleSwitch communicates an immediate on/off setting, not a collection item selected for a future bulk action. Starting from these semantics prevents a visually fashionable control from carrying the wrong interaction contract. The domain should still validate illegal combinations."
      ],
      [
        "Label the resulting state",
        "A label should explain what the user is changing, not merely repeat On or Off. Keep the meaning stable when the value changes. A switch titled Enable notifications means its checked state is an enabled setting; avoid a double negative such as Do not disable alerts. A three-state CheckBox can represent mixed child selection, but mixed is not equivalent to false. Make the aggregate rule explicit and provide textual feedback when it matters."
      ],
      [
        "Keep the stored value independent of the caption",
        "Labels can change with language or editorial improvements. Persist stable keys or enum values, not displayed strings. When a server or repository changes the selected option, update the same state object that the view observes. Avoid storing independent copies of a Boolean in a view, model and control and then synchronizing them by convention. For submit-based forms, hold the choices in a draft and commit them together only after validation."
      ]
    ],
    "references": [
      "https://platform.uno/docs/articles/controls/ToggleSwitch.html",
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/radio-button"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Design a notification settings card with one delivery preference and two independent channels. Save stable identifiers and verify keyboard-only selection."
  },
  {
    "id": "command-surfaces",
    "title": "Put actions where intent is clear",
    "summary": "Separate primary actions, secondary menus and destructive decisions.",
    "features": [
      "Button",
      "MenuFlyout",
      "MenuFlyoutItem",
      "CommandBar"
    ],
    "prerequisites": [
      "toolkit-commands",
      "dialog-decisions"
    ],
    "steps": [
      {
        "title": "Identify the primary task",
        "explanation": "A screen should make its most common safe action easy to find. Less frequent actions can live in a menu, but hiding every operation makes the user discover the interface repeatedly. Write action labels as concrete verbs and objects. Save changes communicates an outcome more clearly than OK in an editing workflow. Keep command availability tied to the application’s preconditions, not only a visual style. A disabled action should have an understandable reason.",
        "worked": "The document page exposes Save changes directly. Rename and Duplicate are secondary menu commands; Delete is deliberately not adjacent to the primary action.",
        "prompt": "Should moving an action into a menu change its validation rules?",
        "answer": "No. Presentation is another invocation path for the same operation contract."
      },
      {
        "title": "Share command state across entry points",
        "explanation": "A toolbar, keyboard shortcut and context menu can all invoke one command. They should use the same availability and concurrency rules. Otherwise a disabled toolbar button may coexist with a shortcut that bypasses the intended guard. Distinguish pointer routing from command execution: a click handler is only one source of intent. For asynchronous operations, choose whether duplicate requests are rejected, queued or replace earlier work, and expose that policy consistently.",
        "worked": "A Duplicate command can be triggered from a menu now and from a keyboard accelerator in a full project. Both must create exactly one duplicate for an accepted action.",
        "prompt": "What should a second command surface reuse?",
        "answer": "The operation and its CanExecute/concurrency policy, rather than a separately maintained Boolean."
      },
      {
        "title": "Keep menus local and dialogs exceptional",
        "explanation": "A MenuFlyout belongs to a local set of actions. It should not become a long multi-step form. A ContentDialog is appropriate when the user must explicitly decide before proceeding; it also interrupts the workflow and needs careful focus restoration. A deletion flow may offer undo instead of a blocking dialog when the operation is reversible. The sample only renames or duplicates a demonstration label; it does not delete data or pretend to persist a document.",
        "worked": "Open Actions and choose Duplicate. Observe a result label while the menu closes; the action does not navigate to a new page.",
        "prompt": "Why not put every notification in a dialog?",
        "answer": "Blocking input for nonessential status creates unnecessary interruption and complicates keyboard focus."
      },
      {
        "title": "Test dismissal and failure paths",
        "explanation": "Exercise Escape, pointer dismissal, touch, keyboard invocation and disabled items. Verify where focus goes after a menu or dialog closes. A command can fail after the UI accepts it; keep the document intact and show a recoverable status. If an item disappears while a menu is open, resolve the action against a stable identity and revalidate it instead of relying on a stale selected index. Test these boundaries with a real Uno surface.",
        "worked": "Select one document, open its actions, then change the underlying list. The command should still act on the intended document or refuse it explicitly.",
        "prompt": "What does stable command context protect against?",
        "answer": "Applying an operation to a different item because the collection’s positional index changed."
      }
    ],
    "tips": [
      "Expose one clear primary action; keep secondary actions discoverable.",
      "Avoid adjacent destructive and common safe actions.",
      "Restore focus after transient surfaces close."
    ],
    "scenario": "Build a document action area with shared commands for a primary button and flyout. Add failure feedback and test Escape and keyboard focus.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var label = new TextBlock { Text = \"Document: project-notes\", FontSize = 22 };\n        var menu = new MenuFlyout();\n        var duplicate = new MenuFlyoutItem { Text = \"Duplicate\" };\n        var rename = new MenuFlyoutItem { Text = \"Rename\" };\n        duplicate.Click += (_, _) => label.Text = \"Document: project-notes-copy\";\n        rename.Click += (_, _) => label.Text = \"Document: renamed-notes\";\n        menu.Items.Add(duplicate); menu.Items.Add(rename);\n        var actions = new Button { Content = \"Actions\", Flyout = menu };\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 16 };\n        root.Children.Add(label); root.Children.Add(actions); return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var label = new TextBlock { Text = \"Document: project-notes\", FontSize = 22 };\n        var menu = new MenuFlyout();\n        var duplicate = new MenuFlyoutItem { Text = \"Duplicate\" };\n        var rename = new MenuFlyoutItem { Text = \"Rename\" };\n        duplicate.Click += (_, _) => label.Text = \"Document: project-notes-copy-2\";\n        rename.Click += (_, _) => label.Text = \"Document: renamed-notes\";\n        menu.Items.Add(duplicate); menu.Items.Add(rename);\n        var actions = new Button { Content = \"Actions\", Flyout = menu };\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 16 };\n        root.Children.Add(label); root.Children.Add(actions); return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": "project-notes-copy",
    "challenge": "Replace project-notes-copy with project-notes-copy-2 and explain the changed behavior.",
    "rules": [
      {
        "contains": "project-notes-copy-2",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate project-notes-copy.",
      "Try project-notes-copy-2 and test a boundary case."
    ],
    "quiz": {
      "question": "What must stay consistent between a toolbar and context menu?",
      "options": [
        "The underlying command’s preconditions, identity and concurrency policy.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "The underlying command’s preconditions, identity and concurrency policy."
    },
    "concepts": [
      [
        "Identify the primary task",
        "A screen should make its most common safe action easy to find. Less frequent actions can live in a menu, but hiding every operation makes the user discover the interface repeatedly. Write action labels as concrete verbs and objects. Save changes communicates an outcome more clearly than OK in an editing workflow. Keep command availability tied to the application’s preconditions, not only a visual style. A disabled action should have an understandable reason."
      ],
      [
        "Share command state across entry points",
        "A toolbar, keyboard shortcut and context menu can all invoke one command. They should use the same availability and concurrency rules. Otherwise a disabled toolbar button may coexist with a shortcut that bypasses the intended guard. Distinguish pointer routing from command execution: a click handler is only one source of intent. For asynchronous operations, choose whether duplicate requests are rejected, queued or replace earlier work, and expose that policy consistently."
      ],
      [
        "Keep menus local and dialogs exceptional",
        "A MenuFlyout belongs to a local set of actions. It should not become a long multi-step form. A ContentDialog is appropriate when the user must explicitly decide before proceeding; it also interrupts the workflow and needs careful focus restoration. A deletion flow may offer undo instead of a blocking dialog when the operation is reversible. The sample only renames or duplicates a demonstration label; it does not delete data or pretend to persist a document."
      ]
    ],
    "references": [
      "https://platform.uno/docs/articles/controls/MenuFlyout.html",
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/menus"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Build a document action area with shared commands for a primary button and flyout. Add failure feedback and test Escape and keyboard focus."
  },
  {
    "id": "status-with-content",
    "title": "Show progress without erasing useful content",
    "summary": "Design loading, refresh, empty and error states as different outcomes.",
    "features": [
      "InfoBar",
      "ProgressBar",
      "ProgressRing",
      "TextBlock"
    ],
    "prerequisites": [
      "empty-loading-error",
      "resilience"
    ],
    "steps": [
      {
        "title": "Use two independent questions",
        "explanation": "Ask whether work is pending, then ask whether accepted content already exists. During a first load there may be no content; during a refresh, a previous accepted snapshot may remain useful. Collapsing both situations into one Loading flag often hides information unnecessarily. Likewise, empty success means the request completed with no records, whereas failure means it did not produce a new accepted result. Those outcomes deserve different language and next actions.",
        "worked": "A dashboard still shows yesterday’s accepted summary while today’s refresh is pending. The banner explains that refresh is in progress without deleting the old values.",
        "prompt": "Does a failed refresh necessarily mean the screen has no data?",
        "answer": "No. A previously accepted snapshot can remain visible, with its freshness clearly described."
      },
      {
        "title": "Choose determinate progress honestly",
        "explanation": "A determinate bar represents a known fraction of work. Use it only when the denominator is meaningful and can be explained. Counting downloaded bytes may describe transfer progress without describing parsing or rendering. An indeterminate indicator communicates activity without inventing a percentage. Repeatedly advancing a decorative bar to 99 percent teaches the user not to trust progress. Pair an indicator with text that identifies the operation and, when useful, cancellation.",
        "worked": "A three-stage import can report stages completed or total rows validated. It should not call either metric total application readiness unless that is actually what it measures.",
        "prompt": "When is an indeterminate indicator more truthful?",
        "answer": "When the operation is active but its total work or remaining duration is not meaningfully known."
      },
      {
        "title": "Place feedback beside the affected work",
        "explanation": "Use an inline InfoBar or similar region when the message concerns the current page. Keep essential content and actions reachable. Color is not a sufficient signal: include a clear heading, readable message and an appropriate action. Avoid stealing keyboard focus for routine status updates; instead expose the change through suitable accessibility semantics and test it with assistive technology. Persistent failures should not vanish before the user can understand or act on them.",
        "worked": "The mockup preserves its content card as status changes. The failure state offers a retry rather than presenting the content as successfully refreshed.",
        "prompt": "Is a red border alone adequate error feedback?",
        "answer": "No. Explain what failed and what the user can do, in text as well as visual emphasis."
      },
      {
        "title": "Design the recovery contract",
        "explanation": "Retry should preserve valuable input and respect the same cancellation and concurrency policy as the original action. A loading indicator must stop on success, cancellation and failure. Do not use finally to erase the error state you just established. Decide whether a retry replaces, queues behind or is disabled during an existing request. In a real service, identify which failures are transient and which require a user action such as correcting input or signing in.",
        "worked": "The sample buttons select states deterministically. They do not make a network request; the exercise is to verify presentation before connecting a real service.",
        "prompt": "What is a good purpose for a deterministic status fixture?",
        "answer": "It makes each outcome reproducible so the UI can be reviewed and tested without network timing."
      }
    ],
    "tips": [
      "Keep a previously accepted snapshot during refresh when appropriate.",
      "Do not invent percentages for unknown work.",
      "Give errors a specific recovery action, not just a color."
    ],
    "scenario": "Add loading, refresh and retry states to a data card. Verify that a failed refresh preserves the accepted snapshot and that cancellation does not appear as failure.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var status = new InfoBar { IsOpen = true, IsClosable = false, Title = \"Ready\", Message = \"The accepted content stays visible.\", Severity = InfoBarSeverity.Informational };\n        var progress = new ProgressBar { IsIndeterminate = false, Value = 40 };\n        var content = new TextBlock { Text = \"Accepted snapshot: 12 documents\", FontSize = 22 };\n        var loading = new Button { Content = \"Show refreshing\" };\n        loading.Click += (_, _) => { status.Title = \"Refreshing\"; status.Severity = InfoBarSeverity.Informational; progress.IsIndeterminate = true; };\n        var fail = new Button { Content = \"Show recoverable error\" };\n        fail.Click += (_, _) => { status.Title = \"Refresh failed; previous data retained\"; status.Severity = InfoBarSeverity.Error; progress.IsIndeterminate = false; };\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(status); root.Children.Add(progress); root.Children.Add(content); root.Children.Add(loading); root.Children.Add(fail); return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var status = new InfoBar { IsOpen = true, IsClosable = false, Title = \"Ready\", Message = \"The accepted content stays visible.\", Severity = InfoBarSeverity.Informational };\n        var progress = new ProgressBar { IsIndeterminate = false, Value = 70 };\n        var content = new TextBlock { Text = \"Accepted snapshot: 12 documents\", FontSize = 22 };\n        var loading = new Button { Content = \"Show refreshing\" };\n        loading.Click += (_, _) => { status.Title = \"Refreshing\"; status.Severity = InfoBarSeverity.Informational; progress.IsIndeterminate = true; };\n        var fail = new Button { Content = \"Show recoverable error\" };\n        fail.Click += (_, _) => { status.Title = \"Refresh failed; previous data retained\"; status.Severity = InfoBarSeverity.Error; progress.IsIndeterminate = false; };\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(status); root.Children.Add(progress); root.Children.Add(content); root.Children.Add(loading); root.Children.Add(fail); return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": "Value = 40",
    "challenge": "Replace Value = 40 with Value = 70 and explain the changed behavior.",
    "rules": [
      {
        "contains": "Value = 70",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate Value = 40.",
      "Try Value = 70 and test a boundary case."
    ],
    "quiz": {
      "question": "What should a determinate progress value represent?",
      "options": [
        "A known, meaningful fraction of a clearly identified operation.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "A known, meaningful fraction of a clearly identified operation."
    },
    "concepts": [
      [
        "Use two independent questions",
        "Ask whether work is pending, then ask whether accepted content already exists. During a first load there may be no content; during a refresh, a previous accepted snapshot may remain useful. Collapsing both situations into one Loading flag often hides information unnecessarily. Likewise, empty success means the request completed with no records, whereas failure means it did not produce a new accepted result. Those outcomes deserve different language and next actions."
      ],
      [
        "Choose determinate progress honestly",
        "A determinate bar represents a known fraction of work. Use it only when the denominator is meaningful and can be explained. Counting downloaded bytes may describe transfer progress without describing parsing or rendering. An indeterminate indicator communicates activity without inventing a percentage. Repeatedly advancing a decorative bar to 99 percent teaches the user not to trust progress. Pair an indicator with text that identifies the operation and, when useful, cancellation."
      ],
      [
        "Place feedback beside the affected work",
        "Use an inline InfoBar or similar region when the message concerns the current page. Keep essential content and actions reachable. Color is not a sufficient signal: include a clear heading, readable message and an appropriate action. Avoid stealing keyboard focus for routine status updates; instead expose the change through suitable accessibility semantics and test it with assistive technology. Persistent failures should not vanish before the user can understand or act on them."
      ]
    ],
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/infobar",
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/progress-controls"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Add loading, refresh and retry states to a data card. Verify that a failed refresh preserves the accepted snapshot and that cancellation does not appear as failure."
  },
  {
    "id": "keyboard-first-forms",
    "title": "Build a form that works without a pointer",
    "summary": "Connect labels, validation feedback, focus and a predictable commit action.",
    "features": [
      "TextBox",
      "Button",
      "FocusManager",
      "AutomationProperties"
    ],
    "prerequisites": [
      "input-contracts",
      "accessibility"
    ],
    "steps": [
      {
        "title": "Make the task legible before interaction",
        "explanation": "A placeholder is a format hint, not a lasting label: it disappears when the user types. Use a visible header or label and explain required formats near the field. Group related values so a screen reader and a sighted keyboard user encounter them in a meaningful sequence. Do not ask for information that the operation does not need. A smaller form with clear ownership is easier to validate and less likely to leak unnecessary personal data.",
        "worked": "The form has a Project title header and a separate example hint. After entering a value, the user can still identify what the field means.",
        "prompt": "Why should the label survive typing?",
        "answer": "The field’s purpose must remain available when its placeholder is no longer visible."
      },
      {
        "title": "Treat input scope as a hint",
        "explanation": "InputScope requests a suitable on-screen keyboard; it does not prove the value is valid. Paste, hardware keyboards, accessibility input and programmatic assignments can all introduce values outside the suggested format. Parse and validate at the domain boundary. Keep the raw draft when validation fails, and show an explanation rather than replacing it with a default value. Distinguish an empty draft from a valid zero or another legitimate domain value.",
        "worked": "A numeric keyboard may help enter a quantity, but the parser still rejects nonnumeric input. The mockup uses a title-length rule so both valid and invalid cases are easy to test.",
        "prompt": "Can a numeric InputScope replace parsing?",
        "answer": "No. It is an input convenience; validation remains an application responsibility."
      },
      {
        "title": "Move focus for a reason",
        "explanation": "The tab order should follow the visual and logical task order. Avoid positive TabIndex values sprinkled across a complex tree; use them deliberately only when the natural structure cannot express the intended order. On submit, focus the first invalid field when that helps correction, and keep a persistent error explanation. Routine background updates should not interrupt typing by moving focus. In multi-window applications, scope focus inspection to the correct XamlRoot.",
        "worked": "Submit a title that is too short. The Uno example focuses the same TextBox and leaves the draft untouched, with a clear instruction below it.",
        "prompt": "When is programmatic focus useful here?",
        "answer": "After an explicit invalid submit, to return the user to the field that requires correction."
      },
      {
        "title": "Verify meaning rather than pixel order alone",
        "explanation": "Test Tab, Shift+Tab, submit, correction and successful commit. Inspect the accessible name, not merely the visible glyph. Test translated text and increased text scale without overlapping labels or clipped errors. A saved-status message should be observable without clearing the user’s context. The mockup’s highlighted order is an aid to review; it is not a substitute for testing the actual Uno automation tree and assistive technology on each target.",
        "worked": "After a successful save, the committed title is shown separately from the editable draft. Another edit should not silently change that committed title until Save is accepted.",
        "prompt": "What does a keyboard-only acceptance test need beyond a screenshot?",
        "answer": "It must exercise focus movement and commit/error behavior and assert the relevant accessible names."
      }
    ],
    "tips": [
      "Use persistent labels; reserve placeholders for examples.",
      "Preserve rejected drafts so they can be corrected.",
      "Never rely on InputScope as validation."
    ],
    "scenario": "Build an editable title form. Test invalid submit, focus return, correction and successful commit with the keyboard, including large text.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var title = new TextBox { Header = \"Project title\", PlaceholderText = \"For example: Design review\", TabIndex = 0 };\n        var feedback = new TextBlock { Text = \"Use at least 3 characters.\", TextWrapping = TextWrapping.Wrap };\n        var save = new Button { Content = \"Save title\", TabIndex = 1 };\n        Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(title, \"Project title\");\n        save.Click += (_, _) => {\n            if (title.Text.Trim().Length < 3) { feedback.Text = \"Title is too short; use at least 3 characters.\"; title.Focus(FocusState.Programmatic); return; }\n            feedback.Text = \"Saved: \" + title.Text.Trim();\n        };\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(title); root.Children.Add(save); root.Children.Add(feedback); return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var title = new TextBox { Header = \"Project title\", PlaceholderText = \"For example: Design review\", TabIndex = 0 };\n        var feedback = new TextBlock { Text = \"Use at least 5 characters.\", TextWrapping = TextWrapping.Wrap };\n        var save = new Button { Content = \"Save title\", TabIndex = 1 };\n        Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(title, \"Project title\");\n        save.Click += (_, _) => {\n            if (title.Text.Trim().Length < 5) { feedback.Text = \"Title is too short; use at least 5 characters.\"; title.Focus(FocusState.Programmatic); return; }\n            feedback.Text = \"Saved: \" + title.Text.Trim();\n        };\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(title); root.Children.Add(save); root.Children.Add(feedback); return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": "Length < 3",
    "challenge": "Replace Length < 3 with Length < 5 and explain the changed behavior.",
    "rules": [
      {
        "contains": "Length < 5",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate Length < 3.",
      "Try Length < 5 and test a boundary case."
    ],
    "quiz": {
      "question": "What should happen to an invalid draft after submit?",
      "options": [
        "Keep it available for correction, explain the failure, and focus the relevant field when appropriate.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "Keep it available for correction, explain the failure, and focus the relevant field when appropriate."
    },
    "concepts": [
      [
        "Make the task legible before interaction",
        "A placeholder is a format hint, not a lasting label: it disappears when the user types. Use a visible header or label and explain required formats near the field. Group related values so a screen reader and a sighted keyboard user encounter them in a meaningful sequence. Do not ask for information that the operation does not need. A smaller form with clear ownership is easier to validate and less likely to leak unnecessary personal data."
      ],
      [
        "Treat input scope as a hint",
        "InputScope requests a suitable on-screen keyboard; it does not prove the value is valid. Paste, hardware keyboards, accessibility input and programmatic assignments can all introduce values outside the suggested format. Parse and validate at the domain boundary. Keep the raw draft when validation fails, and show an explanation rather than replacing it with a default value. Distinguish an empty draft from a valid zero or another legitimate domain value."
      ],
      [
        "Move focus for a reason",
        "The tab order should follow the visual and logical task order. Avoid positive TabIndex values sprinkled across a complex tree; use them deliberately only when the natural structure cannot express the intended order. On submit, focus the first invalid field when that helps correction, and keep a persistent error explanation. Routine background updates should not interrupt typing by moving focus. In multi-window applications, scope focus inspection to the correct XamlRoot."
      ]
    ],
    "references": [
      "https://platform.uno/docs/articles/features/focus-management.html",
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/forms"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Build an editable title form. Test invalid submit, focus return, correction and successful commit with the keyboard, including large text."
  },
  {
    "id": "adaptive-detail",
    "title": "Adapt a feature, not just a rectangle",
    "summary": "Rearrange a list/detail task while preserving selection and in-progress edits.",
    "features": [
      "Grid",
      "VisualStateManager",
      "AdaptiveTrigger",
      "ListView"
    ],
    "prerequisites": [
      "responsive-layout",
      "listview-selection"
    ],
    "steps": [
      {
        "title": "Start with relationships",
        "explanation": "A desktop list/detail page has two simultaneous regions. A narrow view may show one at a time, but the underlying task is still choosing an item and inspecting it. Decide which state survives the rearrangement: selected identity, edited draft, scroll anchor and any pending operation. Do not duplicate these values into independent desktop and mobile view models merely because their layout differs. Presentation modes should observe the same owned state.",
        "worked": "The mockup selects a document by key. Switching between narrow and wide preview does not change that key or discard its notes.",
        "prompt": "Should a breakpoint recreate the document model?",
        "answer": "No. The presentation can change while the owned document and selection remain stable."
      },
      {
        "title": "Derive breakpoints from content",
        "explanation": "A breakpoint expresses when the task no longer fits comfortably. Include label length, navigation width, touch targets and expected text scale in that decision. A device category is not a dependable proxy: a desktop window can be narrow and a tablet can host a wide layout. Observe the available view size. In compiled XAML, named visual states and adaptive triggers can describe the policy; the C# lab makes the same decision explicitly so its effect is inspectable.",
        "worked": "At a width of 720 units, the demonstration uses side-by-side columns. Below that it stacks regions without replacing their controls.",
        "prompt": "Why test a resized desktop window as well as a phone?",
        "answer": "Available space, not the product name of the device, is the layout constraint."
      },
      {
        "title": "Keep navigation and layout separate",
        "explanation": "A view rearrangement need not create a navigation-history entry. Conversely, opening a detail destination may be meaningful navigation even when it appears in an adjacent region. Define the rule instead of letting the control tree choose it accidentally. Back should restore the user’s task rather than oscillating through resize events. If a selected item disappears, choose an explicit empty or fallback state instead of selecting an unrelated index.",
        "worked": "The live mockup’s width slider changes the layout only. Selecting another card changes the selected key; those two actions have separate state effects.",
        "prompt": "Should resizing automatically push a new Frame entry?",
        "answer": "No. A layout transition is not inherently a user navigation action."
      },
      {
        "title": "Review every intermediate width",
        "explanation": "Do not validate only two screenshots at named breakpoints. Intermediate widths expose clipped labels, oversized padding and unreachable actions. Use min/max constraints thoughtfully and allow text wrapping when the content calls for it. Test a long translation, keyboard focus within the detail area and a pending edit during resize. Keep decorative diagrams separate from actual framework validation; use the Uno playground and target builds to verify layout semantics.",
        "worked": "Move from 800 to 500 to 760 units while an item is selected. The selected identity and detail text should remain unchanged throughout.",
        "prompt": "Which invariant is more important than a particular column ratio?",
        "answer": "The user retains the same selected document and useful task state while the view remains operable."
      }
    ],
    "tips": [
      "Choose breakpoints from content pressure, not device names.",
      "Keep one owner for selection and drafts across layouts.",
      "Separate resize from navigation history."
    ],
    "scenario": "Build a list/detail feature that becomes stacked on a narrow screen. Preserve stable selection, pending edits and keyboard focus through the transition.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var list = new Border { Background = new SolidColorBrush(Microsoft.UI.Colors.Lavender), Padding = new Thickness(16), Child = new TextBlock { Text = \"Document list\", TextWrapping = TextWrapping.Wrap } };\n        var detail = new Border { Background = new SolidColorBrush(Microsoft.UI.Colors.Honeydew), Padding = new Thickness(16), Child = new TextBlock { Text = \"The selected document remains the same.\", TextWrapping = TextWrapping.Wrap } };\n        var root = new Grid { Padding = new Thickness(20), ColumnSpacing = 12, RowSpacing = 12 };\n        root.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });\n        root.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(2, GridUnitType.Star) });\n        root.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });\n        root.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });\n        root.Children.Add(list); root.Children.Add(detail);\n        root.SizeChanged += (_, e) => { var wide = e.NewSize.Width >= 720; Grid.SetColumn(detail, wide ? 1 : 0); Grid.SetRow(detail, wide ? 0 : 1); Grid.SetColumnSpan(list, wide ? 1 : 2); Grid.SetColumnSpan(detail, wide ? 1 : 2); };\n        return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var list = new Border { Background = new SolidColorBrush(Microsoft.UI.Colors.Lavender), Padding = new Thickness(16), Child = new TextBlock { Text = \"Document list\", TextWrapping = TextWrapping.Wrap } };\n        var detail = new Border { Background = new SolidColorBrush(Microsoft.UI.Colors.Honeydew), Padding = new Thickness(16), Child = new TextBlock { Text = \"The selected document remains the same.\", TextWrapping = TextWrapping.Wrap } };\n        var root = new Grid { Padding = new Thickness(20), ColumnSpacing = 12, RowSpacing = 12 };\n        root.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });\n        root.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(2, GridUnitType.Star) });\n        root.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });\n        root.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });\n        root.Children.Add(list); root.Children.Add(detail);\n        root.SizeChanged += (_, e) => { var wide = e.NewSize.Width >= 600; Grid.SetColumn(detail, wide ? 1 : 0); Grid.SetRow(detail, wide ? 0 : 1); Grid.SetColumnSpan(list, wide ? 1 : 2); Grid.SetColumnSpan(detail, wide ? 1 : 2); };\n        return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": ">= 720",
    "challenge": "Replace >= 720 with >= 600 and explain the changed behavior.",
    "rules": [
      {
        "contains": ">= 600",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate >= 720.",
      "Try >= 600 and test a boundary case."
    ],
    "quiz": {
      "question": "What should survive an adaptive list/detail transition?",
      "options": [
        "Stable selection and owned document/draft state, independent of the current layout.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "Stable selection and owned document/draft state, independent of the current layout."
    },
    "concepts": [
      [
        "Start with relationships",
        "A desktop list/detail page has two simultaneous regions. A narrow view may show one at a time, but the underlying task is still choosing an item and inspecting it. Decide which state survives the rearrangement: selected identity, edited draft, scroll anchor and any pending operation. Do not duplicate these values into independent desktop and mobile view models merely because their layout differs. Presentation modes should observe the same owned state."
      ],
      [
        "Derive breakpoints from content",
        "A breakpoint expresses when the task no longer fits comfortably. Include label length, navigation width, touch targets and expected text scale in that decision. A device category is not a dependable proxy: a desktop window can be narrow and a tablet can host a wide layout. Observe the available view size. In compiled XAML, named visual states and adaptive triggers can describe the policy; the C# lab makes the same decision explicitly so its effect is inspectable."
      ],
      [
        "Keep navigation and layout separate",
        "A view rearrangement need not create a navigation-history entry. Conversely, opening a detail destination may be meaningful navigation even when it appears in an adjacent region. Define the rule instead of letting the control tree choose it accidentally. Back should restore the user’s task rather than oscillating through resize events. If a selected item disappears, choose an explicit empty or fallback state instead of selecting an unrelated index."
      ]
    ],
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/layout/layouts-with-xaml"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Build a list/detail feature that becomes stacked on a narrow screen. Preserve stable selection, pending edits and keyboard focus through the transition."
  },
  {
    "id": "image-presentation",
    "title": "Treat images as content with a lifecycle",
    "summary": "Reserve space, choose stretching deliberately, and provide meaningful alternatives.",
    "features": [
      "Image",
      "BitmapImage",
      "Border"
    ],
    "prerequisites": [
      "assets-fonts",
      "accessibility"
    ],
    "steps": [
      {
        "title": "Separate the source from the destination",
        "explanation": "An image has intrinsic dimensions and a destination rectangle. Stretch policy decides how those relate. Uniform preserves the entire image with possible empty space; UniformToFill can crop; Fill can distort aspect ratio. None of those modes decides which crop preserves a person’s face or a diagram label. Choose the policy according to the meaning of the content, and never stretch a technical drawing in a way that changes the geometry the reader is asked to interpret.",
        "worked": "The fixture is a 120 by 72 image. Switching its destination to a square makes the difference between preserving, cropping and distorting easy to see.",
        "prompt": "Which stretch mode can hide image edges?",
        "answer": "UniformToFill can crop in order to fill the destination while preserving aspect ratio."
      },
      {
        "title": "Reserve the layout before bytes arrive",
        "explanation": "A remote image can arrive late, fail or be replaced. Reserve an appropriate aspect-ratio region or bounded size so nearby controls do not jump unexpectedly. A placeholder should explain the absence without pretending the content loaded. Cancel or ignore obsolete requests when the selected item changes. A URL stored in state is not proof that the bytes decoded successfully, just as a completed HTTP request is not proof of valid application data.",
        "worked": "The mockup keeps the card dimensions unchanged while switching among loaded, pending and unavailable states. The primary action remains in the same region.",
        "prompt": "Why is a stable placeholder useful?",
        "answer": "It preserves layout and task continuity while clearly distinguishing pending or missing content from a decoded image."
      },
      {
        "title": "Provide a semantic alternative",
        "explanation": "Decide whether the image conveys information or is decoration. Meaningful images need an accessible description that conveys their role, not just a filename. A chart may also require a data table or textual summary; a short name alone cannot communicate every plotted value. Decorative shapes should not add noisy, redundant announcements. Ensure an unavailable image still leaves the essential task understandable, rather than forcing the user to infer meaning from an empty box.",
        "worked": "The Uno fixture is named Sample geometry card. A production inventory image might instead describe the actual item and offer the item name independently as text.",
        "prompt": "Is image-1842.png an adequate accessible description?",
        "answer": "Usually not. The description should explain meaningful content or function rather than storage naming."
      },
      {
        "title": "Test packaging as well as drawing",
        "explanation": "Asset paths must be correct in the published application, including case sensitivity and repository subpaths. Test image decoding and failure callbacks on the actual target. Keep image dimensions and memory usage bounded; a huge bitmap can consume substantial decoded memory even if its compressed file is small. The lab embeds a tiny original PNG data URI to make its success path deterministic. It is not a demonstration of network caching or durable image storage.",
        "worked": "Export the C# lab and verify its small embedded fixture on the browser target. Then replace it with an application asset in a full project and test a missing asset separately.",
        "prompt": "Does a small compressed file guarantee a small decoded bitmap?",
        "answer": "No. Decoded dimensions and pixel format determine much of the memory requirement."
      }
    ],
    "tips": [
      "Use Uniform for diagrams whose complete geometry matters.",
      "Reserve a stable region before loading finishes.",
      "Give informative images useful text alternatives."
    ],
    "scenario": "Create an image card with pending, loaded and unavailable states. Keep layout stable, compare stretch policies and provide an accessible description.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var bitmap = new Microsoft.UI.Xaml.Media.Imaging.BitmapImage(new Uri(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABICAIAAACyfKYoAAABsElEQVR4nO3csU5CQRCF4YX4KD4cDbE3loae0PBwNLY2voLFJoQouezdnTk7Zzh/K96dfKxDY9h8/XwX5d929gDPkqBBCRqUoEEJGpSgQQkalKBBCRqUoEEJGtTL8o/3n0fMHLXTxxvyOGS60aAEDerB6sjR5fy+/ILX3cF7hszQD33/v9JPPCF0u+/C75qLp4IeIb77KEPuPB+Ghsoez0wC7aFs+2T61eFH/OeIwTXCfaMBylZnEUMjlcdPZIXGKw+eywpNFyX0rOs8cjof9Fzl7hnIoCMo19ZOQgbNGxN0nOtcWzUPEzR1ggZFAx1tb9Tap6KBZk/QoDigY+6NWuNsHNAJEjQoQYMSNChBgxI0KEGDEjQoQYMSNCgOaMD/L3fXOBsHdIIEDYoGOub2aJ+KBpo9QYNigo62PVbNwwRNHRl0nEu9dhIy6BLDumMGPugy27rvdEpoxlihZ13q7nNZocsM65ETN+xfAgv735rB95UeuubKbfKnQ7w6bvNbI1ZPTgJdfKwNn5lkddxmskbM37aE0Nc6xP1WUGboaxG+U+kpoCOU58MweIIGJWhQv9WefEAAwHF7AAAAAElFTkSuQmCC\"));\n        var image = new Microsoft.UI.Xaml.Controls.Image { Source = bitmap, Width = 240, Height = 180, Stretch = Stretch.Uniform };\n        Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(image, \"Sample geometry card\");\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(new TextBlock { Text = \"Preserve or crop?\", FontSize = 24 });\n        root.Children.Add(image); root.Children.Add(new TextBlock { Text = \"Intrinsic fixture: 120 × 72 pixels\", TextWrapping = TextWrapping.Wrap }); return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var bitmap = new Microsoft.UI.Xaml.Media.Imaging.BitmapImage(new Uri(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABICAIAAACyfKYoAAABsElEQVR4nO3csU5CQRCF4YX4KD4cDbE3loae0PBwNLY2voLFJoQouezdnTk7Zzh/K96dfKxDY9h8/XwX5d929gDPkqBBCRqUoEEJGpSgQQkalKBBCRqUoEEJGtTL8o/3n0fMHLXTxxvyOGS60aAEDerB6sjR5fy+/ILX3cF7hszQD33/v9JPPCF0u+/C75qLp4IeIb77KEPuPB+Ghsoez0wC7aFs+2T61eFH/OeIwTXCfaMBylZnEUMjlcdPZIXGKw+eywpNFyX0rOs8cjof9Fzl7hnIoCMo19ZOQgbNGxN0nOtcWzUPEzR1ggZFAx1tb9Tap6KBZk/QoDigY+6NWuNsHNAJEjQoQYMSNChBgxI0KEGDEjQoQYMSNCgOaMD/L3fXOBsHdIIEDYoGOub2aJ+KBpo9QYNigo62PVbNwwRNHRl0nEu9dhIy6BLDumMGPugy27rvdEpoxlihZ13q7nNZocsM65ETN+xfAgv735rB95UeuubKbfKnQ7w6bvNbI1ZPTgJdfKwNn5lkddxmskbM37aE0Nc6xP1WUGboaxG+U+kpoCOU58MweIIGJWhQv9WefEAAwHF7AAAAAElFTkSuQmCC\"));\n        var image = new Microsoft.UI.Xaml.Controls.Image { Source = bitmap, Width = 240, Height = 180, Stretch = Stretch.UniformToFill };\n        Microsoft.UI.Xaml.Automation.AutomationProperties.SetName(image, \"Sample geometry card\");\n        var root = new StackPanel { Padding = new Thickness(20), Spacing = 12 };\n        root.Children.Add(new TextBlock { Text = \"Preserve or crop?\", FontSize = 24 });\n        root.Children.Add(image); root.Children.Add(new TextBlock { Text = \"Intrinsic fixture: 120 × 72 pixels\", TextWrapping = TextWrapping.Wrap }); return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": "Stretch.Uniform",
    "challenge": "Replace Stretch.Uniform with Stretch.UniformToFill and explain the changed behavior.",
    "rules": [
      {
        "contains": "Stretch.UniformToFill",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate Stretch.Uniform.",
      "Try Stretch.UniformToFill and test a boundary case."
    ],
    "quiz": {
      "question": "Which dimensions matter when estimating decoded image memory?",
      "options": [
        "The decoded width, height and pixel format, not only the compressed download size.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "The decoded width, height and pixel format, not only the compressed download size."
    },
    "concepts": [
      [
        "Separate the source from the destination",
        "An image has intrinsic dimensions and a destination rectangle. Stretch policy decides how those relate. Uniform preserves the entire image with possible empty space; UniformToFill can crop; Fill can distort aspect ratio. None of those modes decides which crop preserves a person’s face or a diagram label. Choose the policy according to the meaning of the content, and never stretch a technical drawing in a way that changes the geometry the reader is asked to interpret."
      ],
      [
        "Reserve the layout before bytes arrive",
        "A remote image can arrive late, fail or be replaced. Reserve an appropriate aspect-ratio region or bounded size so nearby controls do not jump unexpectedly. A placeholder should explain the absence without pretending the content loaded. Cancel or ignore obsolete requests when the selected item changes. A URL stored in state is not proof that the bytes decoded successfully, just as a completed HTTP request is not proof of valid application data."
      ],
      [
        "Provide a semantic alternative",
        "Decide whether the image conveys information or is decoration. Meaningful images need an accessible description that conveys their role, not just a filename. A chart may also require a data table or textual summary; a short name alone cannot communicate every plotted value. Decorative shapes should not add noisy, redundant announcements. Ensure an unavailable image still leaves the essential task understandable, rather than forcing the user to infer meaning from an empty box."
      ]
    ],
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/controls/images-imagebrushes"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Create an image card with pending, loaded and unavailable states. Keep layout stable, compare stretch policies and provide an accessible description."
  },
  {
    "id": "theme-and-density",
    "title": "Use semantic themes and readable density",
    "summary": "Design roles, spacing and typography that survive dark mode and larger text.",
    "features": [
      "ResourceDictionary",
      "Style",
      "TextBlock",
      "Button"
    ],
    "prerequisites": [
      "resources",
      "localization"
    ],
    "steps": [
      {
        "title": "Name a role rather than a color",
        "explanation": "A semantic resource describes the job of a value: primary text, page background or warning emphasis. A raw color name describes only one appearance. When a theme changes, the role remains meaningful even though its actual value changes. Avoid treating dark mode as simply inverting each channel. Hierarchy, contrast and disabled states still need to work together. Use the framework’s theme resources where appropriate before inventing a large custom palette.",
        "worked": "A content card has a primary title, supporting text and one action. These roles keep their relationship in both light and dark mockup modes.",
        "prompt": "Why prefer a semantic resource name?",
        "answer": "It describes intended usage and lets the theme supply an appropriate value without changing every consumer."
      },
      {
        "title": "Separate density from readability",
        "explanation": "Compact layout can reduce excess whitespace without making every label tiny. Establish a small spacing scale and reserve larger gaps for stronger grouping boundaries. A dense data view may need short row spacing, while an onboarding form needs more explanation. Controls must remain operable with the intended input method. Do not infer accessibility from one numerical target alone; test focus visibility, pointer accuracy and text scaling together.",
        "worked": "The density control changes gaps and padding, not the meaning of the task. Increasing text size should not turn a primary action into a clipped icon.",
        "prompt": "Is reducing font size the only way to fit more content?",
        "answer": "No. Review grouping, redundant controls, whitespace and information hierarchy before shrinking readable text."
      },
      {
        "title": "Understand resource and local-value precedence",
        "explanation": "A local value can override a style setter or theme-driven value. If a control remains an unexpected color after a theme change, inspect the source of its effective property value rather than repeatedly editing the palette. StaticResource and ThemeResource have different update purposes; choose intentionally. A sample that assigns a local Foreground to every text element may demonstrate colors but does not prove that the app responds correctly to theme changes or high-contrast settings.",
        "worked": "The C# lab changes RequestedTheme on the owning panel and uses standard controls rather than setting a local Foreground on each child.",
        "prompt": "Why might one locally colored label ignore the intended theme styling?",
        "answer": "Its higher-precedence local value can continue to determine the effective property value."
      },
      {
        "title": "Review with real content and real modes",
        "explanation": "Test the longest realistic labels, not only short English placeholders. Review light, dark, high contrast and increased text scale. Avoid using color as the only indication of selection, error or status. Read the same task with a keyboard and with reduced motion. The HTML mockup makes density and text-scale tradeoffs visible, but the actual Uno theme and accessibility implementation require separate target tests. Record unsupported or untested modes honestly.",
        "worked": "Switch themes after entering a long project title, then increase text size. The content should wrap and remain useful instead of disappearing behind a fixed-height region.",
        "prompt": "What does a successful dark screenshot fail to establish?",
        "answer": "It does not establish high-contrast behavior, keyboard accessibility or readability at larger text scales."
      }
    ],
    "tips": [
      "Use semantic roles and theme resources before local color overrides.",
      "Compact spacing is not a reason to use unreadably small text.",
      "Review long translations, large text and high contrast independently."
    ],
    "scenario": "Make a settings card with semantic text roles and a compact/comfortable layout. Test theme changes after editing content and at increased text scale.",
    "code": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 16, RequestedTheme = ElementTheme.Light };\n        root.Children.Add(new TextBlock { Text = \"Project preferences\", FontSize = 28, TextWrapping = TextWrapping.Wrap });\n        root.Children.Add(new TextBox { Header = \"Project name\", Text = \"A readable workspace\" });\n        var toggle = new ToggleSwitch { Header = \"Use dark theme\" };\n        toggle.Toggled += (_, _) => root.RequestedTheme = toggle.IsOn ? ElementTheme.Dark : ElementTheme.Light;\n        root.Children.Add(toggle); root.Children.Add(new Button { Content = \"Apply preferences\" }); return root;\n    }\n}\n",
    "solution": "using System;\nusing System.Linq;\nusing Microsoft.UI.Xaml;\nusing Microsoft.UI.Xaml.Controls;\nusing Microsoft.UI.Xaml.Media;\n\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n        var root = new StackPanel { Padding = new Thickness(24), Spacing = 24, RequestedTheme = ElementTheme.Light };\n        root.Children.Add(new TextBlock { Text = \"Project preferences\", FontSize = 28, TextWrapping = TextWrapping.Wrap });\n        root.Children.Add(new TextBox { Header = \"Project name\", Text = \"A readable workspace\" });\n        var toggle = new ToggleSwitch { Header = \"Use dark theme\" };\n        toggle.Toggled += (_, _) => root.RequestedTheme = toggle.IsOn ? ElementTheme.Dark : ElementTheme.Light;\n        root.Children.Add(toggle); root.Children.Add(new Button { Content = \"Apply preferences\" }); return root;\n    }\n}\n",
    "language": "csharp",
    "anchor": "Spacing = 16",
    "challenge": "Replace Spacing = 16 with Spacing = 24 and explain the changed behavior.",
    "rules": [
      {
        "contains": "Spacing = 24",
        "label": "The focused change is present"
      }
    ],
    "hints": [
      "Locate Spacing = 16.",
      "Try Spacing = 24 and test a boundary case."
    ],
    "quiz": {
      "question": "What should change when switching an application’s theme?",
      "options": [
        "The presentation values serving stable semantic roles, not the meaning of the task.",
        "The visual preview guarantees identical behavior on every platform.",
        "Only the appearance matters; state ownership can be ignored."
      ],
      "answer": 0,
      "explanation": "The presentation values serving stable semantic roles, not the meaning of the task."
    },
    "concepts": [
      [
        "Name a role rather than a color",
        "A semantic resource describes the job of a value: primary text, page background or warning emphasis. A raw color name describes only one appearance. When a theme changes, the role remains meaningful even though its actual value changes. Avoid treating dark mode as simply inverting each channel. Hierarchy, contrast and disabled states still need to work together. Use the framework’s theme resources where appropriate before inventing a large custom palette."
      ],
      [
        "Separate density from readability",
        "Compact layout can reduce excess whitespace without making every label tiny. Establish a small spacing scale and reserve larger gaps for stronger grouping boundaries. A dense data view may need short row spacing, while an onboarding form needs more explanation. Controls must remain operable with the intended input method. Do not infer accessibility from one numerical target alone; test focus visibility, pointer accuracy and text scaling together."
      ],
      [
        "Understand resource and local-value precedence",
        "A local value can override a style setter or theme-driven value. If a control remains an unexpected color after a theme change, inspect the source of its effective property value rather than repeatedly editing the palette. StaticResource and ThemeResource have different update purposes; choose intentionally. A sample that assigns a local Foreground to every text element may demonstrate colors but does not prove that the app responds correctly to theme changes or high-contrast settings."
      ]
    ],
    "references": [
      "https://learn.microsoft.com/en-us/windows/apps/design/style/xaml-theme-resources"
    ],
    "minutes": 25,
    "pitfall": "The HTML mockup is a design experiment, not an Uno renderer. The separate C# playground creates actual Uno controls; validate native devices and assistive technology independently.",
    "transfer": "Make a settings card with semantic text roles and a compact/comfortable layout. Test theme changes after editing content and at increased text scale."
  }
,
  ...commonControlLessons
];
