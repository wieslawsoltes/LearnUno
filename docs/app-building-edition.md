# App-building edition — implementation and validation

## Status and base

This is the locally prepared 0.4.0 source candidate, based on remote commit
`f7e50a30a9c4bd0c18ca3dcf826c3ec497142380`. The authoring session could read GitHub
but had no write or PR action and no authenticated CLI. It did **not** push,
create a PR, run new GitHub Actions checks, or deploy this candidate.

The local work expands the site from 60 to 90 lessons, 10 to 15 paths, 240 to
360 guided steps, and 60 to 90 explicit visual assignments. The previous sixty
runnable starters and solutions are preserved byte-for-byte; a baseline fixture
checks that property. Existing notes and completion entries retain their IDs.
Reading a new chapter does not bypass the code/quiz completion criteria.

## New curriculum

Each new path has six lessons. Path numbering appends to the existing curriculum,
while prerequisites point to the relevant foundations rather than making a new
beginner lesson depend on the final expert path.

### C# for app builders

| Lesson ID | Mechanism and practice |
| --- | --- |
| `input-contracts` | Distinguish parse success from a valid domain value; test empty, invalid, overflow and out-of-range inputs. |
| `record-identity` | Separate record-value equality from stable entity identity; preserve IDs through edits. |
| `linq-projections` | Inspect deferred enumeration versus a materialized snapshot and account for later collection changes. |
| `task-failure` | Catch expected asynchronous failures, restore availability in finally, and verify a second attempt. |
| `debounced-input` | Cancel obsolete quiet intervals, apply generation checks, and own cancellation sources through cleanup. |
| `subscription-lifetimes` | Retain and dispose the exact subscription token; examine publisher-to-recipient reachability. |

### Everyday Uno controls

| Lesson ID | Actual control behavior |
| --- | --- |
| `textbox-editing` | TextBox Header, MaxLength, draft text, live character feedback and a separate commit rule. |
| `combobox-keys` | ComboBox DisplayMemberPath and SelectedValuePath; stable selected keys rather than persisted indexes. |
| `listview-selection` | ListView selection modes, SelectedItems and conversion to a stable domain-key set. |
| `navigationview-shell` | NavigationView modes and tagged item invocation; shell selection is not a navigation journal. |
| `dialog-decisions` | ContentDialog XamlRoot, awaited result and explicit consent; dismissing is not accepting. |
| `autosuggest-search` | AutoSuggestBox UserInput filtering, suggestion items and explicit QuerySubmitted intent. |

### MVVM patterns in practice

The runnable samples reference real **CommunityToolkit.Mvvm**, not replacement
classes with similar names. Explicit code works without running a source generator
inside the playground. Where useful, a separate complete generated model class
shows the project-build alternative.

| Lesson ID | Library / design contract |
| --- | --- |
| `toolkit-observable` | ObservableObject, equality-aware SetProperty and derived-property notifications. |
| `toolkit-commands` | Stable RelayCommand instances, CanExecute and NotifyCanExecuteChanged. |
| `toolkit-async-command` | AsyncRelayCommand, cancellation tokens, running state and cooperative cancellation. |
| `toolkit-validation` | ObservableValidator, data annotations, initial validation, ErrorsChanged and GetErrors. |
| `toolkit-messaging` | A scoped local WeakReferenceMessenger, typed payloads, static callbacks and explicit deactivation. |
| `mvvm-drafts` | Baseline and draft state, validation, commit/cancel commands, normalization and dirty-state ownership. |

### Navigation and user flows

| Lesson ID | Navigation contract |
| --- | --- |
| `frame-parameters` | A typed record passed by Frame.Navigate and checked by OnNavigatedTo. |
| `frame-history` | BackStack, CanGoBack, Navigated and guarded GoBack behavior. |
| `route-registry` | A deliberately small allowlisted route-to-page registry; compare with actual Uno.Extensions route registration. |
| `deep-link-contracts` | An allowed URI scheme/host, positive invariant-culture integer data, and rejection of unexpected query/fragment data. |
| `navigation-guards` | Await a local unsaved-edit decision before the example's navigation; cancellation preserves the editor. |
| `navigation-results` | Request-local TaskCompletionSource, explicit accepted/cancelled results, one terminal completion and unload cleanup. |

The route registry and result picker are not advertised as implementations of
Uno.Extensions.Navigation. Upstream excerpts and official references explain the
larger route/region integration. Deep-link validation is not OS activation or
server authorization, and the local guard is not a global navigation interceptor.

### DI and service composition

These examples use **Microsoft.Extensions.DependencyInjection** and **Options**.

| Lesson ID | Ownership / composition contract |
| --- | --- |
| `composition-root` | Register capabilities and consumers centrally; validate construction, then resolve through a typed boundary. |
| `scope-ownership` | Create explicit document/session scopes, observe instance identity, and verify disposal at the owning boundary. |
| `captive-dependencies` | Deliberately reject a singleton capturing scoped state, then correct its registration. |
| `service-factories` | ActivatorUtilities combines registered services and a runtime argument; product ownership remains explicit. |
| `service-decorators` | Register the inner concrete service separately from the decorated interface and count underlying reads. |
| `options-validation` | Configure a typed setting, validate on IOptions.Value access, and distinguish that from Generic Host startup. |

The examples do not construct a full application host, pretend that validation
solves all manual lifetime mistakes, or present a demonstration cache as production
infrastructure. The chapter explains the omitted reload, concurrency, authorization
or durability policy where it matters.

## Learning material and source evidence

Each new lesson includes a practical problem, three vocabulary terms, four detailed
steps, a worked situation and retrieval question per step, two practice variations,
a complete single-document C# starter and solution, and a source-comparison narrative.
The new reader avoids duplicating the same explanation both as a concept introduction
and as the first three full steps.

The strict build emits 90 lazy chapter JSON files and verifies 191 documentation
placements and 117 code excerpts against the existing pinned Uno revision:
`e1292e0d87f9d38c9f3a120c69f0200b3c0999c1`. There are 60 new documentation placements
and 31 new code placements. These are placements, not counts of unique files.
The complete authored-text count is 65,258; it excludes the imported excerpt bodies.

Original tutorial, SamplesApp and test excerpts retain file paths, hashes, line
ranges, provenance and omitted-context labels. New primary links to official
Microsoft and Uno documentation complement that fixed snapshot. They are explicitly
current external references, not falsely labelled as pinned source. Reader links
accept only approved HTTPS hosts.

Examples of primary contracts reviewed:

- ObservableObject: https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/observableobject
- RelayCommand: https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/relaycommand
- AsyncRelayCommand: https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/asyncrelaycommand
- ObservableValidator: https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/observablevalidator
- Messenger: https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/messenger
- DI ownership: https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines
- Options: https://learn.microsoft.com/en-us/dotnet/core/extensions/options
- Uno routes: https://platform.uno/docs/articles/external/uno.extensions/doc/Learn/Navigation/HowTo-DefineRoutes.html

The package references are pinned to CommunityToolkit.Mvvm 8.4.2,
Microsoft.Extensions.DependencyInjection 10.0.12 and Microsoft.Extensions.Options
10.0.12. `runtime-dependencies.mjs` validates per-lesson declarations and generates
matching project exports. Arbitrary package names or version changes are rejected;
the playground is still not a NuGet installation service.

## Visual experiments and reader integration

Thirty additional pure calculations and thirty separately composed SVG scenes live
under `site/src/atlas/app-building`. Their forms include decision paths, record-field
comparisons, enumeration snapshots, subscription graphs, keyed selection maps,
command predicates, validation results, navigation journals, typed requests, scope
identity tables and configuration gates. Shared primitives provide typography and
interaction consistency without reducing different lessons to renamed diagrams.

Input changes affect actual model results. The existing geometry-diversity regression
check still passes with ninety distinct default scenes after captions/identifiers
are removed. This check and word-count thresholds are safeguards, not proof of
educational quality. Diagram scopes identify their simplified semantics.

A component test caught a `status` input colliding with common atlas state. The
input is now `statusPanel`; tests reserve shared keys and reject nonfinite calculated
results. Edit transactions also recalculate command availability after a successful
commit or rollback rather than leaving an already-clean draft marked actionable.

The new roadmap at `#/app-building` offers four practical entry goals and five
paths. Thirteen existing chapters now cross-link into related new application
lessons. The reading view, existing phase controller and lazy step companion remain
connected. The side navigation can scroll its longer path list independently.

## Validation completed locally

- **585 Node checks passed**, zero failures or skips, including source hashes,
  curriculum/prerequisite contracts, original-code preservation, visual calculations,
  source safety, package/export consistency and ninety-scene diversity.
- A strict-source static build passed and produced the counts above. It explicitly
  reports `runtime: false` in this authoring environment.
- **62 isolated local-document component checks passed**, including all thirty new
  chapters and atlas components, phase reading, meaningful comparisons, code-text
  preservation, outline focus, recall controls, narrow layout and dark theme.
- **188 Playwright tests are discovered**. Discovery is not execution. The added
  suite contains real control/Toolkit/Frame/DI behavior assertions for a full runtime.

The environment has no .NET SDK and its administrator policy blocks browser
navigation. Component checks use an explicit fixture transport and `page.setContent`
on the initial blank document, not a deployed server. They do not run the .NET host,
exercise the code-coloring worker transport, or validate GitHub Pages.

## Required release checks

Before publication, restore and rebuild the actual runner with the new package
references. Do not substitute the old deployed runtime: it lacks the newly requested
package contract. The existing CI cache key includes the csproj, so these edits
invalidate that cached runtime.

Then run the existing compiler suite against the new runner metadata (146 authored
C# variants), execute all 180 starter/solution variants, run the full 188-test browser
suite, inspect screenshots and error evidence, and only then merge/deploy. Public
verification must use the new artifact and retain its explicit exhaustive-test skips.
No claim is made here that those new compiler, browser or public checks passed.

## Reproducing the available checks

```sh
npm ci
npm test
REQUIRE_SOURCES=1 npm run build
npx playwright test --list
# Uses explicit local fixtures; not a substitute for the actual browser suite:
CHROMIUM_EXECUTABLE=/path/to/chromium node tests/component/app-building.mjs
```

For full validation use the repository's existing CI workflow or rebuild locally
with the pinned .NET/Uno toolchain, then run `npm run test:browser`. Original security,
sandbox, source-provenance and deployment gates remain in place.
