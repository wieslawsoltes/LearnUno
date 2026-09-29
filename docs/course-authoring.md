# Authoring course material

## Teach an observable contract

A lesson should let the learner predict a result, change one assumption, observe the consequence and explain why it happened. A paragraph naming an API is not a substitute for an experiment. Preserve counterexamples and target/version boundaries rather than hiding them behind a success badge.

The ten modules in `site/src/course` retain the existing sixty lesson IDs and runnable starter/solution pairs. The `L` helper records explanations, starter, focused edit, question, answer reasoning and source term. The `cs` and `xaml` helpers produce the supported single-document playground forms.

C# must return a real Uno `UIElement` from `Lesson.Build()`. Runtime XAML must include its namespace and remain compatible with `XamlReader`. Package-dependent APIs and generated x:Bind/x:Class/event code belong in labelled project-only material, not a purportedly runnable runtime-XAML sample.

JavaScript source strings that emit C# need the correct escaping. To emit a C# `\n`, the physical JavaScript string must contain `\\n`. CI compiles the resulting C#, not just the JavaScript module.

## Every lesson needs its own model

`atlas/catalog.mjs` now has explicit one-to-one assignments. Adding a lesson without authoring its visual model is an error. Do not route an unrelated concept to a generic pipeline merely to populate the Visualize tab.

The established eleven models live in the core scene/model modules. Additional models are grouped by path under `atlas/lessons`. The `D` helper describes an authored model:

```js
D(
  lessonId, title, category,
  controls,              // R: numeric range; S: selection; B: toggle; T: text
  fourExplanationSteps, // [title, causal explanation] pairs
  challenge,
  mechanism,
  counterexample,
  explicitScope,
  state => result(svg, metrics, code, readout, data, phaseBounds, language)
);
```

`run` must be pure. Inputs must affect calculated data and an inspectable result—not just change a caption. Share drawing primitives for visual consistency, but author geometry appropriate to the concept: a reference graph, distribution, ownership map, lookup path, scope tree, raster difference or another relevant representation.

The scene uses an 800×400 coordinate space. Keep text and geometry inside it, provide matching phase bounds, and test extreme control values. Use escaped text helpers rather than interpolating arbitrary learner text into SVG markup. Pair important visual results with numerical/text readouts. Inputs have keyboard-operable controls even when direct manipulation is also offered.

Scope statements must name assumptions. An HTTP fixture is not a network request; an assumed latency is not a measured benchmark; a namescope model is not the entire XAML generator. Link the model to the corresponding real Uno exercise and pinned source material.

## Reading depth and fundamentals

New models supply the mechanism, counterexample, phases and challenge used by the deeper reading section in `learning/views.mjs`. Existing core models have explicit corresponding reading material. Avoid redundant restatements of the initial lesson: explain the ownership, data flow, invariants or failure boundary underneath it.

A chapter in `learning/guides.mjs` has three developed sections, a labelled code fragment, recall question and explanation, transfer exercise, connected lesson and primary-reference link. Fragments may need supporting context and are labelled accordingly; do not count them as new runnable applications. The chapter scratchpad is transient. Use the regular lesson-notes workflow for saved learner work.

## Code grammar metadata

Use `<code data-language="csharp">` or the correct canonical grammar name for HTML examples. Reference Markdown fences retain their language token. Generated model code should return its language alongside the source. The default inference handles common forms but explicit authoring is preferable.

The worker supports C#, XML/XAML, JavaScript, TypeScript, JSON, CSS, Bash, PowerShell, YAML, diff, INI, SQL, Markdown, Python, C++, F#, HTTP, Dockerfile, plaintext and WGSL. Unknown languages are escaped plaintext. The coloring adapter covers dynamically inserted code and dialogs; do not put a separate highlighter inside a model or mutate Monaco's owned DOM.

## Playback and input ownership

Use the shared playback controller rather than adding a second clock. Manual changes pause automatic playback before editing state. Phases highlight the appropriate model region without overwriting unrelated inputs. Continuous time-based experiments must synchronize inspector values and timeline position explicitly. Never present teaching durations as framework timings.

## Verification before publication

Run `npm test`, the static build and browser tests. The suite checks each assignment, calculation contracts, changed-input effects, all lesson routes, guide chapters, grammar output, hostile text, mobile overflow, keyboard behavior and the preserved Uno/Roslyn runtime. A new input should be checked at its bounds; a new fragment needs correct language metadata and review for source validity.

Inspect screenshots, not only test status. Verify code color in both themes, text fit in diagram cards, meaningful phase highlights and narrow-screen controls. Keep deterministic service fixtures and exact expected outcomes. The source snapshot, package versions, licenses and docs must match the implementation being shipped.
