# Fluent input, reading and focus refinement

## Base and preservation

This follow-up is based on PR #7 commit `f14d99394773094ea16dcdb7f2ee9040b8d834de` (branch `design/fluent-learning-shell`). The branch advanced during the review; its newer keyboard adapter, explicit tab stop, genuine Tab-navigation regression and learner-facing Run driver were retained. No alternate keyboard implementation was substituted.

All 216 authored runnable starter/solution variants are byte-identical to that commit. Course IDs, progress, bookmarks, notes, source excerpts, dependencies, sandbox permissions and runtime configuration are unchanged. The one-time `finalize-fluent-input.yml` source-transfer workflow is removed; release build, compiler, browser and deployment gates are not modified.

## Fixes

### Focus follows pane ownership

The mobile Code/Preview controller moves focus to the visible selector before hiding or making a focused pane inert. An external Run button keeps focus. Desktop focus is remembered on `focusin` and iframe focus handoff before a media query can hide a pane; shrinking the window then keeps the active editor or preview visible. This avoids relying on a media-query callback that can arrive after focus has already fallen back to the document body.

Switching panes does not remove or recreate the editor or iframe. Disposal is idempotent, removes listeners, releases inert state and ignores late callbacks.

### Editing stays discoverable

A compiler rejection shows the Code pane with diagnostics. A successful run shows Preview. Revealing an editor hint or explicitly choosing a worked solution reveals Code without silently replacing saved drafts. The lower-level request protocol remains a transport API, not a UI tab-selection API.

### Search keeps a programmatic name

The search button has an explicit accessible name and keyboard-shortcut title. On narrow screens its visual label may be hidden, but the remaining icon button stays named and keyboard-operable. Closing the dialog returns focus to the trigger.

### Reading position uses resolved layout

Chapter tracking reads the section's computed `scroll-margin-top`, rather than parsing an unevaluated custom-property expression such as `calc(100px + 80px)`. This aligns the current-section indication with the actual sticky-header offset. Reading position remains separate from lesson completion.

### Tests cannot reuse an old successful run

The shared browser driver enters code through the existing editor API, invokes the real Run button, waits for the Run label to return and the button to become enabled, then requires successful output and a visible Preview pane. An old success message cannot satisfy a later operation while it is still running. Existing rich-text keyboard/content checks are retained.

## Verification boundaries

`presentation-components.spec.mjs` exercises real DOM, focus, media queries, inert state and authored CSS in in-memory Chromium fixtures. It covers pane focus handoff, desktop-to-mobile resize, no remounting, disposal, source handoff, resolved chapter offsets and coarse-pointer drawer targets. These are component checks, not full-site navigation or actual .NET execution.

Additional full-application tests cover named mobile search at 320/390 pixels and the failing-code → corrected-code journey while retaining the same Uno frame. Existing coarse-pointer portrait/landscape and responsive route checks remain in place.

Local Node tests and the strict source/provenance build are separate from the full browser and Uno suites. This environment blocks browser page navigation and has no .NET SDK, so those suites must run through the existing repository pipeline before merge. At the inspected remote head, GitHub reports `action_required` for the validation workflows and returns no jobs; that is not a passing or executed test result.

## Material scope

The Fluent shell remains restrained: solid reading and code surfaces, a tinted base, static low-opacity hero accents, and acrylic for transient navigation/dialog layers. The CSS treatment does not sample native OS wallpaper and is not the Windows Mica compositor API. Solid-material, reduced-motion, reduced-transparency and high-contrast fallbacks remain intact.
