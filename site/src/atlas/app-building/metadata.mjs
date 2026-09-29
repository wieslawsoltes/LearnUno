// Model authoring metadata; long-form chapters are loaded separately.
export default {
  "input-contracts": {
    "title": "Turn text input into a validated value",
    "steps": [
      [
        "Keep the boundary explicit",
        "Why should an empty field not silently become zero?"
      ],
      [
        "Parse before using the value",
        "Does successful TryParse mean the reservation is acceptable?"
      ],
      [
        "Commit one validated value",
        "Why must validation instructions change with the rule?"
      ],
      [
        "Test the representation and the rule",
        "Does a numeric keyboard guarantee numeric input?"
      ]
    ],
    "why": "A TextBox owns editable text, including intermediate states that are not yet valid domain values. Nullable annotations help the compiler reason about references, while TryParse addresses representation and a range check addresses the business rule. These are separate contracts. Keep the original input until a successful commit so feedback can explain the problem without destroying the evidence.",
    "pitfall": "Build a small table of boundary inputs: empty, whitespace, alphabetic text, minimum, maximum, one below, one above, and overflow. Test conversion separately from business constraints so a change in one does not mask errors in the other. InputScope can request a convenient keyboard, but it cannot replace validation of paste or programmatic input.",
    "challenge": "Limit a reservation to eight seats"
  },
  "record-identity": {
    "title": "Separate record equality from entity identity",
    "steps": [
      [
        "Name the two questions",
        "Can both comparisons be correct when they disagree?"
      ],
      [
        "Copy without losing the original",
        "Does equal record content imply the same object reference?"
      ],
      [
        "Carry keys through projections",
        "What changes when sorting moves an item?"
      ],
      [
        "Choose equality for each boundary",
        "Does a stable identifier solve concurrent update conflicts?"
      ]
    ],
    "why": "Ask separately whether two values describe the same entity and whether their current contents are equal. A record supplies useful value equality, but it does not choose the identity rule for your application. A task identifier can remain constant while its title, status, or revision changes. Use the question that matches the operation instead of applying one equality test everywhere.",
    "pitfall": "Use value comparison for snapshot change detection, key comparison for entity lookup, and reference comparison only where instance ownership matters. Include a revision in update contracts when concurrent edits require conflict detection. A stable identifier prevents addressing the wrong item; it does not by itself prevent one writer from overwriting another writer’s changes.",
    "challenge": "Create a second snapshot whose fields equal the original"
  },
  "linq-projections": {
    "title": "Know when a LINQ query actually runs",
    "steps": [
      [
        "Separate query construction from evaluation",
        "Why do the displays initially agree?"
      ],
      [
        "Account for changing inputs",
        "Is a query necessarily a frozen result set?"
      ],
      [
        "Choose an observable presentation boundary",
        "Why does the sample explicitly call Render?"
      ],
      [
        "Avoid repeated work and inconsistent snapshots",
        "What exactly is frozen by ToArray over mutable objects?"
      ]
    ],
    "why": "Where returns an enumerable that keeps access to its source and predicate. Declaring the query does not necessarily inspect every item immediately. ToArray enumerates it and stores the resulting elements. Both are useful: a deferred query can reflect current data, while a snapshot can give a consistent point-in-time input to a save, comparison, or calculation.",
    "pitfall": "If several computations must use the same membership, materialize once and pass the snapshot to each computation. This can avoid repeated expensive enumeration and prevent a source change between consumers from producing contradictory counts or totals. Do not assume ToArray deep-copies mutable objects; it copies references to elements unless those elements are value types.",
    "challenge": "Include values starting at two in the projection"
  },
  "task-failure": {
    "title": "Handle asynchronous failures at the right boundary",
    "steps": [
      [
        "Follow the returned Task",
        "Why is an async event handler different from an ordinary service method?"
      ],
      [
        "Classify instead of swallowing",
        "Should every exception become a success result?"
      ],
      [
        "Restore invariants on every exit",
        "What bug appears when old cleanup blindly clears current state?"
      ],
      [
        "Test failure as a first-class path",
        "Why test the operation after recovery?"
      ]
    ],
    "why": "A Task represents completion, not just the fact that work started. An async method can return before its awaited work finishes, so a try block that only calls it without awaiting may not observe a later failure. Event handlers may need async void signatures, but their bodies should still await Task-returning operations and handle expected failures explicitly.",
    "pitfall": "Write tests that await the operation, assert the visible outcome, and verify the action can run again. Do not rely on sleeps or assume a green render test exercises event handlers. Inject a deterministic failing service and complete its Task under test control. Keep a test for the second successful attempt after an initial failure.",
    "challenge": "Start with the successful operation path selected"
  },
  "debounced-input": {
    "title": "Debounce input without rendering stale results",
    "steps": [
      [
        "Capture the intent at the event",
        "Why capture input before awaiting?"
      ],
      [
        "Cancel superseded waiting",
        "Does debounce guarantee exactly one operation for a whole typing session?"
      ],
      [
        "Gate the result independently",
        "Why keep a generation check when a token exists?"
      ],
      [
        "End the owner’s lifetime",
        "Should every Unloaded event permanently destroy a view model?"
      ]
    ],
    "why": "Read the input into a local query at the start of the operation. That snapshot describes the intent being processed; rereading the TextBox after an await could accidentally mix a newer phrase with an older request. Increment a generation and create a token source owned by this operation before awaiting the quiet interval.",
    "pitfall": "When a view leaves the visual tree, invalidate its outstanding generation and request cancellation. Reusable view models should tie this to their own activation or navigation lifetime rather than assuming every Unloaded event means permanent disposal. Keep expensive or long-running work out of the UI thread and avoid publishing to a detached owner.",
    "challenge": "Wait for 500 milliseconds of quiet before accepting the query"
  },
  "subscription-lifetimes": {
    "title": "Own subscriptions as disposable resources",
    "steps": [
      [
        "Identify the reference chain",
        "Does hiding a control unsubscribe it from an unrelated publisher?"
      ],
      [
        "Return an owned registration",
        "Does setting a subscription variable to null remove the event handler?"
      ],
      [
        "Make release safe to repeat",
        "What does idempotent disposal not guarantee?"
      ],
      [
        "Attach cleanup to the correct owner",
        "What is a useful automated lifecycle assertion?"
      ]
    ],
    "why": "An event publisher retains its subscribers through delegates. A handler may retain a view, a view model, or captured locals even after that view is no longer displayed. The important question is who owns the publisher and subscription, not whether the handler was written as a method or a lambda. Make the reference direction explicit before diagnosing a leak.",
    "pitfall": "A view may own visual-event adapters while a view model owns service subscriptions. Dispose at the end of that owner’s actual lifetime, not at whichever event is easiest to find. Cached views can reactivate, so attachment and detachment may be paired repeatedly. Use deterministic tests to count active registrations rather than relying only on memory snapshots.",
    "challenge": "Start the received-event counter at ten"
  },
  "textbox-editing": {
    "title": "Build a text field that preserves the user’s intent",
    "steps": [
      [
        "Give the field a stable meaning",
        "Which text still explains the field after typing?"
      ],
      [
        "Preserve intermediate editing states",
        "Why avoid assigning a normalized Text value on every change?"
      ],
      [
        "Expose commit availability and feedback",
        "Should the saved label follow every draft change?"
      ],
      [
        "Test real editing behavior",
        "What does MaxLength fail to protect by itself?"
      ]
    ],
    "why": "A Header describes the field, while PlaceholderText can show an example or short hint before input exists. Do not make disappearing text the only indication of the field’s purpose. Keep the wording concise and verify the accessible name on the actual platform. A character counter can be supplemental feedback, but it should not replace a meaningful label or overwhelm announcements.",
    "pitfall": "Exercise paste, selection replacement, maximum length, whitespace, keyboard activation, and larger text scaling. MaxLength is a control constraint, not proof that every persisted title satisfies a domain rule. A programmatic caller or imported record can bypass the view, so retain validation at the application boundary and avoid interpreting visual success as cross-platform certification.",
    "challenge": "Allow a task title of up to sixty characters"
  },
  "combobox-keys": {
    "title": "Select values by key, not by display text",
    "steps": [
      [
        "Separate identity from presentation",
        "What survives translation in this design?"
      ],
      [
        "Understand each selection property",
        "Why is SelectedIndex fragile for persistence?"
      ],
      [
        "Let the control own its containers",
        "Should a service receive the selected ComboBoxItem control?"
      ],
      [
        "Reconcile missing and obsolete choices",
        "What is dangerous about defaulting every missing key to index zero?"
      ]
    ],
    "why": "A choice has a meaning independent of its label. Code low can be displayed as Low priority, translated into another language, or shown with an icon without changing the saved value. Model both fields explicitly. Avoid using localized strings as database keys or branching on text that a designer may legitimately edit.",
    "pitfall": "Stored data can refer to an option that no longer exists. Decide whether to display an explicit unknown state, migrate the value, or request a new selection. Silently choosing the first item can change user data. Validate required selections at submission and test source replacement separately from ordinary keyboard or pointer selection.",
    "challenge": "Start with the high-priority item selected"
  },
  "listview-selection": {
    "title": "Treat list selection as application state",
    "steps": [
      [
        "Choose the interaction contract",
        "Can SelectionChanged fire without a pointer click?"
      ],
      [
        "Project selected data into stable keys",
        "Why snapshot the selected keys before an async action?"
      ],
      [
        "Handle source changes deliberately",
        "What does a selected row index fail to identify after deletion?"
      ],
      [
        "Test keyboard and batch safety",
        "What should a batch action validate just before execution?"
      ]
    ],
    "why": "ListView supports different selection policies and optional item-click behavior. A multi-select list often represents a pending batch operation; a browse list may use single selection for a details pane. Do not attach destructive work directly to SelectionChanged without understanding that keyboard navigation and programmatic changes can also alter selection.",
    "pitfall": "Test no selection, one selection, several selections, source replacement, and keyboard gestures. Expose a summary before a batch operation and disable the action when no valid keys remain. A rendered ListView does not prove your selection-to-service mapping is correct; include a deterministic test for the exact IDs passed to the operation.",
    "challenge": "Change the list to single selection"
  },
  "navigationview-shell": {
    "title": "Build an adaptive NavigationView shell",
    "steps": [
      [
        "Separate the shell from its pages",
        "Why keep the shell outside individual pages?"
      ],
      [
        "Use stable destination metadata",
        "What should change when a menu label is translated?"
      ],
      [
        "Adapt presentation without changing intent",
        "Should switching pane layout reset the current application task?"
      ],
      [
        "Synchronize only accepted navigation",
        "What happens when a guard rejects a menu request?"
      ]
    ],
    "why": "A NavigationView owns menu presentation and content placement. It does not automatically define your repository, authentication policy, or page lifecycle. Keep the shell stable while the content region changes. A Frame or Uno.Extensions region can later supply page navigation without requiring every page to recreate the global menu.",
    "pitfall": "When real navigation is added, update selection from the accepted destination rather than optimistically treating every click as success. A guard may reject leaving a dirty page, a data load may fail, or a route may be unavailable. Prevent event-feedback loops by distinguishing navigation intent from rendering the resulting selected state.",
    "challenge": "Present top-level destinations in a top navigation layout"
  },
  "dialog-decisions": {
    "title": "Use ContentDialog for an explicit decision",
    "steps": [
      [
        "State the consequence clearly",
        "Why prefer action labels to Yes and No?"
      ],
      [
        "Associate the dialog with its host",
        "Why not capture a global root once for every dialog?"
      ],
      [
        "Await and interpret the result",
        "Is successful completion of ShowAsync equivalent to accepting Delete?"
      ],
      [
        "Verify focus and repeated use",
        "Why test the second opening as well as the first?"
      ]
    ],
    "why": "A dialog title should describe the decision, and button labels should identify actions rather than force the user to decode Yes and No. Use a dialog for a meaningful interruption, not every minor interaction. The safe dismissal path should preserve existing data. Keep the actual operation outside the display-construction code until the result is known.",
    "pitfall": "A modal flow must support keyboard navigation, visible focus, accessible text, safe dismissal, and returning focus to a sensible control. Reopen the dialog after each outcome to test cleanup and availability. For asynchronous validation inside a button handler, use the documented deferral/cancel mechanism rather than allowing the dialog to close before validation finishes.",
    "challenge": "Make the safe dismissal action say Cancel deletion"
  },
  "autosuggest-search": {
    "title": "Build suggestions without feedback loops",
    "steps": [
      [
        "Separate suggestions from committed intent",
        "Should a displayed suggestion immediately become the saved choice?"
      ],
      [
        "Filter only the appropriate changes",
        "Does a higher suggestion limit change which query was submitted?"
      ],
      [
        "Respect the submitted value",
        "Can free text and selected entities use the same validation rule?"
      ],
      [
        "Add asynchronous search deliberately",
        "What separate bug remains after checking UserInput?"
      ]
    ],
    "why": "Typing changes the candidate list; submitting performs the task. Showing a suggestion does not mean the user selected it, and selecting an item can update text without representing another independent keystroke. Use separate state for the current phrase, available suggestions, and accepted query so a UI event cannot accidentally start the wrong operation.",
    "pitfall": "When suggestions come from I/O, debounce input, cancel obsolete work, and reject stale generations before replacing ItemsSource. A change-reason guard prevents one kind of loop; it does not solve out-of-order responses. Keep focus and keyboard navigation usable while loading and announce meaningful empty or error states without clearing the user’s draft.",
    "challenge": "Show up to six matching suggestions"
  },
  "toolkit-observable": {
    "title": "Use ObservableObject without hiding the notification contract",
    "steps": [
      [
        "Keep presentation state outside controls",
        "What does the toolkit remove, and what remains your responsibility?"
      ],
      [
        "Use the equality guard intentionally",
        "Should Summary be announced after an equal assignment?"
      ],
      [
        "Notify every exposed dependency",
        "Why can a correct calculated getter still show stale text?"
      ],
      [
        "Understand generated and handwritten forms",
        "What must happen for ObservableProperty to create a property?"
      ]
    ],
    "why": "The view model owns Count and the derived Summary; the TextBlock only displays Summary. This makes the state transition testable without constructing a Window. ObservableObject reduces repetitive event code but does not decide which properties belong together or where domain rules should live. Keep UI handles and renderer-specific objects out of the presentation state.",
    "pitfall": "A normal project can use ObservableProperty and NotifyPropertyChangedFor attributes on a partial class. The build generates properties and notifications; a single-file runtime compiler does not automatically execute that project generator. The browser lab therefore uses explicit properties with the real toolkit base class. Keep the project variant labeled and inspect generated code when diagnosing a build issue.",
    "challenge": "Increase the observable count by three per action"
  },
  "toolkit-commands": {
    "title": "Make command availability an observable contract",
    "steps": [
      [
        "Give the action a stable owner",
        "Why not return a new RelayCommand from every property getter?"
      ],
      [
        "Express a precondition, not a side effect",
        "Can a command predicate replace server authorization?"
      ],
      [
        "Invalidate the predicate when inputs change",
        "Why can CanExecute be correct while the button looks wrong?"
      ],
      [
        "Choose the async contract when necessary",
        "What is unsafe about putting an async lambda in a void command delegate?"
      ]
    ],
    "why": "A command belongs to the presentation model that owns the operation’s state. Expose the same command instance to several controls instead of creating a new command every time a getter is read. The command can invoke an injected service, while controls remain adapters that present and trigger the action. This separation makes command behavior independently testable.",
    "pitfall": "RelayCommand is for synchronous work. An async lambda passed to a void delegate can become async void and lose an awaitable operation boundary. Use AsyncRelayCommand for asynchronous actions and define busy, cancellation, and error behavior. Do not block with Result or Wait to force async work into a synchronous command.",
    "challenge": "Require five trimmed characters before Create can execute"
  },
  "toolkit-async-command": {
    "title": "Make asynchronous commands cancellable and observable",
    "steps": [
      [
        "Expose the asynchronous operation",
        "What does the async command add beyond a normal event handler?"
      ],
      [
        "Pass the token through every cooperative boundary",
        "Why filter the cancellation catch by the current token?"
      ],
      [
        "Define duplicate-execution behavior",
        "Does a disabled command guarantee a service can never be invoked twice?"
      ],
      [
        "Recover and release the owner",
        "What should be checked after a cancelled operation?"
      ]
    ],
    "why": "An asynchronous command must preserve the Task representing completion. AsyncRelayCommand adds running and cancellation state to the ICommand shape consumed by controls. Keep the command instance stable and use its observable properties rather than inventing unrelated busy flags that can disagree. The delegate remains responsible for meaningful results and expected-error presentation.",
    "pitfall": "Cancel view-owned work when its activation ends, but distinguish temporary visual detachment from permanent model disposal. For expected service failures, set an error state and keep the command usable afterward. For unexpected faults, retain diagnostics and an observed Task rather than swallowing everything. Test success, cancellation, failure, and reexecution as distinct outcomes.",
    "challenge": "Extend the cancellable operation to 1,200 milliseconds"
  },
  "toolkit-validation": {
    "title": "Model validation errors as observable data",
    "steps": [
      [
        "Keep invalid draft data observable",
        "Why preserve a short invalid name instead of erasing it?"
      ],
      [
        "Trigger validation at deliberate times",
        "What can leave HasErrors misleadingly false?"
      ],
      [
        "Read errors without inventing validity",
        "Does Ready to submit mean the workspace has been created?"
      ],
      [
        "Test error transitions and accessibility",
        "Do length attributes automatically trim user input?"
      ]
    ],
    "why": "A user may need to see and correct an invalid value. ObservableValidator can update the property and record validation errors rather than silently refusing every intermediate input. This is useful for forms with explicit Save. A TrySetProperty policy is different: it can reject an assignment. Choose the behavior that matches the task and explain it to the user.",
    "pitfall": "Test initial validation, invalid-to-valid, valid-to-invalid, equal assignments, and submission with untouched fields. Verify the exact errors, not only a red border. Production forms need appropriate automation semantics and announcement behavior for errors; a colored TextBlock alone is not an accessibility audit. Keep validation deterministic and move slow remote checks into an asynchronous policy.",
    "challenge": "Require at least five characters in the workspace name"
  },
  "toolkit-messaging": {
    "title": "Use messages at deliberate component boundaries",
    "steps": [
      [
        "Choose messaging for an appropriate boundary",
        "When is direct injection often preferable?"
      ],
      [
        "Keep handlers independent of accidental captures",
        "Does a messenger automatically make a background message safe for controls?"
      ],
      [
        "Define activation even with weak references",
        "Will a still-reachable hidden recipient necessarily stop receiving weak messages?"
      ],
      [
        "Test message meaning and delivery boundaries",
        "Where should authoritative state live?"
      ]
    ],
    "why": "Constructor injection is clearer for a direct required dependency. Messaging can be useful when independently owned components publish notifications without knowing every listener. Avoid using a global bus for every property assignment or as an undocumented service locator. Define the message’s meaning, sender expectations, and whether a recipient needs current state or only future notifications.",
    "pitfall": "Test that active recipients react once, inactive recipients do not react, and repeated activation does not duplicate handlers. Keep important state in a repository or owner rather than relying on a notification stream to reconstruct it after arbitrary missed messages. For cross-process communication, a local messenger is not a durable or distributed event bus.",
    "challenge": "Send Workspace changed as the typed notice payload"
  },
  "mvvm-drafts": {
    "title": "Design Save and Cancel around a real draft",
    "steps": [
      [
        "Give draft and baseline different owners",
        "Why does Cancel need a separate baseline?"
      ],
      [
        "Derive action availability from the same state",
        "Should an invalid draft disable Cancel?"
      ],
      [
        "Commit only at the accepted boundary",
        "What bug occurs when a late save overwrites current Draft?"
      ],
      [
        "Connect dirty state to navigation carefully",
        "Does accepting a Save prompt guarantee navigation can proceed?"
      ]
    ],
    "why": "An editor’s current text is not the same as accepted domain state. Keep a baseline and a draft, then derive dirty state from their comparison. This makes Cancel meaningful and prevents every keystroke from mutating a shared record displayed elsewhere. Choose whether comparison occurs before or after normalization and keep that rule consistent with the save behavior.",
    "pitfall": "A navigation guard can ask whether a dirty draft should be saved, discarded, or kept. It should await a typed decision and only then change destination. The guard must not assume that choosing Save means the repository already succeeded. Keep Cancel editing distinct from Cancel navigation and test both so a rejected transition does not silently clear the draft.",
    "challenge": "Require a five-character draft before committing"
  },
  "frame-parameters": {
    "title": "Navigate with a typed parameter",
    "steps": [
      [
        "Describe the destination, not the control",
        "Why avoid passing a visual container as a parameter?"
      ],
      [
        "Read context at navigation time",
        "Why is constructor-only parameter logic fragile with caching?"
      ],
      [
        "Validate before loading domain data",
        "Does receiving a valid TaskTarget prove the task is accessible?"
      ],
      [
        "Own work across navigation transitions",
        "What additional contract is needed after typed navigation is correct?"
      ]
    ],
    "why": "A stable task ID is sufficient to request details in this lesson. Passing a ListViewItem or a whole live view model creates ownership and restoration problems: the destination becomes coupled to the previous view’s object graph. Prefer a typed descriptor that expresses intent and can be checked before data is loaded.",
    "pitfall": "A destination that loads asynchronously needs cancellation and stale-result protection when another navigation replaces its context. Avoid async void for reusable loading methods. Track activation identity and cancel page-owned work when leaving or receiving a superseding request according to your caching policy. History entries and live page instances remain different concepts.",
    "challenge": "Navigate to task 84 using the typed parameter"
  },
  "frame-history": {
    "title": "Design back navigation as a history contract",
    "steps": [
      [
        "Observe history rather than guessing",
        "Why is Back unavailable after the first successful navigation?"
      ],
      [
        "Treat Back as a distinct transition",
        "Can two transitions target the same Page type but mean different things?"
      ],
      [
        "Keep shell state synchronized",
        "Why listen to accepted navigation rather than only local clicks?"
      ],
      [
        "Define root and restoration behavior",
        "Does a saved history entry guarantee its target still exists?"
      ]
    ],
    "why": "Frame owns its navigation history. A page’s constructor count or the number of menu clicks is not a reliable substitute for BackStack and CanGoBack. Other transitions, failed requests, state restoration, and explicit history edits can change the relationship. Let the shell project the current Frame state into its back-button availability.",
    "pitfall": "At the root, a back request may close a pane, dismiss a modal, leave an application flow, or do nothing according to platform conventions. Do not force one desktop assumption onto every target. Restoring history also requires serializable destination state and a policy for missing entities or obsolete routes. Test these separately from ordinary in-memory back navigation.",
    "challenge": "Label each history entry as a task view"
  },
  "route-registry": {
    "title": "Register routes instead of activating arbitrary names",
    "steps": [
      [
        "Separate public names from implementation types",
        "Why not expose CLR type names directly as public routes?"
      ],
      [
        "Keep view mapping distinct from route structure",
        "Does a flat dictionary implement all Uno.Extensions navigation behavior?"
      ],
      [
        "Handle lookup and transition outcomes separately",
        "What does successful lookup prove?"
      ],
      [
        "Validate the registry as application configuration",
        "Why test menu-to-route coverage?"
      ]
    ],
    "why": "A stable route name can survive a view-class rename and can be validated before activation. Keep the accepted names in an explicit registry. Do not call Type.GetType on untrusted route input and instantiate whatever it resolves. The registry is a structural boundary that makes supported destinations discoverable and testable.",
    "pitfall": "Test duplicate names, unknown routes, expected view associations, and nested defaults during startup or in CI. Prefer deterministic registration to discovering important routes through uncontrolled reflection. Document which part of the route can be serialized and how old links migrate when names change. A typo in a route is a configuration defect, not something to conceal with an unrelated fallback page.",
    "challenge": "Start from the registered Reports route"
  },
  "deep-link-contracts": {
    "title": "Validate deep links as external input",
    "steps": [
      [
        "Treat activation data as untrusted",
        "What does this browser parser not demonstrate?"
      ],
      [
        "Define decoding and optional-field policy",
        "Why reject fields the example does not understand?"
      ],
      [
        "Resolve domain state after parsing",
        "Why separate parser errors from not-found outcomes?"
      ],
      [
        "Test cold and warm activation",
        "Should a deep link bypass the normal unsaved-changes guard?"
      ]
    ],
    "why": "A deep link may come from a browser, another application, a document, or copied text. Its presence does not prove it was created by your UI. Parse with a URI API, bound its size at the application boundary, and allow only the schemes and route shapes your product supports. Keep arbitrary type activation and command execution out of the parser.",
    "pitfall": "A link can arrive while the app is starting or while another editor is active. Queue or coordinate activation through the composition root and navigation policy. Preserve unsaved work and avoid navigating before required services and the target host exist. Test repeated links and out-of-order loads rather than only launching a fresh app once.",
    "challenge": "Start from a deep link identifying task 84"
  },
  "navigation-guards": {
    "title": "Protect drafts with an awaited navigation guard",
    "steps": [
      [
        "Evaluate the state before leaving",
        "Why is prompting after navigation too late?"
      ],
      [
        "Await the decision without blocking",
        "Why not use a blocking wait for the dialog?"
      ],
      [
        "Serialize competing requests",
        "What must a global navigation gate cover?"
      ],
      [
        "Separate choosing Save from successful saving",
        "What should a failed save do to a pending leave request?"
      ]
    ],
    "why": "The current editor exposes whether its draft differs from the baseline. The navigation request asks the guard before replacing the page. Keep that state in a model in a production app rather than extracting arbitrary controls from the visual tree. A guard is part of navigation policy and should apply consistently to menu, back, and external-link requests.",
    "pitfall": "This fixture offers Discard or Stay. Adding Save introduces another asynchronous operation whose success must be observed before leaving. A user choosing Save does not prove that the repository accepted the data. Preserve the draft on failure, keep feedback visible, and update shell selection only after the destination is actually accepted.",
    "challenge": "Make the rejected-navigation action explicitly say Keep editing"
  },
  "navigation-results": {
    "title": "Return a typed result from a selection flow",
    "steps": [
      [
        "Model the caller’s continuation",
        "Why is an awaitable result preferable to polling a global selection field?"
      ],
      [
        "Represent cancellation separately",
        "Does an initially selected item authorize the caller to apply it after cancellation?"
      ],
      [
        "Complete once and coordinate reentrancy",
        "Why capture the local completion object in each handler?"
      ],
      [
        "Translate the pattern into Uno result navigation",
        "What must happen when the owner abandons the picker?"
      ]
    ],
    "why": "The caller starts a selection workflow and awaits one result before applying the choice. Keep the requested operation distinct from the visual mechanism used to display it: a dialog, page, flyout, or inline picker can implement the same result contract. This makes the caller testable without constructing the picker UI.",
    "pitfall": "Uno.Extensions can register result data and return values through its navigation abstractions. Use the actual ResultDataViewMap and navigator APIs in a project with Navigation enabled rather than assuming the browser’s small picker reproduces the full region system. Preserve the same accepted/cancelled contract and test owner disposal, back navigation, and rejected results.",
    "challenge": "Start the picker on Engineering"
  },
  "composition-root": {
    "title": "Assemble an application at one composition root",
    "steps": [
      [
        "Describe a capability before choosing an implementation",
        "Must a unit test build the DI container to test this model?"
      ],
      [
        "Register the object graph at the boundary",
        "Why is repeatedly calling BuildServiceProvider during registration problematic?"
      ],
      [
        "Validate wiring without overstating validation",
        "Does provider validation prove that all registered services perform their work correctly?"
      ],
      [
        "Own and dispose the provider deliberately",
        "Why is disposing the provider before returning this particular TextBlock acceptable?"
      ]
    ],
    "why": "An interface is useful when it names a replaceable capability rather than merely copying every member of a concrete class. WorkspaceModel needs a workspace name; it does not need to know how configuration was read or where a settings screen stores the value. Constructor injection makes that requirement visible to the compiler and to tests.",
    "pitfall": "The lab resolves a short-lived graph, calculates a string, and disposes the provider before returning a TextBlock that contains only that string. A real application host must keep its provider alive while features use its services and dispose it when the application boundary ends. Do not return a view model that still needs an already disposed provider-owned resource.",
    "challenge": "Change the registered workspace without changing WorkspaceModel"
  },
  "scope-ownership": {
    "title": "Give an editing session its own service scope",
    "steps": [
      [
        "Choose the semantic lifetime first",
        "Why not create a new scope for every property access?"
      ],
      [
        "Observe identity rather than infer it",
        "Can equal service property values prove that the same instance was shared?"
      ],
      [
        "Dispose the owner, not random collaborators",
        "Does a disposed object become inaccessible to all existing references?"
      ],
      [
        "Prevent accidental root-scope capture",
        "What should a singleton use instead of retaining one document session?"
      ]
    ],
    "why": "A scope should correspond to a meaningful application lifetime rather than an arbitrary block of code. A document, modal editing workflow, or workspace can be a good candidate when several collaborators need shared session state. The UI framework does not automatically equate Loaded/Unloaded, navigation, and document lifetime. Decide which owner creates and closes the scope.",
    "pitfall": "Resolving a scoped service directly from the root provider can extend its lifetime incorrectly or be rejected with scope validation enabled. A singleton must not capture a scoped editing session in its constructor. Keep the application provider at the composition boundary and pass correctly scoped collaborators to each feature.",
    "challenge": "Compare transient identity with the original scoped identity"
  },
  "captive-dependencies": {
    "title": "Detect a singleton that captures scoped state",
    "steps": [
      [
        "Draw the lifetime relationship",
        "Why can the problem stay hidden when testing only one document?"
      ],
      [
        "Make invalid wiring fail deliberately",
        "Does a caught validation error mean the invalid application graph is safe to use?"
      ],
      [
        "Choose a real repair, not a bypass",
        "Why is resolving a scoped service later through a root provider not an automatic fix?"
      ],
      [
        "Test concurrency and teardown together",
        "Can scope validation detect every lifetime problem in application code?"
      ]
    ],
    "why": "Think of constructor references as ownership edges that can keep a dependency reachable as long as its consumer. A singleton consumer is shared across the provider lifetime. A scoped document session is supposed to vary with each document scope. Capturing one session in the singleton constructor cannot express that changing relationship correctly.",
    "pitfall": "A corrected graph needs behavior tests for concurrent documents and repeated open/close cycles. Verify that one document’s state does not appear in another and that closing one scope does not invalidate an active feature. ValidateScopes is an important guardrail, but it does not detect every manually captured reference, static cache, or callback lifetime bug.",
    "challenge": "Move the consumer into the document scope"
  },
  "service-factories": {
    "title": "Combine injected services with runtime arguments",
    "steps": [
      [
        "Separate operation data from shared services",
        "Why should the selected document identifier not usually be registered as global mutable state?"
      ],
      [
        "Use the provider at the construction seam",
        "Does this example recommend injecting IServiceProvider into every view model?"
      ],
      [
        "Define ownership of factory products",
        "Why must a factory describe more than how to call a constructor?"
      ],
      [
        "Keep runtime data validated and testable",
        "Does successful factory resolution prove that the selected document is authorized?"
      ]
    ],
    "why": "A report title belongs to one request; a clock capability can be shared and replaced in tests. Treating both as arbitrary global services hides which values vary per operation. An explicit Create(title) method communicates that distinction and makes simultaneous reports possible without mutating a singleton settings object.",
    "pitfall": "DI does not validate arbitrary user-selected arguments. Parse and authorize a document identifier before it reaches a trusted repository operation, and validate presentation inputs when constructing a feature. A factory can enforce an argument contract, but should not silently turn missing data into an unrelated default document.",
    "challenge": "Supply a different report title through the factory"
  },
  "service-decorators": {
    "title": "Add behavior with a service decorator",
    "steps": [
      [
        "Keep the caller’s contract stable",
        "Does reducing the inner call count prove a universal performance improvement?"
      ],
      [
        "Compose a nonrecursive graph",
        "Why not build a second provider inside the decorator factory?"
      ],
      [
        "State the cache’s validity and resource policy",
        "What makes a cache hit incorrect even when the key string matches?"
      ],
      [
        "Test composition and behavior separately",
        "Where should a view model decide whether the repository is decorated?"
      ]
    ],
    "why": "Both MemoryCatalog and CachedCatalog implement ICatalog. The caller asks for Read(key) and does not need to know whether a cached value or the inner source produced the result. This pattern can add logging, metrics, retry policy, or validation when those behaviors preserve the capability’s observable contract.",
    "pitfall": "A wrapper test can inject a counting fake directly without DI, while a composition test verifies which implementation the provider exposes. Preserve exception and cancellation semantics when adapting this pattern to asynchronous services. Do not retry side-effecting operations blindly or hide errors merely to keep a cache populated.",
    "challenge": "Read a different key on the second request"
  },
  "options-validation": {
    "title": "Validate typed settings at the configuration boundary",
    "steps": [
      [
        "Give settings a typed contract",
        "Why does an integer property still need validation?"
      ],
      [
        "Understand when validation actually runs",
        "Does building this provider prove every options instance has been validated?"
      ],
      [
        "Surface actionable errors without exposing secrets",
        "Should a configuration diagnostic serialize the complete settings object by default?"
      ],
      [
        "Choose snapshot and reload semantics intentionally",
        "Why can changing a setting during an operation require an explicit policy?"
      ]
    ],
    "why": "A PageSettings object makes the intended PageSize value visible to consumers and tests. It does not automatically make every integer valid. Configuration providers supply inputs, options construction assembles them, and validation checks the application’s constraints. Keep defaults and valid ranges documented together so an environment override cannot quietly violate the contract.",
    "pitfall": "IOptions<T> provides an application-level cached value for its normal use. IOptionsMonitor<T> and IOptionsSnapshot<T> have different update and lifetime contracts; a client app still needs a deliberate scope model and change policy. Reloading configuration does not automatically update every view safely or guarantee that in-flight operations should change settings halfway through.",
    "challenge": "Replace the invalid page size with a valid value"
  }
};
