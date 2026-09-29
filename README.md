<p align="center"><img src="site/favicon.svg" width="64" height="64" alt="LearnUno" /></p>
<h1 align="center">LearnUno</h1>
<p align="center"><strong>Build once. Understand every layer.</strong><br />An interactive, source-connected learning studio for Uno Platform.</p>
<p align="center"><a href="https://wieslawsoltes.github.io/LearnUno/">Course</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/atlas">Visual atlas</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/fundamentals">Fundamentals</a> · <a href="docs/expanded-chapters.md">Guided chapters</a> · <a href="docs/architecture.md">Architecture</a></p>

[![Build, validate and publish](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml/badge.svg)](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml)

## Learn the mechanism, not just the name

**90 guided lessons · 360 expanded explanation steps · 90 lesson-specific visual experiments · 12 fundamentals chapters · 180 authored starter/solution variants**

Predict a result, change an assumption, inspect the outcome, and test it in a **real Uno WebAssembly application**. The two capstones apply those ideas to an application and a framework-quality contribution. LearnUno is independent of Uno Platform and Microsoft; it is not an official course or certification.

## App-building edition (0.4 candidate)

Thirty new lessons add five paths: **C# for app builders**, **Everyday Uno controls**, **MVVM patterns in practice**, **Navigation and user flows**, and **DI and service composition**. A task-oriented `#/app-building` roadmap connects the lessons into dependable forms, searchable workspaces, guarded document flows and testable service graphs. Prerequisites are explicit recommendations, not locks.

The MVVM examples use actual CommunityToolkit.Mvvm classes, and the composition examples use Microsoft.Extensions.DependencyInjection and Options. The runner project now references **CommunityToolkit.Mvvm 8.4.0**, **Microsoft.Extensions.DependencyInjection 10.0.12** and **Microsoft.Extensions.Options 10.0.12**. Individual project exports include the same declared dependencies. Generator alternatives remain project-only; the runtime examples use explicit properties and commands.

All thirty lessons have substantial source-connected chapters, four guided steps, two practice variations, a knowledge check and a distinct calculated visual model. The complete chapter build contains **65,258 authored words**, **191 documentation-passage placements**, and **117 code-excerpt placements**. These counts describe placements and authored-text fields, not unique files or evidence that word count alone proves teaching quality. Original lesson IDs, code, solutions and progress semantics are preserved.

**Validation status:** the local source/model suite and strict source build pass; isolated component checks pass. The added .NET dependencies and C# examples still require package restore, compiler and real Uno/WebAssembly execution in the full CI environment. This source candidate has not been pushed or deployed by the authoring session. See [the app-building implementation and verification guide](docs/app-building-edition.md).

## Introduced in 0.3: source-connected reading

Every lesson now has a substantial guided chapter: a practical problem, vocabulary, four detailed steps with worked reasoning and recall questions, a phase-selectable inline infographic, the original runnable code, pinned Uno evidence, controlled practice variations and transfer work. An on-page outline keeps the longer material navigable. The atlas's optional reading companion follows its current step and links back to that position in the chapter.

The expansion adds **over 43,000 words of original learning material**, **131 documentation passages** and **86 code excerpts** from the pinned Uno repository. Actual SamplesApp code and runtime tests are distinguished from tutorial fragments and the course's runnable examples. Every excerpt has an exact source-line link and integrity hashes; project and version boundaries remain explicit.

Chapters load independently, so the entire text corpus does not enter the initial JavaScript bundle. Reading does not start Monaco or Uno. Existing IDs, notes, bookmarks, drafts and completion criteria are preserved. See [chapter architecture, provenance and authoring](docs/expanded-chapters.md).

## Curriculum

| Path | Level | Topics |
| --- | --- | --- |
| First principles | Beginner | Uno mental model, C#, project structure, XAML, events, debugging |
| Layout & visual language | Beginner | Panels, Grid sizing, spacing, resources, templates, responsive layouts |
| Data, binding & state | Intermediate | Binding direction, notifications, editing, x:Bind, collections, commands |
| Application architecture | Intermediate | MVVM, MVUX concepts, injection, navigation, cancellation, serialization |
| Connected applications | Intermediate | HTTP, configuration, localization, authentication, logging, package choices |
| Crafting custom UI | Advanced | Dependency properties, templates, pointer coordinates, accessibility, animation, geometry |
| Performance engineering | Advanced | Layout invalidation, virtualization, caching, dispatch, profiling, browser delivery |
| Every platform, deliberately | Advanced | Target evidence, renderers, interop, ownership, assets, lifecycle |
| Quality & production | Advanced | Unit/UI/visual tests, resilience, delivery gates, task-workspace capstone |
| Framework internals | Expert | Source investigation, XAML generation, precedence, custom panels, damage, contribution capstone |
| C# for app builders | Beginner | Input contracts, record identity, deferred LINQ, task failures, debounce and subscription ownership |
| Everyday Uno controls | Beginner | TextBox, keyed ComboBox, ListView selection, NavigationView, ContentDialog and AutoSuggestBox |
| MVVM patterns in practice | Intermediate | ObservableObject, RelayCommand, AsyncRelayCommand, ObservableValidator, messaging and edit transactions |
| Navigation and user flows | Intermediate | Typed parameters, Frame history, route allowlists, deep-link contracts, exit guards and results |
| DI and service composition | Advanced | Composition roots, scopes, captive dependencies, typed factories, decorators and options validation |

The twelve fundamentals guides supplement these paths with identity, nullable contracts, closures, generic constraints, task outcomes, namescopes, layout units, binding contexts, properties and ownership. Their fragments are not advertised as twelve new complete applications.

## The studio

**One lesson, one experiment.** Ninety explicit atlas assignments have their own input models, calculations, geometry and explanations. Tests guard against duplicated scenes disguised by different captions. Models declare their simplifications rather than pretending to be instrumented Uno traces.

**Controlled playback.** One seekable clock owns Previous/Next, pause/resume, replay, speed and optional looping. Manual edits take ownership from animation. Hidden/offscreen views and reduced-motion preferences are respected.

**Actual GPU work.** The dirty-tile lab runs WebGPU classification and rendering, then checks every output against a CPU reference. Readback is a teaching/validation aid, not a proposed production rendering loop. SVG/text explanations remain available without a GPU.

**Code coloring throughout.** A locally bundled worker supports 26 modes, including the explicit plaintext fallback, without loading Monaco. It covers lessons, inline code, source excerpts, atlas output, solution dialogs, fundamentals and reference fences. Source text is preserved; unknown languages and oversized inputs remain complete plaintext. Grammar coloring is lexical, not semantic analysis.

**A real playground.** Desktop Monaco connects to in-browser Roslyn for C# completion, diagnostics, hover, local definitions, signatures and formatting. XAML suggestions use reflected Uno metadata. A lesson-aware extension supplies hints and focus decorations. Narrow screens use a text-editor fallback with the same execution engine.

**Source at your fingertips.** The complete reference library contains 420 Markdown documents and 19,024 source/sample/test paths from the pinned Uno checkout, with original Markdown, source links and attribution. External DocFX repositories are not silently copied.

## Development

Requires Node.js 22+, .NET SDK **10.0.401** and the WebAssembly workload. The runner pins **Uno.Sdk 6.7.30** and **Roslyn 5.9.0**.

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

Open `http://localhost:4173`. Fragment routes and relative assets support the `/LearnUno/` Pages subpath. Interface-only builds can omit the runtime/source checkout, but imported evidence is then unavailable. Production requires both and rejects missing or changed source selections.

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Node tests cover authored-content contracts, model invariants, exact coloring/source preservation, imports, transport and provenance. Browser checks exercise course/atlas routes, guided steps, chapter loading/retry, source coloring, keyboard focus, mobile, dark mode and the real Uno examples. Compiler tests use actual runner references. Software-WebGPU checks establish shader execution and CPU parity, not physical-GPU performance. The pipeline deploys the tested artifact and verifies the public URL; consult its result for a particular revision.

## Execution and safety boundaries

The preview is **Uno NativeRenderer / WebAssembly**, not an HTML imitation of XAML. C# compiles a single `Lesson.Build()` document; XAML uses `XamlReader.Load`. NuGet installation, arbitrary projects, source generators, compiled `x:Bind`, `x:Class` and compiled event handlers are outside this sandbox. Project-only examples and upstream excerpts retain their context labels.

The opaque-origin preview has bounded ephemeral settings, but no hard CPU/memory quota; an infinite loop can stall a tab. Only run trusted code. Notes and progress are browser-local, not an encrypted account service. Visual models and grammar coloring do not certify platform support or complete IDE parity. See [security](docs/security.md), [playback](docs/atlas-playback.md), [lesson models/coloring](docs/lesson-specific-atlas.md) and [graphics validation](docs/graphics-validation.md).

## Source map

```text
site/content/chapters/   Original expanded lesson and step material
site/content/source-map.json  Curated pinned documentation/code selections
site/src/course/         Existing runnable lessons and learning paths
site/src/learning/       Chapter reader, phase companion and fundamentals
site/src/atlas/          Unique models, playback and GPU comparison
site/src/coloring/       Grammar engine, bounded worker and DOM adapter
site/src/workspace.mjs   Real Uno editor/preview composition
site/design/            Shell, reading, models and syntax-color themes
scripts/study-material.mjs  Validated lazy chapter/provenance build
runtime/                Uno application, Roslyn and sandbox bridge
tests/                  Content, model, compiler, security and browser checks
docs/                   Architecture, authoring and operational boundaries
```

## Provenance and licensing

`sources.lock.json` pins the upstream revision. `build.json` identifies the deployed commit, runtime availability and content counts; `study/index.json` records chapter coverage. Source documentation and the pinned runner may describe different versions, so API support must be checked against the selected target.

Original code and lessons are MIT-licensed. Imported Uno documentation and code excerpts retain Apache-2.0 provenance and source links. Third-party names identify compatible technologies, not endorsement. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the [authoring guide](docs/course-authoring.md).
