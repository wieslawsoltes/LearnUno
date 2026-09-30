# Data-workspace learning refinement

Six additional workshops develop converter contracts, page loading, loading/error/content states, optimistic commits, collection notification strategies, and bounded undo/redo. Each has four substantive explanations, worked situations, recall questions with reasoning, a real-Uno C# starter/solution, a distinct calculated SVG model, and primary API links.

The package is additive. It deliberately does not claim that the six workshops are already part of the core lesson/progress registry. The existing 90-lesson candidate remains intact; workshop drafts are stored separately. The new route is `#/workshops` after integration. It provides reading, interactive experiments, the existing real Uno/Roslyn playground, and recall/transfer sections.

## Files and integration

`data-workspaces/lessons.mjs` contains authored material and twelve C# variants. `models.mjs` contains pure, bounded calculations. `scenes.mjs` renders six different diagram structures. `app.mjs` composes the reading experience and reuses `mountWorkspace`. CSS is scoped to the new views. Tests exercise calculation boundaries, source escaping, geometry uniqueness, and history behavior.

Apply to a full checkout or the reconstructed app-building candidate:

```sh
python3 integrate.py /path/to/LearnUno
cd /path/to/LearnUno
npm test
REQUIRE_SOURCES=1 REQUIRE_RUNTIME=1 npm run build
npm run test:browser
```

The integration validates all source anchors before editing. It does not automatically approve package restore, C# compilation, browser execution, or deployment. Check those results before merging. Do not describe isolated SVG rendering as real Uno execution.

## Teaching and implementation boundaries

The converter model explains source preservation and culture; it is not a persistence operation. Paging uses a deterministic manual page fixture, not a fabricated ISupportIncrementalLoading implementation. Request phase and accepted content remain distinct. The versioned store illustrates compare-and-update; a server must enforce that condition atomically. Collection event counts are not performance measurements, and custom ResetCollection is not a claimed built-in AddRange API. History stores immutable strings; external side effects and deep-document ownership require separate designs.

The controls have labelled keyboard alternatives, text readouts, source-preserving code blocks, bounded inputs, and explicit reset. Models do not start timers or mutate code while a learner is editing. A new history commit clears an abandoned redo future, while an equal-value no-op preserves it. The reader outline moves focus without hijacking the SPA fragment route.

All screenshots from this package, if generated, must be labelled as local previews until public-site verification has passed. Existing primary-documentation links identify API contracts; they do not guarantee identical behavior on every Uno target.

## Source transfer status

The GitHub transport attempts did not provide an inspectable commit or deployment acknowledgement for this refinement. The prepared recovery workflow reconstructs only the earlier reviewed 84-file app-building patch from its exact Git blob hashes, verifies both archive and patch SHA-256, requires a clean apply, runs Node checks, and dispatches the full runtime validation workflow. It does not merge or deploy the feature branch. Remove temporary recovery scaffolding before merging.

The six data-workspace workshops are a separate, additive source integration in this pack. They must be committed and tested as well; recovering the earlier patch alone does not install these workshops.
