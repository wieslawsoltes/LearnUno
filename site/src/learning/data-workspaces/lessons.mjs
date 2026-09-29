import {practiceCases} from './practice.mjs';
/**
 * Original lesson material for LearnUno. Pure data; importing does not execute labs.
 * C# snippets use core Uno/.NET APIs so they do not require project-time generators.
 */
const imports = `using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Data;
`;
function csharp(body, supporting = '') {
  return imports + `\npublic static class Lesson\n{\n    public static UIElement Build()\n    {\n` + body.split('\n').map(l => '        ' + l).join('\n') + `\n    }\n}\n` + supporting;
}
function lesson(input) {
  if (!input.code.includes(input.edit.from)) throw new Error(`Missing edit anchor: ${input.id}`);
  const {edit, question, sections, ...other} = input;
  return {
    ...other,
    language: 'csharp', track: 'data-workspaces', level: 'Intermediate', minutes: 28,
    solution: input.code.replace(edit.from, edit.to), anchor: edit.from,
    challenge: edit.label, rules: [{contains: edit.to, label: edit.label}],
    hints: [edit.hint, `Compare ${edit.from} with ${edit.to}, then predict the changed result.`],
    quiz: {question: question.text, options: question.options, answer: question.answer, explanation: question.explanation},
    concepts: sections.slice(0, 3).map(s => [s.title, s.explanation]),
    steps: sections,
    objectives: input.objectives,
    diagram: input.visual,
    introducedIn: 'app-workspaces-refinement',
    codeStatus: 'Authored core-Uno example. Requires compile and browser execution in the target runner before release.'
  };
}
export const dataWorkspaces = [
lesson({
  id:'value-converters', title:'Converters: translate a value, not the application',
  summary:'Use an IValueConverter as a narrow presentation boundary while preserving typed state, culture, and directionality.',
  visual:'converter-contract', source:'value-converters',
  prerequisiteLessons:['binding-flow','two-way','change-notification'],
  objectives:['Trace source → conversion → target without mutating the source.', 'Distinguish presentation conversion from validation, persistence, and domain calculation.', 'Choose a deliberate ConvertBack contract and test boundary values.'],
  predict:'A Slider supplies 0.375 and the converter uses the P0 format. Predict the displayed percentage, then decide whether changing precision should alter the Slider value.',
  pitfall:'The percentage conversion is intentionally OneWay. Formatting a double into a string does not establish a general reversible mapping; do not reuse this converter for editable numeric fields without a parse and validation policy.',
  transfer:'Create a typed measurement model with a numeric value and an explicit unit. Implement a OneWay display converter, then design a separate validated editor. Test zero, fractional values, a non-finite input, and two cultures. Explain why a display string should not be your durable model.',
  references:['https://learn.microsoft.com/en-us/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.data.ivalueconverter','https://learn.microsoft.com/en-us/windows/apps/develop/data-binding/data-binding-in-depth'],
  code:csharp(`var amount = new Slider { Minimum = 0, Maximum = 1, Value = 0.375, Header = "Completion (fraction)" };
var result = new TextBlock { FontSize = 28 };
result.SetBinding(TextBlock.TextProperty, new Binding
{
    Source = amount,
    Path = new PropertyPath(nameof(Slider.Value)),
    Mode = BindingMode.OneWay,
    Converter = new PercentageConverter(),
    ConverterParameter = "P0"
});
var panel = new StackPanel { Padding = new Thickness(24), Spacing = 16 };
panel.Children.Add(amount);
panel.Children.Add(result);
return panel;`, `
public sealed class PercentageConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, string language)
    {
        if (value is not double number || !double.IsFinite(number))
            return DependencyProperty.UnsetValue;
        var format = parameter as string ?? "P0";
        CultureInfo culture;
        try { culture = string.IsNullOrWhiteSpace(language) ? CultureInfo.CurrentCulture : CultureInfo.GetCultureInfo(language); }
        catch (CultureNotFoundException) { culture = CultureInfo.InvariantCulture; }
        return number.ToString(format, culture);
    }
    public object ConvertBack(object value, Type targetType, object parameter, string language)
        => throw new NotSupportedException("This presentation converter supports OneWay bindings only.");
}
`),
  edit:{from:'ConverterParameter = "P0"',to:'ConverterParameter = "P1"',label:'Show one fractional percentage digit without changing the source value.',hint:'The source stores a fraction; the converter parameter controls only the output format.'},
  question:{text:'Should a OneWay display converter save a formatted percentage back to your repository?',options:['Yes; converters are the persistence boundary.','No; it should return a presentation value without performing persistence.','Only when the percentage contains decimals.'],answer:1,explanation:'Conversion can run whenever the binding needs a target value. Persisting from it couples rendering to side effects and can produce repeated writes. A command or application service owns saving.'},
  sections:[
    {title:'Identify the two types before writing code',explanation:'Start by naming the source and target types. In this lesson the Slider.Value dependency property supplies a double and TextBlock.Text expects a string. The source stores a fraction because that is useful for calculations; the view displays a percentage because that is useful for a reader. The converter is a small adapter between these representations. It is not where the application determines whether an operation is complete, records history, or writes a database row. Keeping the conversion pure makes repeated binding evaluation harmless and makes the result easy to test.',worked:'For a source value of 0.375, a percentage formatter scales the number for presentation. The model does not become 37.5. A second view could display 0.375 as a decimal without changing either the Slider or the first view.',prompt:'After changing the display precision, which object should still contain 0.375?',answer:'The Slider remains the numeric source. Only the returned string changes. Check the source value independently rather than inferring it from rounded text.'},
    {title:'Make failure and culture part of the contract',explanation:'IValueConverter receives object values because bindings can connect many types. A professional converter still has a narrow accepted input contract. Test the expected type rather than blindly casting; decide what to do with null, an incompatible object, and a non-finite number. The example returns UnsetValue when it cannot provide a value. That sentinel is a binding-system result, not a display string. Culture is equally explicit: decimal separators, grouping, and percentage placement are formatting decisions. The example tries the provided language and uses a deterministic fallback for an invalid culture identifier.',worked:'Compare 0.375 with an input of double.NaN in a unit test of Convert. The first returns text; the second returns the exact dependency-property sentinel. Compare those results by type or identity rather than converting everything to strings.',prompt:'Why is returning the string "UnsetValue" not equivalent to returning DependencyProperty.UnsetValue?',answer:'A string is an ordinary target value and can appear on screen. The sentinel instructs the binding system that the converter did not produce a usable value.'},
    {title:'Choose directionality before promising reversibility',explanation:'A formatted representation is often lossy. Rounding a fraction to a whole percentage discards information; several source numbers can produce the same text. That means ConvertBack is not simply Convert run in reverse. For an editable field, parsing also has intermediate states: an empty string or a trailing decimal separator can be a legitimate draft but not a committed numeric value. Keep that draft, its errors, and the eventual commit separate from a read-only display converter. The sample declares OneWay and deliberately rejects ConvertBack so its actual supported behavior is visible.',worked:'Values 0.371 and 0.374 can display the same whole percentage. Reading that display text back cannot tell you which original value existed. A save form should retain typed state or a separate draft rather than reconstructing its model from a rounded label.',prompt:'When would TwoWay plus a converter be appropriate?',answer:'When both conversion directions have a specified, tested contract and the edit/update timing matches the task. It is not appropriate merely because the target control can be edited.'},
    {title:'Test the adapter separately, then verify the binding',explanation:'There are two different checks. A direct converter test proves that given a value, parameter, and culture, the conversion returns the intended result or sentinel. A binding test proves that source changes invoke that adapter and reach the real target property in the intended mode. Keep both: a correct converter attached to a misspelled path still leaves a broken interface. In the browser lesson, move the Slider and inspect the label. In a full project, add tests for wrong input types and cultures without creating a Window, then run one representative UI interaction against the published target.',worked:'First invoke Convert with 0.375 and P1. Next run the lesson and move the Slider. Finally temporarily change the binding path to an invalid name: the adapter can remain correct while the relationship fails.',prompt:'What does seeing a correctly formatted initial label fail to prove?',answer:'It does not prove that later source updates propagate, that editable text parses correctly, or that the binding behaves on every target. Test a change after initialization and the declared platform configuration.'}
  ]
}),
lesson({
  id:'paged-collections', title:'Paging a list without losing identity',
  summary:'Separate loaded data from realized visuals and build a bounded, duplicate-safe page-loading flow.',
  visual:'page-window', source:'items-source', prerequisiteLessons:['observable-collections','virtualization','async-cancellation'],
  objectives:['Distinguish data paging from UI virtualization.', 'Serialize a page request and commit its data and cursor together.', 'Retain stable item identity and meaningful loading feedback.'],
  predict:'The ListView viewport stays the same height while page size changes from five to three. Predict which count changes and which layout constraint stays fixed.',
  pitfall:'This lesson uses an explicit Load next page button and a deterministic local fixture. It does not claim to implement ISupportIncrementalLoading or to demonstrate a server-side cursor protocol.',
  transfer:'Move the page source behind an interface and return a page result containing items, next cursor, and has-more. Add cancellation, a duplicate-ID policy, and a retained error state. Test two rapid load requests, a repeated boundary item, an empty final page, and cancellation before cursor commit.',
  references:['https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview','https://learn.microsoft.com/en-us/dotnet/api/system.collections.objectmodel.observablecollection-1'],
  code:csharp(`var source = Enumerable.Range(1, 23).Select(id => new Row(id, $"Task {id}" )).ToArray();
var items = new ObservableCollection<Row>();
var seen = new HashSet<int>();
var cursor = 0;
var pageSize = 5;
var loading = false;
var status = new TextBlock { Text = "No pages loaded yet.", TextWrapping = TextWrapping.Wrap };
var next = new Button { Content = "Load next page" };
var list = new ListView { ItemsSource = items, Height = 260 };
next.Click += async (_, _) =>
{
    if (loading || cursor >= source.Length) return;
    loading = true;
    next.IsEnabled = false;
    status.Text = "Loading a deterministic local page…";
    try
    {
        await Task.Delay(150);
        var page = source.Skip(cursor).Take(pageSize).ToArray();
        foreach (var row in page)
            if (seen.Add(row.Id)) items.Add(row);
        cursor += page.Length;
        status.Text = $"Loaded {items.Count} of {source.Length}; next offset {cursor}.";
    }
    finally
    {
        loading = false;
        next.IsEnabled = cursor < source.Length;
    }
};
var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };
root.Children.Add(status); root.Children.Add(next); root.Children.Add(list);
return root;`, `
public sealed record Row(int Id, string Title)
{
    public override string ToString() => $"#{Id}: {Title}";
}
`),
  edit:{from:'var pageSize = 5;',to:'var pageSize = 3;',label:'Load three data items per page while keeping the viewport bounded.',hint:'Change the requested batch size, not ListView.Height.'},
  question:{text:'Does a virtualized ListView guarantee that only one page of data is loaded?',options:['Yes; a small visual tree implies a small dataset.','No; realization and loading are independent responsibilities.','Only when items are records.'],answer:1,explanation:'UI virtualization bounds visual containers. Data paging bounds fetched or retained data. A virtualized control can still receive an enormous in-memory collection.'},
  sections:[
    {title:'Separate three counts: total, loaded, realized',explanation:'A data-rich screen has at least three relevant sizes. The source may contain thousands of records. Your client may have loaded only several pages. The items control may currently realize only the containers needed around its viewport. Those counts describe different allocations and change for different reasons. A Load more operation should not make the viewport unbounded, and a virtualized viewport should not be treated as evidence that the data source is paged. Name all three quantities when discussing memory or startup behavior.',worked:'Suppose the service contains 23 tasks, the client has loaded 10, and the viewport shows roughly six rows. Requesting another page increases loaded data; resizing the viewport may increase realized visuals without requesting anything.',prompt:'Which count does changing the page-size variable directly affect?',answer:'It changes the number of records requested in each page. It does not directly change the viewport height or prescribe the control’s exact realization policy.'},
    {title:'Make request ownership and cursor updates atomic in intent',explanation:'The next cursor represents what has been successfully incorporated, not what was merely requested. Capture the starting cursor, fetch the page, validate the response, and only then advance the cursor alongside accepting the items. A loading flag prevents a second button click from starting another request for the same interval. The lab has no network failure, but its shape makes that ownership visible. In a real asynchronous service, cancellation or failure must leave the last committed cursor usable for retry. Avoid advancing first and then discovering that the page never arrived.',worked:'At cursor 5 with page size 5, both rapid clicks would ask for rows 6–10 without a concurrency gate. A gate keeps one request active. A failed request should leave cursor 5 rather than skipping to 10.',prompt:'Why should a retry usually reuse the last committed cursor?',answer:'That cursor describes the data already accepted. Reusing it lets the failed interval be requested again instead of silently skipping records.'},
    {title:'Stable keys matter at page boundaries',explanation:'Real sources can change between requests. Offset pagination can encounter a repeated item or miss an item when records are inserted or deleted ahead of the offset. A cursor protocol can reduce some problems, but its guarantees are defined by the service. The client still needs a stable key and an explicit policy for duplicates: ignore, replace, merge, or report them. This lab uses a HashSet to prevent repeated IDs from being appended twice. That is a simple membership policy, not a complete synchronization strategy for updated records.',worked:'A service returns IDs 4, 5, 6 for a later page although IDs 4 and 5 already exist locally. An append-only loop would create duplicates. The lab’s seen-ID set appends only 6. A changed Title for ID 5 would require an update policy that this simple set does not implement.',prompt:'Does deduplicating by ID ensure you have the newest data for that ID?',answer:'No. It prevents duplicate membership. Reconciliation of newer field values is a separate policy, and should be tested as such.'},
    {title:'Expose loading and end-of-data without disturbing the task',explanation:'The button and status text explain whether another page can be loaded. Existing rows remain visible while a new page is pending; a loading indicator should not unnecessarily replace useful content. When the source is exhausted, disable the action and make the end state understandable. For automatic incremental loading, apply the same request gate and end-of-data contract behind the control-specific trigger. Add tests for a final short page, an empty response, and a source that incorrectly reports more data without advancing its cursor.',worked:'With 23 items and pages of five, the final successful page has three items. After accepting it, cursor equals 23 and the button becomes disabled. With pages of three, the final page has two items; the result should still terminate.',prompt:'Why is “received fewer than page size” not universally a correct end-of-data rule?',answer:'Some APIs can return short pages while still having a next cursor. Follow the service’s explicit has-more/cursor contract rather than inferring guarantees it does not make.'}
  ]
}),
lesson({
  id:'empty-loading-error',title:'Loading is not the opposite of content',summary:'Represent initial loading, refresh, empty results, errors, and retained content as explicit outcomes.',
  visual:'content-outcomes',source:'async',prerequisiteLessons:['resilience','async-cancellation','task-failure'],
  objectives:['Separate request status from the presence of useful content.', 'Keep cancellation distinct from failure.', 'Present a recoverable refresh error without discarding a successful snapshot.'],
  predict:'Load once successfully, then refresh. The fixture fails every second request. Predict whether the existing rows should disappear, and identify the message that explains the failed refresh.',
  pitfall:'The request outcomes are deterministic fixtures; the lesson does not contact a service. Retaining old rows is a presentation policy and must be accompanied by a freshness signal in applications where stale data matters.',
  transfer:'Extract a immutable screen-state type containing phase, current data, error, and freshness metadata. Define valid transitions for first load, refresh, cancel, and retry. Test that no transition accidentally labels old data as a newly successful response.',
  references:['https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/','https://learn.microsoft.com/en-us/windows/apps/design/controls/progress-controls'],
  code:csharp(`var items = new ObservableCollection<string>();
var status = new TextBlock { Text = "No request yet.", TextWrapping = TextWrapping.Wrap };
var load = new Button { Content = "Load / refresh" };
var clear = new Button { Content = "Make next success empty" };
var cancel = new Button { Content = "Cancel request", IsEnabled = false };
CancellationTokenSource? pending = null;
cancel.Click += (_, _) => pending?.Cancel();
var list = new ListView { ItemsSource = items, Height = 220 };
var attempt = 0;
var busy = false;
var emptyNext = false;
clear.Click += (_, _) => emptyNext = true;
load.Click += async (_, _) =>
{
    if (busy) return;
    busy = true; load.IsEnabled = false; cancel.IsEnabled = true;
    pending = new CancellationTokenSource();
    status.Text = items.Count == 0 ? "Initial loading…" : "Refreshing; current rows remain visible…";
    try
    {
        await Task.Delay(200, pending.Token);
        attempt++;
        if (attempt % 2 == 0) throw new InvalidOperationException("Fixture refresh failed.");
        var result = emptyNext ? Array.Empty<string>() : new[] { "Plan", "Build", "Reflect" };
        emptyNext = false;
        items.Clear();
        foreach (var item in result) items.Add(item);
        status.Text = result.Length == 0 ? "Loaded successfully: no matching rows." : "Loaded successfully: current snapshot.";
    }
    catch (OperationCanceledException)
    {
        status.Text = items.Count == 0 ? "Request cancelled; no accepted snapshot." : "Refresh cancelled; previous rows retained.";
    }
    catch (Exception error)
    {
        status.Text = items.Count == 0 ? $"Load failed: {error.Message}" : $"Refresh failed; showing older rows: {error.Message}";
    }
    finally { pending.Dispose(); pending = null; busy = false; load.IsEnabled = true; cancel.IsEnabled = false; }
};
var panel = new StackPanel { Padding = new Thickness(24), Spacing = 12 };
panel.Children.Add(status); panel.Children.Add(load); panel.Children.Add(cancel); panel.Children.Add(clear); panel.Children.Add(list);
panel.Unloaded += (_, _) => pending?.Cancel();
return panel;`),
  edit:{from:'attempt % 2 == 0',to:'attempt % 3 == 0',label:'Fail every third fixture request and inspect retained content after the failure.',hint:'Change only the deterministic failure cadence; keep successful empty data distinct from an exception.'},
  question:{text:'A refresh fails after data was previously loaded. What is the most informative state?',options:['Silently show old rows as though refresh succeeded.','Always erase all rows immediately.','Retain useful rows when appropriate and explicitly report the refresh failure/freshness.'],answer:2,explanation:'A request result and existing content are separate facts. Retention can preserve the task, but stale data must not be presented as a successful fresh response.'},
  sections:[
    {title:'Model the request and the content separately',explanation:'The common IsLoading/HasError/IsEmpty trio can produce contradictions unless transitions are carefully controlled. It also misses an important case: a screen can contain useful data while a refresh is loading or failing. Begin with the user’s task. During the first request there may be no content to preserve; during refresh there may be an entire selection and working context worth retaining. Represent request status separately from the accepted snapshot and its freshness. A discriminated-state design or a validated record can make illegal combinations harder to create.',worked:'The first click shows initial loading because no snapshot exists. After success, a later click changes request status to refreshing while keeping the prior rows. Those rows are old but useful; they are not the response to the new pending request.',prompt:'Can loading and visible content both be true?',answer:'Yes. Refreshing a screen is a normal example. The design should say that the displayed content belongs to the last accepted snapshot.'},
    {title:'A successful empty result is not an error',explanation:'An empty result means a request succeeded and returned no matching records under its contract. An error means the application failed to establish that result. They need different explanations and actions. An empty filtered list might offer a clear-filter action. A failed request might offer retry and diagnostic context. Treating both as an empty array conceals the cause and makes troubleshooting misleading. Keep the result classification until the view has enough information to choose the correct presentation.',worked:'Set the next successful fixture to empty. A success message says no matching rows. Compare that with a first-load exception: the list can look equally empty, but the text and available recovery action should explain a different situation.',prompt:'Why is a blank list alone insufficient feedback?',answer:'The same pixels can represent not-yet-loaded, successfully empty, filtered-out, failed, or cancelled work. The user needs semantic status to understand what happened.'},
    {title:'Commit a new snapshot only after success',explanation:'Do not clear the accepted data merely because a refresh began unless the product explicitly requires it. Fetch into a temporary result, validate it, and then replace the current snapshot through a deliberate update. On failure, keep the accepted snapshot and set an error/freshness state. On cancellation, preserve the appropriate previous state without presenting cancellation as a system defect. In an overlapping-request design, also reject stale completions; retaining content alone does not prevent an older response from overwriting newer intent.',worked:'The second fixture request throws before the collection is cleared. The original three rows remain. Move Clear before the delay as a temporary experiment and observe how a failed refresh would unnecessarily destroy the useful view.',prompt:'What else is needed when two refreshes can overlap?',answer:'A concurrency policy such as serial execution, cancellation plus generation checks, or explicit result ordering. The accepted snapshot should belong to the current request policy.'},
    {title:'Test transitions rather than isolated Boolean values',explanation:'A good screen-state test walks a journey: initial → loading → success → refreshing → error-with-content → retry → empty-success. Verify the data reference or IDs, not just the label. Check that actions become available again in finally, that error text is cleared on a later success, and that keyboard focus is not thrown away by unnecessary view recreation. The lab intentionally uses a simple collection and status label; a reusable production implementation should expose the same distinctions through view-model state and accessible feedback.',worked:'Run a successful load, a failed refresh, and a successful empty response. At each point record whether a snapshot exists, whether a request is active, and what the most recent outcome was. The combination should match one legal state in your design.',prompt:'Why should a test assert retained IDs after failure?',answer:'A label can be correct while the collection was accidentally cleared or rebuilt. Verifying the actual accepted content tests the behavior the user depends on.'}
  ]
}),
lesson({
  id:'optimistic-edits',title:'Optimistic edits without silent overwrites',summary:'Use explicit expected versions to detect conflicting edits while preserving the user’s draft.',
  visual:'versioned-commit',source:'mvvm',prerequisiteLessons:['mvvm-drafts','record-identity','input-contracts'],
  objectives:['Distinguish draft state from an accepted versioned record.', 'Reject a commit based on a stale expected version.', 'Preserve the draft and offer a deliberate conflict-recovery choice.'],
  predict:'Edit the title locally, simulate an external update, then save. The draft was opened against version 1 but the store now contains version 2. Predict the outcome before clicking Save.',
  pitfall:'The in-memory store simulates compare-and-update semantics; it is not a distributed concurrency implementation. A real service must enforce the comparison atomically at its own trust and transaction boundary.',
  transfer:'Define a repository commit result with success, validation failure, conflict, cancellation, and transport failure. Preserve both the latest server snapshot and the local draft on conflict. Test retry with a fresh expected version and a user-confirmed merge.',
  references:['https://learn.microsoft.com/en-us/ef/core/saving/concurrency','https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record'],
  code:csharp(`var store = new VersionedStore();
var opened = store.Current;
var draft = new TextBox { Header = "Local draft", Text = opened.Title };
var report = new TextBlock { Text = $"Opened version {opened.Version}.", TextWrapping = TextWrapping.Wrap };
var save = new Button { Content = "Save with expected version" };
var external = new Button { Content = "Simulate external update" };
var reload = new Button { Content = "Discard draft and reload" };
external.Click += (_, _) =>
{
    store.ExternalUpdate("Changed elsewhere");
    report.Text = $"Store is now version {store.Current.Version}; local draft still expects {opened.Version}.";
};
save.Click += (_, _) =>
{
    var title = draft.Text.Trim();
    if (title.Length < 3) { report.Text = "Use at least three characters."; return; }
    if (store.TryCommit(opened.Version, title, out var accepted))
    {
        opened = accepted;
        report.Text = $"Saved version {accepted.Version}: {accepted.Title}";
    }
    else report.Text = $"Conflict: expected {opened.Version}, actual {store.Current.Version}. Your draft is retained.";
};
reload.Click += (_, _) =>
{
    opened = store.Current; draft.Text = opened.Title;
    report.Text = $"Reloaded version {opened.Version}; the previous draft was explicitly discarded.";
};
var panel = new StackPanel { Padding = new Thickness(24), Spacing = 12 };
panel.Children.Add(draft); panel.Children.Add(save); panel.Children.Add(external); panel.Children.Add(reload); panel.Children.Add(report);
return panel;`, `
public sealed record DocumentSnapshot(int Version, string Title);
public sealed class VersionedStore
{
    public DocumentSnapshot Current { get; private set; } = new(1, "First title");
    public void ExternalUpdate(string title) => Current = new(Current.Version + 1, title);
    public bool TryCommit(int expectedVersion, string title, out DocumentSnapshot accepted)
    {
        if (Current.Version != expectedVersion) { accepted = Current; return false; }
        accepted = new DocumentSnapshot(Current.Version + 1, title);
        Current = accepted;
        return true;
    }
}
`),
  edit:{from:'title.Length < 3',to:'title.Length < 5',label:'Require five characters while preserving the expected-version conflict check.',hint:'Validation and concurrency answer different questions. Strengthen the draft rule without bypassing TryCommit.'},
  question:{text:'Can a client-side version check alone prevent conflicting writes on a server?',options:['Yes; the browser has the latest state.','No; the authoritative store must atomically enforce the expected-version condition.','Only when records are immutable.'],answer:1,explanation:'A client can observe version 1 and race with another writer before saving. The trusted storage/service boundary must compare and update atomically; immutable client records do not supply that guarantee.'},
  sections:[
    {title:'A draft is based on a particular snapshot',explanation:'When a user opens an editor, they are not editing an abstract timeless record. Their choices are based on the values and version they saw. Retain that base snapshot separately from the editable draft. A stable record ID says which entity is being edited; a version says which accepted state the draft was derived from. Neither substitutes for the other. This separation also improves Cancel: abandoning the draft does not require undoing mutations already made to the accepted model.',worked:'The editor opens title First title at version 1. The user types a new title but the store remains unchanged. The local draft now contains unsaved intent whose base is still version 1.',prompt:'Why should the base version not change merely because the user types?',answer:'Typing changes local intent, not the accepted state on which that intent was based. Updating the expected version without accepting or reconciling a fresh snapshot would conceal a conflict.'},
    {title:'Compare and commit at the authoritative boundary',explanation:'Optimistic concurrency allows work to proceed without holding a long-lived lock for the entire editing session. At commit time, the caller provides the version they expect. The store compares that expectation with the current version and either accepts the update or reports a conflict. In this synchronous in-memory lab, TryCommit shows the algorithm in one method. In production, the comparison and write must be enforced atomically by the service or database; a separate client read followed by an unconditional write is still a race.',worked:'Simulate an external update. The store moves to version 2 while the draft expects version 1. TryCommit rejects the stale expectation before changing Current. A later reload deliberately changes both the draft and its base.',prompt:'What is wrong with reading Current.Version immediately before every save and sending it as the expected version?',answer:'That can turn the operation into an overwrite of changes the user never reviewed. The expected version should express the draft’s actual base, unless a deliberate merge/rebase policy has accepted the newer state.'},
    {title:'Preserve intent when reporting a conflict',explanation:'A conflict is not the same as invalid input or a network timeout. The user may have entered valid, valuable work that cannot be committed unchanged against the current base. Preserve that draft and show enough context for an informed decision. Possible policies include reload/discard, compare-and-merge, or an explicitly privileged force-overwrite flow. Never silently discard the draft while showing an error, and never retry a conflicting update indefinitely with fresh versions without user-approved reconciliation.',worked:'The lab retains the TextBox contents after conflict and offers a clearly named Discard draft and reload button. That button is intentionally different from retry: it changes the editing base and abandons the old local intent.',prompt:'Why should reload be explicit instead of automatic on a conflict?',answer:'An automatic reload can destroy the user’s unsaved work. Explicit wording and a preserved draft make the consequence visible and recoverable.'},
    {title:'Test conflict paths with identities and versions',explanation:'Test the accepted and rejected paths independently. A successful commit should produce a new version and the intended title. A conflict should leave the authoritative record unchanged and leave the local draft available. Add validation failure, transport ambiguity, cancellation, and deletion of the underlying entity to a production suite. A transport failure after the server may have committed is especially different from a clean rejection; idempotency or operation identifiers can be needed before retrying. Do not assume every exception proves that nothing happened.',worked:'Record version and title before the stale save, attempt the save, then compare the stored snapshot and draft afterward. The store remains at the external title/version, and the draft still contains the user’s proposed title.',prompt:'Does a timeout prove that a server rejected the write?',answer:'No. The write may have completed while the response was lost. Resolve that ambiguity with the service’s operation/idempotency contract rather than blindly repeating a non-idempotent action.'}
  ]
}),
lesson({
  id:'batch-notifications',title:'Collection updates: events, identity, and cost',summary:'Compare incremental notifications with deliberate reset-style replacement without inventing a free batching API.',
  visual:'collection-batch-ledger',source:'items-source',prerequisiteLessons:['observable-collections','listview-selection','allocation-budget'],
  objectives:['Count actual collection events for two update strategies.', 'Distinguish fewer notifications from less total work.', 'Keep selection and item identity explicit during replacement.'],
  predict:'Replacing ten items by Clear plus ten Adds emits a different event sequence from a custom ReplaceAll reset. Predict the event counts, then explain why the smaller count is not automatically faster.',
  pitfall:'ObservableCollection<T> does not provide a universal AddRange/transaction API. The ResetCollection below is a deliberately limited custom collection that snapshots its input and emits one Reset after replacement; it is not a production performance claim.',
  transfer:'Measure a representative collection update in a published app. Compare event counts, realized-container work, selection retention, and elapsed user-visible latency. Define stable-key selection restoration and test a failed input enumeration before mutation.',
  references:['https://learn.microsoft.com/en-us/dotnet/api/system.collections.objectmodel.observablecollection-1','https://learn.microsoft.com/en-us/dotnet/api/system.collections.specialized.notifycollectionchangedaction'],
  code:csharp(`var data = new ResetCollection<string>();
var events = new List<string>();
data.CollectionChanged += (_, e) => events.Add(e.Action.ToString());
var size = 10;
var report = new TextBlock { Text = "Choose an update strategy.", TextWrapping = TextWrapping.Wrap };
var list = new ListView { ItemsSource = data, Height = 220 };
var incremental = new Button { Content = "Clear + Add each item" };
var reset = new Button { Content = "ReplaceAll with one Reset" };
void Show() => report.Text = $"{events.Count} collection events: {string.Join(", ", events)}";
incremental.Click += (_, _) =>
{
    events.Clear(); data.Clear();
    foreach (var item in Enumerable.Range(1, size)) data.Add($"Row {item}");
    Show();
};
reset.Click += (_, _) =>
{
    events.Clear();
    data.ReplaceAll(Enumerable.Range(1, size).Select(i => $"Row {i}"));
    Show();
};
var panel = new StackPanel { Padding = new Thickness(24), Spacing = 12 };
panel.Children.Add(incremental); panel.Children.Add(reset); panel.Children.Add(report); panel.Children.Add(list);
return panel;`, `
public sealed class ResetCollection<T> : ObservableCollection<T>
{
    public void ReplaceAll(IEnumerable<T> source)
    {
        ArgumentNullException.ThrowIfNull(source);
        var snapshot = source.ToArray(); // enumerate before mutating; permits source == this
        CheckReentrancy();
        Items.Clear();
        foreach (var item in snapshot) Items.Add(item);
        OnPropertyChanged(new PropertyChangedEventArgs(nameof(Count)));
        OnPropertyChanged(new PropertyChangedEventArgs("Item[]"));
        OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
    }
}
`),
  edit:{from:'var size = 10;',to:'var size = 25;',label:'Compare the actual collection-event counts when replacing twenty-five items.',hint:'Increase the dataset, then run both buttons. Record event count separately from rendering time.'},
  question:{text:'Does one Reset event prove that a collection update is cheaper than several Add events?',options:['Yes; event count equals rendering cost.','No; Reset can cause broad container and selection work, so measure the real task.','Only if every item is a string.'],answer:1,explanation:'Reset is a broad invalidation signal. It may save notification overhead but force consumers to rebuild or reconcile more state. Correctness, selection, and actual target behavior matter.'},
  sections:[
    {title:'Observe events before making a performance claim',explanation:'Collection notification is a protocol between the data source and its consumers. Add identifies a membership change; Reset says the consumer should reconsider the collection broadly. Counting these events is useful evidence about the protocol, but it is not a measurement of layout, container creation, or frame presentation. This lesson intentionally reports event count and action names instead of decorating the interface with an invented speedup. Start by describing the observable sequence, then profile the full user task on the intended target.',worked:'Clear followed by ten Add calls emits a Reset and ten Add events in this example. The custom replacement emits one Reset. Both produce ten rows, but the consumer receives different information about how that result was reached.',prompt:'What does the event ledger prove, and what does it not prove?',answer:'It proves which collection notifications were emitted by the source. It does not prove the renderer’s total work, the number of reused containers, or input-to-display latency.'},
    {title:'Snapshot input before mutating the collection',explanation:'A replacement operation should define when input enumeration happens. An IEnumerable can execute arbitrary deferred work, throw halfway through, or refer to the collection being replaced. If you clear the target and then enumerate it as the source, you have already destroyed the input. Materializing first avoids that self-source problem and prevents an enumeration failure from leaving a partially replaced target. It does not make every later allocation or event handler failure magically transactional; keep the exact guarantee narrow and documented.',worked:'Call ReplaceAll(data) on the custom collection. ToArray captures the rows before Items.Clear. Without the snapshot, the loop would enumerate an empty collection and unintentionally erase all rows.',prompt:'Does snapshotting first make the entire operation infallible?',answer:'No. It protects the pre-mutation enumeration boundary. Memory allocation, mutation, and observer callbacks still have their own failure behavior.'},
    {title:'Reset changes the consumer’s information',explanation:'Incremental events let a control update known regions and can preserve useful container relationships. A reset provides less specific information and can lead to broad reconstruction or reconciliation. The correct strategy depends on the collection size, update shape, control behavior, and selection policy. Replacing item objects also changes reference identity even when labels are equal. Store selected entity keys separately when selection must survive reloading, then deliberately resolve them against the accepted new dataset. Do not infer identity from display text.',worked:'Select Row 4 and replace the dataset with newly constructed objects bearing the same titles. A production control may not treat the old selected object as the new entity. A stable ID lets the application decide whether and how to restore the selection.',prompt:'Why should the lesson not promise selection preservation from ResetCollection alone?',answer:'The collection only emits membership signals. Selection belongs to the consuming control/application contract and depends on identity and reconciliation policy.'},
    {title:'Measure the right update strategy for the task',explanation:'Use realistic data and templates when deciding between individual edits, bounded batches, and snapshot replacement. Measure notification overhead separately from binding reevaluation, layout, rendering, and lost-user-context costs. A tiny event-count experiment is useful for understanding the mechanism but not for choosing a universal production strategy. Keep the UI responsive by avoiding thousands of dispatcher posts and by yielding or batching where semantics allow. Add regression tests for final contents, event actions, same-source replacement, and selection behavior.',worked:'For a small one-row correction, a targeted Replace can communicate more useful information than rebuilding the whole list. For loading a completely different query result, a reset-style replacement may match the semantics better. Benchmark both on the actual workload.',prompt:'Which acceptance criteria should accompany an update benchmark?',answer:'The final data must be correct, stable identities and selection must obey the product policy, exceptions must not silently corrupt state, and latency must be measured for the actual user-visible operation.'}
  ]
}),
lesson({
  id:'undo-redo',title:'Undo and redo as a bounded state history',summary:'Build a deterministic history with immutable snapshots, explicit boundaries, and redo invalidation after a new edit.',
  visual:'history-branch',source:'mvvm',prerequisiteLessons:['record-identity','mvvm-drafts','allocation-budget'],
  objectives:['Keep the current state distinct from the undo and redo stacks.', 'Clear the abandoned future when a new edit follows Undo.', 'Bound retained snapshots and explain what is outside the history.'],
  predict:'Commit titles A, B, and C; undo once to B; then commit D. Predict whether C should remain redoable.',
  pitfall:'The example records a small string snapshot and does not undo external side effects. A real editor needs immutable/deeply owned document snapshots or reversible commands, grouping rules, stable IDs, and a separate persistence policy.',
  transfer:'Extend the history to a document record containing stable entity IDs. Group a pointer drag into one transaction, cap retained history by a measured memory policy, and test Undo/Redo around failed validation and a new edit after Undo. Specify what saving does to the dirty-state baseline.',
  references:['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record','https://learn.microsoft.com/en-us/dotnet/standard/collections/'],
  code:csharp(`var history = new TitleHistory("Untitled", capacity: 8);
var input = new TextBox { Header = "Draft title", Text = history.Current };
var commit = new Button { Content = "Commit title" };
var undo = new Button { Content = "Undo" };
var redo = new Button { Content = "Redo" };
var report = new TextBlock { TextWrapping = TextWrapping.Wrap };
void Refresh()
{
    undo.IsEnabled = history.CanUndo; redo.IsEnabled = history.CanRedo;
    report.Text = $"Current: {history.Current}; undo: {history.UndoCount}; redo: {history.RedoCount}";
}
commit.Click += (_, _) =>
{
    var title = input.Text.Trim();
    if (title.Length == 0) return;
    history.Commit(title); Refresh();
};
undo.Click += (_, _) => { history.Undo(); input.Text = history.Current; Refresh(); };
redo.Click += (_, _) => { history.Redo(); input.Text = history.Current; Refresh(); };
var panel = new StackPanel { Padding = new Thickness(24), Spacing = 12 };
panel.Children.Add(input); panel.Children.Add(commit); panel.Children.Add(undo); panel.Children.Add(redo); panel.Children.Add(report);
Refresh(); return panel;`, `
public sealed class TitleHistory
{
    private readonly int capacity;
    private readonly List<string> undo = new();
    private readonly List<string> redo = new();
    public string Current { get; private set; }
    public bool CanUndo => undo.Count != 0;
    public bool CanRedo => redo.Count != 0;
    public int UndoCount => undo.Count;
    public int RedoCount => redo.Count;
    public TitleHistory(string initial, int capacity)
    {
        if (capacity < 1) throw new ArgumentOutOfRangeException(nameof(capacity));
        Current = initial; this.capacity = capacity;
    }
    public void Commit(string next)
    {
        if (StringComparer.Ordinal.Equals(Current, next)) return;
        undo.Add(Current);
        if (undo.Count > capacity) undo.RemoveAt(0);
        Current = next;
        redo.Clear(); // a new edit abandons the old future
    }
    public void Undo()
    {
        if (!CanUndo) return;
        redo.Add(Current); Current = undo[^1]; undo.RemoveAt(undo.Count - 1);
    }
    public void Redo()
    {
        if (!CanRedo) return;
        undo.Add(Current); Current = redo[^1]; redo.RemoveAt(redo.Count - 1);
    }
}
`),
  edit:{from:'capacity: 8',to:'capacity: 3',label:'Limit the history to three retained undo snapshots and test the oldest boundary.',hint:'The capacity limits previous states, not the currently displayed state.'},
  question:{text:'After undoing C to B, a new commit creates D. What happens to C in a linear undo history?',options:['C remains the next redo state regardless of the new edit.','The old redo branch is discarded; D starts a new future from B.','The entire history must become empty.'],answer:1,explanation:'A linear history has one current branch. A new edit after Undo invalidates the abandoned redo future; keeping it would require an explicit branching-history design.'},
  sections:[
    {title:'Store state with clear ownership',explanation:'Undo requires a reliable description of a previous state. A string is immutable, so the sample can retain previous titles without a later edit mutating them. For a complex document, copying only the outer list while sharing mutable child objects is not a safe snapshot: old history entries can change behind your back. Choose deeply owned immutable snapshots, persistent structures, or reversible commands with well-defined preconditions. Keep domain identity stable so undoing a field edit does not accidentally create a different logical entity.',worked:'The history starts at Untitled. Committing A pushes Untitled to the undo list and makes A current. There is no need to create a UI control for either historical value; the history stores data, and the view projects Current.',prompt:'Why is a list of mutable object references not automatically a snapshot history?',answer:'Later mutations can modify objects still referenced by earlier entries. History must own stable state or a correct reversible operation, not merely another reference to live mutable data.'},
    {title:'Undo and redo move the boundary',explanation:'Think of history as a boundary between past, current, and future. Undo moves the current state into the future and restores the most recent past state. Redo performs the inverse movement. Buttons should reflect whether a transition exists; calling Undo at the oldest retained boundary should be a harmless no-op or an explicit unavailable result according to the API. Keep the model methods independent of controls so a unit test can exercise a sequence without launching the application.',worked:'After commits A, B, and C, current is C. Undo stores C in redo and restores B. Another Undo stores B and restores A. Redo then restores B because it is the nearest future state, not because of alphabetical order.',prompt:'What determines redo order?',answer:'The order in which states crossed the history boundary during Undo. It is stack order, not display order, timestamps, or entity sorting.'},
    {title:'A new edit invalidates the abandoned future',explanation:'After undoing, the user can either redo along the old future or make a different edit. In a linear history, committing that new edit clears the old redo stack. Otherwise Redo could replace the new work with a state that was based on a different branch. An advanced application may deliberately preserve a branching history, but that is a separate model requiring branch selection and ownership policies. The sample teaches a linear contract and makes the clear operation visible.',worked:'Commit A, B, C; Undo to B; commit D. The current state is D and the nearest undo state is B. C is no longer redoable. A commit whose value equals Current is ignored and does not discard redo because no new edit occurred.',prompt:'Why test an equal-value commit separately?',answer:'A no-op should not create redundant history or accidentally destroy a valid redo path. The equality policy is part of the history contract.'},
    {title:'Bound memory and separate history from persistence',explanation:'Retaining every snapshot forever is an unbounded memory policy. The example caps previous states by count; production document sizes may need a byte budget, periodic checkpoints, or command compaction. A long drag should generally be one semantic transaction rather than hundreds of history entries. Saving is also separate: a document can have an undo history and a saved baseline, and undoing back to that baseline can make it clean. Undo does not automatically reverse a sent email, a server mutation, or a file write; external effects need their own explicit compensating or transactional design.',worked:'With capacity three, make four distinct commits. The oldest previous title is no longer reachable, while the current state remains available. Now consider a Save button: it should record the accepted persistence baseline without pretending that the undo stack itself is durable storage.',prompt:'What should a test verify when a history limit is reached?',answer:'The current state remains correct, the most recent allowed past states remain reachable in order, the oldest states are evicted deliberately, and the redo contract still holds after Undo and a new commit.'}
  ]
})
];
for(const item of dataWorkspaces)item.practiceCases=practiceCases[item.id];
export default dataWorkspaces;
