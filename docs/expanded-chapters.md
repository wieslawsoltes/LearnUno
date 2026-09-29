# Source-connected guided chapters

## Scope

The 0.3 reading edition expands all sixty existing lessons and all 240 explanatory steps. It preserves lesson IDs, the original executable code, progress criteria, local notes, the twelve fundamentals guides, sixty unique atlas models and the repaired playback controller.

Each chapter adds an original practical scenario, three vocabulary definitions, four substantial guided steps, a worked explanation and a recall question for each step, two controlled practice variations, a source-comparison narrative and inline explanatory graphics. The original runnable starter is shown with source-preserving code coloring and a link to the real Uno playground. Existing project-only fragments keep their labels and requirements.

The additional authored text exceeds 43,000 words, counted from authored text values rather than code excerpts or JSON field names. The UI displays a reading estimate using 180 words per minute for this added text; this is an estimate, not a measured lesson duration or a promise about practice time.

## Primary-source evidence

`site/content/source-map.json` explicitly selects 131 documentation passages and 86 code excerpts from the pinned Uno repository. There are real SamplesApp and runtime-test excerpts alongside tutorial code. Their labels distinguish project samples, tests, documentation examples and the course's own runnable code. No upstream fragment is silently advertised as a complete standalone program.

The selections include full-file hashes for documents and excerpt hashes for code. `scripts/study-material.mjs` checks the actual checkout revision when Git metadata is available, validates paths and selected bytes, and emits exact 1-based source-line links. It normalizes code line endings to LF without modifying the code content. Each source card exposes the enclosing path, full-source SHA-256 and excerpt SHA-256.

The build retains original Apache-2.0 provenance. Upstream documentation can describe a different version or platform configuration than the deliberately pinned Uno runner. Each chapter explains that boundary and provides its own contextual comparison. For example, a sample using `GetCurrentPoint(null)` is compared with the starter's surface-relative coordinates, and a runtime layout test is not called a pure unit test.

A documentation passage is a contiguous excerpt, not a splice of unrelated assertions. Full imported documents and pinned repository links remain available. Unresolved DocFX references inside a short passage remain readable text rather than misleading links to a different SPA route.

## Content and delivery

Authored content is in `site/content/chapters/<lesson-id>.json`, separated from UI logic. The build emits one lazy `dist/study/<lesson-id>.json` per lesson and a small coverage/provenance index. The initial app bundle does not import the entire chapter collection, and reading does not require Monaco or the Uno runtime. The existing coloring worker handles code in the new reader.

A chapter includes an on-page outline implemented as focus-aware buttons, not fragment links that conflict with the SPA router. A controlled model comparison is selected only if it changes calculated model data or metrics. Four phase buttons explain the model without autoplay. Equivalent numerical results and explanatory text accompany the SVG, and mobile diagrams scroll inside their own region rather than widening the page.

The atlas provides a lazy “Read this step in depth” companion. It follows the current playback phase without resetting playback or repeatedly fetching data. Only a phase change redraws an open companion. A link opens the full chapter at the corresponding step. Navigation disposes listeners and prevents late results from writing into an obsolete view.

Reading, changing a diagram or revealing an answer does not mark the original code exercise or knowledge check complete. Existing drafts are not overwritten when opening the playground from a chapter. Errors loading material expose a retry and keep the original playground accessible.

## Verification

Node contracts check all sixty authored chapters, four distinct substantive steps per chapter, source-map completeness, exact excerpt hashes, source URL encoding, code-fence line ranges, escaped rendering and outcome-changing model comparisons. With the pinned checkout present, a strict build validates all excerpts and the generated coverage report. Production builds require the checkout and refuse incomplete evidence.

Browser tests verify chapter artifacts across all sixty lessons, representative reading routes across the curriculum, exact highlighted source text, outline/focus navigation, recall controls, inline comparison, source links, synchronized atlas phase reading, single-fetch behavior, retry, mobile overflow and dark mode. Existing Uno/Roslyn, atlas/playback, source-coloring and software-WebGPU tests continue to run.

The local environment used for authoring can execute Node tests and isolated component rendering, but browser navigation is restricted by administrator policy. Complete published-site navigation and screenshots are validated through the repository's normal GitHub Actions browser environment. Do not equate static rendering with a public-site pass; consult the workflow for the actual revision's result.

## Extending a chapter

Edit the chapter JSON as authored learning material, not mechanically expanded prose. Keep each step tied to the model's causal mechanism and a testable question. Select a suitable upstream excerpt and write a caption explaining what the reader should inspect and what context is omitted. Refresh hashes only after reviewing the new source; never weaken a failing provenance check to make a changed snapshot pass.

Use the strict build to confirm source paths and ranges, then inspect the reading experience at narrow and wide viewports. The content thresholds are regression guardrails, not a claim that word count or unique SVG geometry alone proves teaching quality.
