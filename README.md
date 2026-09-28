<p align="center"><img src="site/favicon.svg" width="64" height="64" alt="LearnUno" /></p>
<h1 align="center">LearnUno</h1>
<p align="center"><strong>Build once. Understand every layer.</strong><br />An interactive, source-connected learning studio for Uno Platform.</p>
<p align="center"><a href="https://wieslawsoltes.github.io/LearnUno/">Open the course</a> · <a href="docs/architecture.md">Architecture</a> · <a href="docs/course-authoring.md">Author a lesson</a> · <a href="docs/security.md">Security & execution boundaries</a></p>

[![Build, validate and publish](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml/badge.svg)](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml)

## Learn by making something happen

Predict the result, explore the visual model, edit the code, and run it in a **real Uno WebAssembly application**. Then explain the result, complete a knowledge check, and revisit the idea through a local review queue.

LearnUno is an independent educational project—not an official Uno Platform product, accreditation, or certification. Original lessons and illustrations are paired with a pinned upstream reference library.

## The curriculum

**60 guided lessons · 10 paths · 120 runnable starter/solution variants · 2 independent capstones**

| Path | Level | Topics |
| --- | --- | --- |
| First principles | Beginner | Uno mental model, C#, project structure, XAML, events, debugging |
| Layout & visual language | Beginner | Panels, Grid sizing, spacing, resources, templates, responsive layouts |
| Data, binding & state | Intermediate | Binding direction, notifications, TwoWay, x:Bind boundaries, collections, commands |
| Application architecture | Intermediate | MVVM, immutable state and MVUX concepts, injection, navigation, async cancellation, serialization |
| Connected applications | Intermediate | HTTP fixtures, configuration, localization, authentication boundaries, logging, ecosystem choices |
| Crafting custom UI | Advanced | Dependency properties, control templates, pointer coordinates, accessibility, Storyboards, geometry |
| Performance engineering | Advanced | Measure/arrange, virtualization, caching, UI dispatch, profiling, WebAssembly delivery |
| Every platform, deliberately | Advanced | Target matrices, renderers, interop, native capability seams, assets, application lifecycle |
| Quality & production | Advanced | Unit/UI/visual tests, resilience, delivery gates, task-workspace capstone |
| Framework internals | Expert | Source investigation, XAML generation, value precedence, a custom Panel, dirty regions, contribution capstone |

The guided material contains about 13.5 hours of author-estimated lesson time. Independent capstones and practice take additional, learner-dependent time. Completing a lesson is not a claim of production expertise.

## Inside the studio

**A responsive learning interface.** Light and dark themes, keyboard-accessible navigation, reduced-motion support, global lesson search, saved lessons, personal notes, and portable progress files.

**Interactive explanations.** Step through eight visual-model families. Explore notification flow, star sizing, and virtualized ranges. WebGPU uses actual compute and render passes when available; Canvas 2D and accessible HTML preserve the explanation without a GPU.

**A real editor and runtime.** Desktop Monaco connects to in-browser Roslyn for C# member completion, diagnostics, hover information, local definitions, method signatures, and formatting. XAML completion reads reflected Uno types and properties. The lesson extension adds focused line decorations, CodeLens hints, shortcuts, and exercise checks. Narrow screens use an accessible text-editor fallback with the same execution engine.

**A complete pinned reference corpus.** The initial snapshot contains 420 Markdown documents physically present under `unoplatform/uno/doc`, plus 19,024 source, sample, and test paths. The reader provides readable and original-Markdown views, downloads, source links, and DocFX cross-reference resolution where available. External repositories referenced by DocFX are not silently copied.

## Run locally

Requirements: Node.js 22+, .NET SDK **10.0.401**, and the .NET WebAssembly workload. The runner pins **Uno.Sdk 6.7.30** and **Roslyn 5.9.0**.

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

Open `http://localhost:4173`. The static site supports deployment below `/LearnUno/`; routes use the URL fragment so GitHub Pages does not need a routing server.

For interface-only development, `npm run build` can run without the runtime or source checkout. Those parts are then unavailable. Production CI sets `REQUIRE_RUNTIME=1` and `REQUIRE_SOURCES=1` and refuses to publish an incomplete artifact.

## Validate

```sh
npm test
npx playwright install chromium
npm run test:browser
```

The pipeline validates lesson contracts and progress storage, compiles every C# starter/solution against the runner’s actual reference metadata, boots the opaque-origin Uno frame, verifies C# and XAML execution, checks semantic completion and diagnostics, executes all 120 authored variants, and exercises desktop/mobile learning journeys. It retains screenshots, console logs, traces, and per-lab results when available.

Deployment uses the same tested artifact. A separate job repeats representative journeys against the public Pages URL. Check the workflow result for actual verification status; the existence of a workflow or a compiled DLL alone does not establish a working deployment.

## Execution boundaries

The preview is Uno **NativeRenderer / WebAssembly**, not a reimplementation of XAML in HTML. The surrounding course interface and its WebGPU models are separate from the Uno renderer.

The sandbox compiles a single C# document containing `public static class Lesson` with `public static UIElement Build()`, or parses a XAML document using `XamlReader.Load`. It does not install NuGet packages or run arbitrary project generators. Runtime XAML does not compile `x:Class`, `x:Bind`, or code-behind event handlers. Package- and generator-dependent examples are labeled **project-only**.

Roslyn-backed editing is not advertised as complete Visual Studio/Rider feature parity. Advanced refactorings, metadata navigation, project-wide analysis, and full compile-time XAML services are outside the current boundary.

Only run code you trust. An infinite loop can stall the browser tab; an iframe does not impose a hard CPU or memory limit. See [security.md](docs/security.md).

## Project map

```text
site/src/course/       Ten authored learning paths and shared lesson helpers
site/src/app.mjs       Routing, lessons, quizzes, notes, search, and review
site/src/workspace.mjs Editor/preview composition and lesson-aware coaching
site/src/editor.mjs    Monaco and language-service adapters
site/src/visuals.mjs   WebGPU/Canvas visual models and HTML experiments
site/src/reference.mjs Pinned documentation and source browser
runtime/              Actual Uno app, Roslyn engine, metadata schema, JS bridge
scripts/              Static build, reference import, development server
 tests/               Course contracts, compiler validation, browser journeys
 docs/                Architecture, authoring, deployment, security
```

## Provenance and licensing

The source snapshot is pinned in [`sources.lock.json`](sources.lock.json); every deployment includes `build.json`. The documentation snapshot can contain forward-looking material that differs from the deliberately pinned runner version—always distinguish the two.

Original code and lesson prose are MIT-licensed. Imported Uno documentation retains its upstream Apache-2.0 license and notices. Third-party names identify compatible technologies, not endorsement. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
