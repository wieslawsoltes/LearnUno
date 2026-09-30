/** Original explanations. Code is labelled as a fragment; linked core lessons run in Uno. */
const guide = (id, title, category, lesson, summary, sections, code, question, answer, exercise, source, cases) => ({id,title,category,lesson,summary,sections,code,question,answer,exercise,source,cases,language:'csharp'});
export const applicationGuides = [
guide('notification-boundaries','A changed item is not a changed collection','Architecture','observable-collections','Name the owner of a change before choosing the notification that should describe it.',[
['Draw three observation boundaries','A list screen usually has at least three independently observable things: the object that exposes Items, the Items collection, and each item inside it. Replacing the collection requires its owning property to notify. Adding an item changes collection membership. Editing that item changes an item property. Start debugging by stating which of these actually happened. A refresh button that rebuilds everything may hide the broken relationship, but it also discards evidence about why the original binding stayed stale.'],
['Follow the observer, not the screenshot','ObservableCollection reports its structural changes and changes to its own relevant properties such as Count. It does not automatically subscribe to every property of every contained item. A binding inside a DataTemplate can separately observe the current item through INotifyPropertyChanged. That is why a correctly notified row can update without CollectionChanged firing. A total outside the list needs its own dependency policy; it does not become observable simply because the row was observed.'],
['Treat replacement and mutation differently','Suppose a task keeps ID 42 while its Title changes. Updating Title preserves the task identity and can update just the dependent bindings. Replacing row 3 with a different task is a membership operation, and selection may need reconciliation by stable ID. Replacing the whole Items property adds another boundary. A Reset notification is not a universal substitute for missing item notifications; it can obscure changes, force container work, or disturb current editing. Preserve meaning before trying to reduce event counts.'],
['Test one edge at a time','Use three separate tests: add an item and verify membership; edit its title and verify the same identity displays the new title; assign another collection and verify the screen follows the replacement. Then add an aggregate, such as completed task count, and test its dependencies explicitly. When an aggregate subscribes to item events, define how duplicate items, removal, reset, and owner disposal detach those handlers. This keeps notification correctness and resource ownership in the same design rather than treating leaks as a later cleanup exercise.']
],`var tasks = new ObservableCollection<TaskRow>();
tasks.CollectionChanged += (_, e) => LogMembership(e.Action);
var row = new TaskRow(42, "Draft"); // Implements INotifyPropertyChanged.
tasks.Add(row);                     // Membership notification.
row.Title = "Reviewed";             // Item property notification.
// TaskRow and LogMembership are application-owned collaborators.
// Replacing the Items property also requires its owner's notification.`,
'If a task title changes, must the collection raise Reset for its row to update?',
'No. A binding to the task can observe its property notification directly. Reset describes collection-level change and is not the missing item-property contract.',
'In the linked collection exercise, replace string items with observable TaskRow objects. Preserve ID through renaming, add a filtered projection, and verify selection still targets the same ID after the title changes.',
'https://learn.microsoft.com/en-us/windows/apps/develop/data-binding/data-binding-in-depth',[
{label:'Rename one task',context:'The collection instance and membership are unchanged.',rows:[['Items owner','No replacement'],['Collection','No membership event needed'],['Task 42','PropertyChanged(nameof(Title))'],['Expected observation','Existing task row displays its new title']]},
{label:'Replace the collection',context:'Items now points to a different collection instance.',rows:[['Items owner','PropertyChanged(nameof(Items))'],['Old collection','No longer supplies this view'],['New collection','Subscribe according to the binding contract'],['Expected observation','The view observes the replacement and future membership changes']]}
]),
guide('focus-is-state','Focus belongs to the user’s task','XAML','accessibility','Separate focus, selection, visual highlighting, and keyboard handling.',[
['Distinguish the states','Selection identifies an item or value. Keyboard focus identifies the input target. Pointer hover identifies a transient pointing relationship. A selected list item does not necessarily contain the focused editor, and drawing a colored border does not move focus. Review a screen by naming all three states. After a dialog closes, ask which useful control should receive the next keystroke, not only whether the popup disappeared. The answer depends on the operation and whether the previous control still exists.'],
['Move focus at meaningful boundaries','An explicit submit that finds invalid input can move focus to a field that needs correction. Announce the error and preserve the text so the user can repair it. Do not move focus on every keystroke or use a page-level handler that steals ordinary editing keys. Programmatic focus is a request that can fail when the target is unloaded, disabled, or otherwise not focusable. Connect the request to the appropriate view lifecycle and inspect its result rather than assuming that constructing a control made it an active input target.'],
['Preserve identity through visual change','Responsive layouts and refreshed collections can remove the element that held focus. Retain the semantic target, such as document ID and field name, instead of keeping an obsolete control reference forever. Restore focus after the replacement is ready and only when that restoration still matches user intent. For dialogs, the original invocation control is a reasonable return target when it remains available; otherwise choose a deliberate nearby action. These rules keep asynchronous work from taking the keyboard away after the user has already moved elsewhere.'],
['Test without a pointer','Tab and Shift+Tab through the task. Type into every editor, submit invalid data, correct it, open and dismiss a dialog, and resize the workspace. Verify visible focus, meaningful names, and sensible order. A screenshot alone cannot establish any of these interaction sequences or screen-reader announcements. The linked Uno lesson exposes automation names; the design workshop supplies a keyboard-first form mockup. Use both, then repeat with assistive technology on the actual target because browser success is not certification for native accessibility implementations.']
],`// View-side submit handler; input is an attached TextBox.
if (string.IsNullOrWhiteSpace(input.Text))
{
    error.Text = "Enter a project title.";
    bool focused = input.Focus(FocusState.Programmatic);
    // Preserve the draft. Inspect a failed focus request in diagnostics.
    return;
}
// input, error, and the handler's lifecycle belong to this view.`,
'Will setting SelectedItem guarantee that the intended TextBox receives the next keypress?',
'No. Selection and keyboard focus are different states. Request focus on an eligible attached target at a meaningful interaction boundary, and do not confuse a visual highlight with actual focus.',
'Use the keyboard-first form design lab. Submit a short title, correct it, switch density, and open a modal operation. Record the focused semantic field after each action and test the same journey in the real Uno host.',
'https://learn.microsoft.com/en-us/windows/apps/develop/input/focus-navigation-programmatic',[
{label:'Invalid explicit submit',context:'The user requested Save; the current draft is too short.',rows:[['Draft text','Preserved'],['Selection','No unrelated change'],['Focus target','Field needing correction'],['Feedback','Named field plus an actionable validation message']]},
{label:'Background refresh completes',context:'The user moved from search into a notes editor while refresh was pending.',rows:[['Draft text','Preserved'],['Selection','Reconcile by stable identity if needed'],['Focus target','Keep the current editor'],['Feedback','Update result status without stealing keyboard focus']]}
]),
guide('culture-at-the-boundary','Parse user text; store a typed value','C#','localization','Keep input syntax, domain meaning, units, and display formatting as separate decisions.',[
['Choose the input contract first','A textbox contains text, not a decimal amount. Decide which culture supplies decimal separators, whether grouping is allowed, and which units the field represents. The same character sequence can have different meanings under different cultures. Do not try several cultures until one succeeds and silently pick a meaning. An application can offer an explicit culture choice or follow a documented user preference; either policy is better than accepting an ambiguous value and discovering the mismatch after saving it.'],
['Parsing does not establish validity','TryParse reports whether text can be interpreted under a syntax and range contract. It does not decide whether a negative quantity, an excessive price, or a fractional item count is allowed by your domain. Check those rules after obtaining the typed value. Also inspect the Boolean return rather than using the out value after failure: its zero value does not mean the user entered an accepted zero. Keep the original draft and explain the failed rule instead of overwriting it with a fallback number.'],
['Formatting is not a reversible store','A display such as a two-decimal price can round away information. Parsing that formatted label later may therefore fail to restore the original amount, even under the same culture. Store the canonical typed value and format at the presentation boundary. Treat units separately: 100 stored milliseconds is not 100 seconds merely because a caption changed. A converter should perform a documented conversion rather than contain persistence, authentication, or other unrelated business operations. It can be one-way when a trustworthy reverse transformation does not exist.'],
['Build a small boundary matrix','Test empty text, a valid decimal, a negative value, an out-of-range value, and separators from a different culture. Test the format with the cultures actually supported by the application, including grouping spaces and negative notation. Then change display precision without changing the stored value and verify it remains intact. Use an explicit invariant contract for a machine format when that format requires it, but do not assume invariant parsing is automatically appropriate for a person typing into a localized form.']
],`using System.Globalization;
var culture = CultureInfo.GetCultureInfo("pl-PL");
var style = NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint;
bool parsed = decimal.TryParse("12,50", style, culture, out var amount);
bool accepted = parsed && amount is >= 0m and <= 1000m;
string display = accepted ? amount.ToString("N2", culture) : "Correct the amount";
// Persist amount only after acceptance; never recover it by parsing display.`,
'Does successfully parsing a displayed, rounded string guarantee the original stored value was recovered?',
'No. Display formatting may discard precision, and the parser also needs the right syntax and culture. Keep the accepted typed value separate from the text produced for display.',
'In the localization lesson and converter workshop, introduce a three-decimal amount but display two decimals. Change the culture and the display precision, then verify the stored amount and its unit never change.',
'https://learn.microsoft.com/en-us/dotnet/api/system.decimal.tryparse?view=net-10.0',[
{label:'Accepted typed amount',context:'The field accepts pl-PL decimal syntax without grouping.',rows:[['Draft','12,50'],['Parser result','12.50m'],['Domain rule','Nonnegative, at most 1000'],['Persistence','Store the typed amount after acceptance']]},
{label:'Lossy display',context:'A stored amount is formatted with two fractional digits.',rows:[['Stored value','12.345m'],['Displayed precision','Two decimal places'],['Reverse operation','Cannot infer the discarded digit'],['Design decision','Do not use the label as the source of truth']]}
]),
guide('command-observation','A command predicate is not a notification','Architecture','toolkit-commands','Trace domain validity, command availability, the button’s observation, and execution separately.',[
['State the operation’s preconditions','A command wraps an action, but the action still needs a clear contract. A title might require three characters, no existing save may be running, and the current session may need permission to edit. CanExecute is a presentation-facing query about that contract. Keep it side-effect-free and fast; do not perform network work or mutate state while the UI asks whether an action is available. Expose meaningful feedback alongside a disabled action so the user knows what condition needs attention.'],
['Invalidate the observation','When an input to CanExecute changes, the command must tell interested controls to ask again. In CommunityToolkit.Mvvm, NotifyCanExecuteChanged raises that notification. Changing the Title property and notifying its binding does not automatically notify an unrelated command. Keep an explicit dependency list: if Title and IsSaving influence CanSave, changing either should invalidate the command’s observed availability. Generator attributes can produce this wiring in a full project, but they do not remove the underlying event contract.'],
['Validate the execution boundary too','A caller can invoke application operations without clicking the button, and preconditions can change between a query and an asynchronous completion. Disabling a control is therefore not the same as enforcing a business rule or an authorization rule. Validate again in the operation or service that owns the invariant. Choose a concurrency policy for asynchronous commands, expose a running state, and restore availability after success, failure, or cancellation. A command should not remain disabled forever because cleanup was placed only on the successful path.'],
['Observe a deliberately broken case','Begin with a short title and an unavailable Save command. Change the title to a valid value while intentionally withholding command invalidation. The predicate now returns true if asked directly, but the UI may retain its earlier observation. Then raise the notification and observe the difference. Test the inverse transition as well: a previously enabled button should become disabled when the draft becomes invalid. Finally invoke the underlying operation directly with bad data to prove the business boundary still rejects it.']
],`// Fragment inside a Toolkit ObservableObject view model.
public string Title
{
    get => title;
    set
    {
        if (SetProperty(ref title, value))
            SaveCommand.NotifyCanExecuteChanged();
    }
}
// title and SaveCommand are initialized members.
// SaveCommand is a RelayCommand whose predicate reads the current Title.`,
'If CanExecute would now return true, must the bound button already be enabled?',
'No. The button must reevaluate its observation. NotifyCanExecuteChanged supplies that invalidation; PropertyChanged on a different object or property is not a substitute for the command event.',
'Open the Toolkit command lesson. Remove only NotifyCanExecuteChanged, then compare direct predicate evaluation with the enabled state before restoring the notification. Add a second dependency and test both transitions.',
'https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/relaycommand',[
{label:'Input changed, no invalidation',context:'The command was first observed while the title was empty.',rows:[['Current title','Ready to save'],['Predicate when evaluated','true'],['CanExecuteChanged','Not raised'],['Button observation','May remain disabled']]},
{label:'Observation invalidated',context:'The same title change also notifies the command.',rows:[['Current title','Ready to save'],['Predicate when reevaluated','true'],['CanExecuteChanged','Raised'],['Button observation','Reevaluates availability; execution still enforces its own contract']]}
]),
guide('resource-template-boundaries','Resources, styles and templates solve different problems','XAML','resources','Separate reusable values, property policy, data presentation, and a control’s visual contract.',[
['Reuse the decision at the right level','A resource gives a reusable value a name. A Style applies a group of property setters to a target type. A DataTemplate describes the visuals for a data item. A ControlTemplate describes the internal appearance of a control. These mechanisms can refer to each other, but they are not interchangeable shortcuts. Start with the thing that is duplicated: a brush, a text treatment, a row presentation, or the visual structure of a reusable control. Choose the smallest mechanism that actually addresses that duplication.'],
['Check effective values before changing the palette','A local property assignment can override a setter. Consequently, editing a shared style may update most controls while leaving one apparently identical control unchanged. Investigate where the effective value comes from rather than copying another local override into the exception. ThemeResource and StaticResource also have different update purposes. A theme-dependent resource should be chosen with its reevaluation behavior in mind. Keep semantic roles such as foreground and surface distinct from hard-coded color names so a theme can preserve meaning without preserving every literal color.'],
['A template is a behavioral promise','A simplified control template can remove focus cues, state feedback, or expected named parts even when its first screenshot looks attractive. Compare default, focused, hovered, pressed, disabled, and high-contrast states when appropriate. For item templates, keep item data separate from the container’s recycled visual state. Test a list after sorting or virtualization, not only when every row is first created. The goal is not to make every control custom; it is to keep the component’s semantic contract intact while changing its presentation.'],
['Prefer named comparisons to unexplained styling','Create two cards that consume the same style. Give one a local FontSize, then change the shared setter. Explain exactly why their results differ. Next remove that local entry and repeat. In a separate item-template experiment, use two independent data items with the same visual recipe and mutate only one. Finally inspect a custom button template with the keyboard. These controlled comparisons make resource lookup, precedence, templated data context, and interaction behavior visible without conflating all four into a single large style file.']
],`<StackPanel.Resources>
  <Style x:Key="Heading" TargetType="TextBlock">
    <Setter Property="FontSize" Value="24" />
  </Style>
</StackPanel.Resources>
<TextBlock Text="Shared policy" Style="{StaticResource Heading}" />
<TextBlock Text="Local override" Style="{StaticResource Heading}" FontSize="32" />
<!-- Fragment: place these members in a namespaced StackPanel. -->`,
'Will changing a style’s FontSize setter necessarily change a control with a local FontSize?',
'No. A local value can take precedence over the style setter. Remove that local entry when the control should return to the shared policy; do not treat another local assignment as a repair to resource lookup.',
'Use the resource and value-precedence experiments to reproduce the two-text example. Then compare the result with a DataTemplate containing two item contexts and inspect focus feedback after replacing a control template.',
'https://learn.microsoft.com/en-us/windows/apps/develop/platform/xaml/xaml-styles',[
{label:'Shared style changes',context:'The style setter changes from 24 to 28.',rows:[['Text A','No local FontSize: resolves to 28'],['Text B','Local FontSize 32: remains 32'],['Tempting mistake','Copy a new local value into every control'],['Correct question','Which source should own this appearance decision?']]},
{label:'A template is replaced',context:'A button receives a visually minimal template.',rows:[['Initial appearance','May look correct'],['Keyboard focus','Must still be visible'],['Disabled / pressed','Need deliberate feedback'],['Acceptance','Test states and semantics, not only a static image']]}
]),
guide('async-initialization','Construction is not asynchronous readiness','Architecture','async-cancellation','Distinguish creating a view model, starting work, accepting results, and ending its lifetime.',[
['Make initial state valid','A constructor should establish a usable object and explicit initial state, even when data will arrive later. Starting fire-and-forget work from the constructor makes it difficult for the caller to await readiness, observe a failure, or supply cancellation. Expose initialization as an operation, use an async factory where appropriate, or let a well-defined application lifecycle invoke a loading command. The UI can display idle, loading, data, empty, or failure without pretending the object does not exist until its first request succeeds.'],
['Decide what repeated calls mean','Loaded events, navigation reentry, and user retries can all request initialization. Decide whether callers share a single in-flight Task, cancel and replace old work, queue operations, or deliberately perform independent requests. Store the task only according to that policy. Permanently caching a failed task can make Retry repeat the same exception without issuing another request. Blindly starting another task can instead duplicate subscriptions or overwrite newer state. State the contract before using a convenience property that starts work when read.'],
['Separate lifetime cancellation from stale-result rejection','Cancelling an owner’s token asks cooperative work to stop. A result can still race with cancellation, or a dependency may not observe it promptly. Before applying the result, check that it still belongs to the active request and owner. Do not let an old finally block clear a new request’s loading indicator. Keep request-local state and a generation or ownership check around acceptance and cleanup. The same discipline applies when a page is visually unloaded but its view model remains intentionally cached for navigation.'],
['Give failures a place to go','Await the operation at a boundary that can classify cancellation and failure, update feedback, and preserve previously accepted content when useful. Async void is appropriate for the required event-handler boundary, not as a general service return type that hides completion. During testing, arrange an old slow request and a newer fast one, close the owner, and inject a recoverable failure. Verify accepted data, errors, pending indicators, and availability together. A test that checks only the eventual text can miss a broken ownership contract.']
],`// Fragment in an owner-managed view model; all fields are application-owned.
public async Task InitializeAsync(CancellationToken token)
{
    var request = ++generation;
    var snapshot = await repository.LoadAsync(token);
    token.ThrowIfCancellationRequested();
    if (request != generation || isClosed) return;
    Items = snapshot;
}
// The caller awaits this Task and presents loading/failure/cancellation.
// Concurrent calls require an explicit sharing or replacement policy.`,
'Does a returned constructor imply that an asynchronous data load started inside it has completed successfully?',
'No. Object construction and asynchronous readiness are different contracts. Expose an awaitable operation and explicit state so the owner can observe completion, cancellation, and failure and reject obsolete results.',
'Use the async cancellation lesson with a deterministic fixture. Start two requests in opposite completion order, then close the owner. Verify neither an old result nor an old cleanup callback changes the new owner’s state.',
'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios',[
{label:'Newer request supersedes old',context:'A starts, then B starts and completes before A.',rows:[['Active generation','B'],['B completes','Accept when owner is alive'],['A completes later','Reject obsolete result'],['Cleanup','A must not clear B’s pending state']]},
{label:'Retry after failure',context:'The previous initialization attempt completed with an error.',rows:[['Failure','Observed and presented'],['Draft / accepted snapshot','Retained when useful'],['Retry policy','Start a new attempt, not the same failed task'],['Owner closure','Cancel owned work and reject late acceptance']]}
])
];
applicationGuides.find(g=>g.id==='resource-template-boundaries').language='xml';
