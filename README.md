<p align="center"><img src="site/favicon.svg" width="64" height="64" alt="LearnUno" /></p>
<h1 align="center">LearnUno</h1>
<p align="center"><strong>Build once. Understand every layer.</strong><br />A source-connected, interactive learning studio for Uno Platform.</p>
<p align="center"><a href="https://wieslawsoltes.github.io/LearnUno/">Course</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/app-building">Build applications</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/atlas">Visual atlas</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/design-labs">UI design labs</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/feature-map">Source coverage</a></p>

[![Build, validate and publish](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml/badge.svg)](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml)

## Learn the mechanism, not just the name

**90 core lessons · 15 paths · 360 expanded core steps · 90 lesson-specific atlas experiments · 18 fundamentals chapters**

**Plus 6 data-workspace workshops and 12 UI design/control lessons: 108 runnable learning units, 432 guided steps and 216 authored starter/solution variants overall.**

Predict a result, change an assumption, inspect the outcome, and test it in a **real Uno WebAssembly application**. Two independent capstones connect the ideas to an application and a framework-quality contribution. LearnUno is independent of Uno Platform and Microsoft; it is not an official course or certification.

## App-building edition

Thirty additional core lessons provide five paths: **C# for app builders**, **Everyday Uno controls**, **MVVM patterns in practice**, **Navigation and user flows**, and **DI and service composition**. The task-oriented roadmap connects these into dependable forms, searchable workspaces, guarded document flows and testable service graphs. Prerequisites are recommendations, not locks.

MVVM exercises use actual **CommunityToolkit.Mvvm 8.4.0** classes. Composition exercises use **Microsoft.Extensions.DependencyInjection 10.0.12** and **Microsoft.Extensions.Options 10.0.12**. Minimal lesson exports include required packages. Generator alternatives remain project-only; runtime examples use explicit properties and commands. The isolated host disables optional Hot Design tooling with the supported UnoDisableHotDesign property instead of suppressing a dependency downgrade. See [runtime package boundaries](docs/runtime-package-boundaries.md).

All core lessons have source-connected chapters, four guided steps, two practice variations, a knowledge check and a distinct calculated model. Their chapter build contains **65,258 authored words**, **191 documentation-passage placements** and **117 code-excerpt placements**. These are placements, not unique source-file counts; word count is not a measure of teaching quality. Stable lesson IDs and progress semantics are retained.

## Workshops and design practice

The **six data-workspace workshops** teach converters, paging with identity, accepted content versus request status, optimistic concurrency, collection notifications and bounded undo/redo. Each includes four developed steps, controlled practice, a distinct interactive model and real C# starter/solution code. Workshops have separate drafts and do not silently award core lesson completion.

The **twelve UI design/control lessons** begin with bounded scrolling, choice semantics, command surfaces, status with content, keyboard-first forms, adaptive details, image presentation, and theme/density. Four source-backed additions cover:

| Control lesson | Contract to investigate |
| --- | --- |
| UserControl composition | Preserve the host DataContext; give private bindings explicit sources; verify two independent instances. |
| Rich-text reading | Paragraph structure, Run emphasis, meaningful Hyperlink names, wrapping and actual activation. |
| GridView identity | Distinguish selection from activation and reconcile by stable key after reordering. |
| NumberBox boundaries | Keep editing values separate from accepted quantities; reject missing and fractional input without losing accepted state. |

Inspect responsive HTML mockups, compare text scale and density, review concrete design tips, and switch to the actual Uno exercise. Mockups are explicitly labelled as HTML—not advertised as the Uno renderer. Their theme is independent of the surrounding course, with regression checks for readable contrast.

**Rich-text version boundary:** the installed Uno 6.7.135 NativeRenderer declares RichTextBlock unimplemented. The live exercise explicitly uses real **TextBlock.Inlines** for each paragraph, including a working Hyperlink. The complete RichTextBlock example is retained separately as project-only, together with the pinned SamplesApp excerpt. Successful construction is not proof of rendered content. See [the runner boundary and regression tests](docs/richtext-runner-boundary.md).

The **eighteen fundamentals chapters** include value/reference identity, nullable contracts, closures, generic constraints, async outcomes, namescopes, layout units, binding contexts, properties and ownership. Six additions explain item-versus-collection notifications, focus versus selection, culture and typed values, command invalidation, resource/style/template boundaries and asynchronous readiness. Each new guide has two inspectable scenarios with accessible comparison tables. Guide snippets remain labelled fragments, not eighteen extra complete apps. See [application fundamentals](docs/application-fundamentals.md).

## A source-connected course

The reader combines a practical problem, vocabulary, four detailed steps with worked reasoning and recall questions, inline diagrams, runnable code, pinned Uno evidence and transfer work. A focus-aware outline keeps long chapters navigable. The atlas reading companion follows playback and links to the corresponding chapter step.

SamplesApp fragments and runtime tests are distinguished from tutorial excerpts and runnable exercises. Source cards include exact paths, line links and integrity hashes; strict builds reject missing or changed evidence. The four common-control source cards have additional whole-file and excerpt hash verification. Chapters load independently, so reading does not load the full text collection, Monaco or the .NET runtime at startup.

The reference library contains **420 Markdown documents** and **19,024 source/sample/test paths** from the pinned repository. External DocFX repositories are not silently copied. A generated feature map surveys **559 public types** and **1,542 sample XAML files**, connects relevant lessons and exposes reference-only gaps. These lexical counts describe the snapshot, not popularity or implementation parity. See [source priorities and limitations](docs/source-priorities.md).

## Curriculum

| Path | Level | Main subjects |
| --- | --- | --- |
| First principles | Beginner | Uno, C#, projects, XAML, events, debugging |
| Layout and visual language | Beginner | Panels, Grid, spacing, resources, templates, responsiveness |
| Data, binding and state | Intermediate | Notifications, editing, x:Bind boundaries, collections, commands |
| Application architecture | Intermediate | MVVM, MVUX concepts, injection, navigation, cancellation, serialization |
| Connected applications | Intermediate | HTTP, configuration, culture, authentication boundaries, logging |
| Crafting custom UI | Advanced | Properties, templates, input, accessibility, animation, geometry |
| Performance engineering | Advanced | Layout, virtualization, caches, dispatch, profiling, delivery |
| Every platform, deliberately | Advanced | Target evidence, renderers, interop, assets, lifecycle |
| Quality and production | Advanced | Tests, resilience, delivery gates, application capstone |
| Framework internals | Expert | Source investigation, generated XAML, panels, damage, contribution |
| C# for app builders | Beginner | Contracts, identity, LINQ, failures, debounce, subscription ownership |
| Everyday Uno controls | Beginner | TextBox, ComboBox, ListView, NavigationView, ContentDialog, AutoSuggestBox |
| MVVM patterns in practice | Intermediate | ObservableObject, commands, validation, messaging, edit transactions |
| Navigation and user flows | Intermediate | Parameters, history, route contracts, deep links, guards, results |
| DI and service composition | Advanced | Composition roots, scopes, captive dependencies, factories, decorators, options |

## Tools for understanding

**One core lesson, one visual experiment.** Ninety explicit atlas assignments have independent models, controls and calculations. Tests guard against duplicated geometry disguised by different captions. Scope statements distinguish teaching models from instrumented framework traces.

**Controlled playback.** One seekable clock owns previous/next, pause/resume, replay, speed and optional looping. Manual edits take ownership from animation. Hidden/offscreen views and reduced-motion preferences are respected.

**Meaningful GPU work.** The dirty-tile lab performs WebGPU compute and rendering, then compares every output with a CPU reference. Readback is a validation aid, not a proposed production frame loop. SVG and text preserve the explanation without a GPU.

**Code coloring throughout.** A locally bundled worker supports 26 modes, including explicit plaintext, without loading Monaco. It colors static/dynamic snippets, source excerpts, solutions and reference fences while preserving exact text. Grammar coloring is lexical, not semantic analysis.

**Real Uno and Roslyn.** Desktop Monaco connects to in-browser Roslyn for completion, diagnostics, hover, local definitions, signatures and formatting. XAML suggestions use reflected Uno metadata. Narrow screens use a text-editor fallback with the same execution engine. The preview is Uno NativeRenderer/WebAssembly, not a reimplementation in HTML.

## Build and validate

Requires Node.js 22+, .NET SDK **10.0.401**, the WebAssembly workload, **Uno.Sdk 6.7.30** and **Roslyn 5.9.0**. Versions are pinned in source.

```sh
git clone https://github.com/wieslawsoltes/LearnUno.git
cd LearnUno
npm ci
dotnet workload install wasm-tools

git clone --filter=blob:none --no-checkout https://github.com/unoplatform/uno.git .sources/uno
git -C .sources/uno sparse-checkout init --cone
git -C .sources/uno sparse-checkout set doc src
git -C .sources/uno checkout e1292e0d87f9d38c9f3a120c69f0200b3c0999c1

dotnet publish runtime/LearnUnoRunner.csproj -f net10.0-browserwasm -c Release -o artifacts/runtime
npm run build
npm run dev
```

Open `http://localhost:4173`. Fragment routes and relative assets support `/LearnUno/` hosting. Interface-only builds can omit the runtime/source checkout; unavailable parts are not fabricated. Production sets `REQUIRE_RUNTIME=1` and `REQUIRE_SOURCES=1` and refuses incomplete output.

```sh
npm test
npx playwright install chromium
npm run test:browser
```

The pipeline compiles all **182 runnable C# variants** against the host's actual references and executes all **216 authored variants**, including XAML. Separate behavior tests verify interactions rather than equating a rendered root with working children. Node checks cover models, content, provenance, coloring, storage, transport and imports. Browser checks cover mobile, themes, keyboard focus, reader steps, mockups and real runtime interactions. Software-WebGPU tests establish shader/API execution and reference parity, not physical-device performance.

The same tested artifact is deployed and then checked at the public URL. The workflow result and `build.json` identify the revision; a source branch or a locally passing model test is not a completed deployment.

## Execution boundaries

The sandbox compiles one C# document containing `Lesson.Build()`, or parses runtime XAML through XamlReader. It does not install arbitrary NuGet packages, compile multi-project applications, run project generators, or generate compiled x:Bind/x:Class/event-handler glue. Project-only examples and imported fragments retain their labels and are excluded from runnable-example counts.

The opaque-origin preview has bounded ephemeral settings but no hard CPU/memory quota. A non-returning loop can stall a tab; run only trusted code. Progress, notes and drafts are browser-local rather than encrypted account storage. Diagram or mockup behavior does not certify every native target, control API or IDE feature. See [security](docs/security.md), [playback](docs/atlas-playback.md), [common controls](docs/common-controls.md) and [graphics validation](docs/graphics-validation.md).

## Project structure and provenance

```text
site/content/chapters/        Original source-connected core reading
site/content/source-map.json Reviewed core documentation/code selections
site/content/control-study.json  Common-control source evidence
site/src/course/              Core runnable lessons and paths
site/src/learning/            Reader, fundamentals, data and UI-design workshops
site/src/atlas/               Lesson models, playback and GPU comparison
site/src/coloring/            Grammar engine, worker and DOM adapter
runtime/                     Real Uno application and Roslyn bridge
scripts/                     Builds, pinned-source import and feature survey
tests/                       Content, model, compiler, security and browser checks
docs/                        Authoring, architecture and operational boundaries
```

`sources.lock.json` pins upstream material; `study/index.json` records chapter coverage. The reference snapshot and installed runner can describe different versions, so confirm behavior against the selected target. Original code and prose are MIT-licensed. Imported Uno material retains Apache-2.0 provenance and source links. Names identify compatible technologies, not endorsement. See [third-party notices](THIRD_PARTY_NOTICES.md) and the [authoring guide](docs/course-authoring.md).
