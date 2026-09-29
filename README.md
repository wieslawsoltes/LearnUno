<p align="center"><img src="site/favicon.svg" width="64" height="64" alt="LearnUno" /></p>
<h1 align="center">LearnUno</h1>
<p align="center"><strong>Build once. Understand every layer.</strong><br />An interactive, source-connected learning studio for Uno Platform.</p>
<p align="center"><a href="https://wieslawsoltes.github.io/LearnUno/">Course</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/atlas">Visual atlas</a> · <a href="https://wieslawsoltes.github.io/LearnUno/#/fundamentals">Fundamentals</a> · <a href="docs/architecture.md">Architecture</a> · <a href="docs/security.md">Security</a></p>

[![Build, validate and publish](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml/badge.svg)](https://github.com/wieslawsoltes/LearnUno/actions/workflows/ci.yml)

## Learn the mechanism, not just the name

**60 guided lessons · 60 explicitly assigned visual experiments · 12 foundations chapters · 120 runnable starter/solution variants**

Predict a result, change an assumption, inspect the outcome, and test it in a **real Uno WebAssembly application**. Every lesson connects explanation, code, a specific visual model, retrieval feedback and independent transfer work. The two capstones apply those ideas to an application and a framework-quality contribution.

LearnUno is independent of Uno Platform and Microsoft. It is not an official course, accreditation, or certification.

## What's new in 0.2.0

**Different lessons, different experiments.** The visual atlas now contains sixty explicit lesson assignments instead of recycling eleven generic scenes. Forty-nine new models explore reference aliasing, subscription retention, build artifacts, namescopes, dependent-property notifications, templates, DI lifetimes, navigation history, migration, HTTP outcomes, capability boundaries, input coordinates, cache eviction, UI queue latency, statistical distributions, release coherence, test matrices, and more. Existing layout, binding, easing and GPU damage labs remain where they fit the lesson precisely.

**Deeper explanations.** Each lesson has a mechanism-focused deep dive, a counterexample, an investigation sequence and a transfer question. Twelve new fundamentals chapters cover value/reference identity, nullable contracts, closures and events, generic constraints, async outcomes, XAML object construction, namescopes, constraints and units, DataContext, dependency properties, ownership/disposal, and stable identity in projections.

**Code coloring throughout the site.** Locally bundled grammars color reading examples, inline code, worked-solution dialogs, reference fences, fundamentals and changing atlas code. The worker supports twenty grammars including C#, XAML/XML, JavaScript, TypeScript, JSON, CSS, shell, PowerShell, YAML, diff, SQL, F#, and WGSL. It preserves source text and escapes markup; unknown languages and oversized inputs remain readable plaintext. Reading a colored example does not require Monaco or Uno to load.

See [lesson-specific atlas and coloring architecture](docs/lesson-specific-atlas.md).

## Curriculum

| Path | Level | Topics |
| --- | --- | --- |
| First principles | Beginner | Uno mental model, C#, project structure, XAML, events, debugging |
| Layout & visual language | Beginner | Panels, Grid sizing, spacing, resources, templates, responsive layouts |
| Data, binding & state | Intermediate | Binding direction, notifications, editing, x:Bind boundaries, collections, commands |
| Application architecture | Intermediate | MVVM, MVUX concepts, injection, navigation, async cancellation, serialization |
| Connected applications | Intermediate | HTTP, configuration, localization, authentication boundaries, logging, package choices |
| Crafting custom UI | Advanced | Dependency properties, templates, pointer coordinates, accessibility, animation, geometry |
| Performance engineering | Advanced | Layout invalidation, virtualization, caching, dispatch, profiling, browser delivery |
| Every platform, deliberately | Advanced | Target evidence, renderers, interop, ownership, assets, deployment lifecycle |
| Quality & production | Advanced | Unit/UI/visual tests, resilience, delivery gates, task-workspace capstone |
| Framework internals | Expert | Source investigation, XAML generation, precedence, custom panels, damage, contribution capstone |

The additional fundamentals chapters supplement these ten paths. Their code fragments explain specific concepts and are not misrepresented as twelve new complete applications. The existing sixty executable lessons retain their identifiers, drafts, notes and progress.

## The studio

The responsive interface supports light/dark themes, keyboard navigation, reduced motion, lesson search, saved lessons, notes and portable progress. Visual labs have inspectable geometry, controls, presets, calculated results, code, scope statements and shareable inputs. Playback uses one seekable clock with Previous/Next, Pause/Resume, Replay, speed and optional looping; manual edits take ownership from animation.

The dirty-tile lab performs real WebGPU compute and rendering and checks every output against a CPU reference. Other scenes are intentionally scoped SVG/HTML teaching models, not fabricated Uno traces or performance measurements. Readback is a validation aid, not a recommended production rendering loop.

Desktop Monaco connects to in-browser Roslyn for C# completion, diagnostics, hover, local definitions, signatures and formatting. XAML completion uses actual reflected Uno metadata. A lesson-aware extension adds hints and focus decorations. Narrow screens use a text-editor fallback with the same execution engine.

The pinned reference corpus contains **420 complete Markdown documents** under `unoplatform/uno/doc`, plus **19,024 source/sample/test paths**. The reader retains source links, original Markdown, downloads and attribution. External DocFX repositories are not silently copied.

## Development

Requires Node.js 22+, .NET SDK **10.0.401**, and the WebAssembly workload. The runner pins **Uno.Sdk 6.7.30** and **Roslyn 5.9.0**.

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

Open `http://localhost:4173`. Fragment routes and relative assets support the `/LearnUno/` Pages subpath. Interface-only builds can omit runtime/source checkouts; production CI requires both and refuses an incomplete deployment.

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Validation covers model invariants, exact coloring/source preservation, imports, runtime transport, all lesson assignments, guide routes, dynamic highlighting, accessibility interactions, desktop/mobile layouts and the existing actual Uno examples. The compiler tests use the runner's real reference metadata. Software-WebGPU tests validate shader execution and CPU parity. Deployment ships the tested artifact, followed by public-site verification. Consult the workflow for the actual result of a particular revision.

## Execution and safety boundaries

The preview is **Uno NativeRenderer / WebAssembly**, not an HTML imitation of XAML. C# experiments compile a single `Lesson.Build()` document; XAML uses `XamlReader.Load`. Arbitrary multi-project compilation, NuGet installation, source generators, compiled `x:Bind`, `x:Class`, and compiled event handlers are outside this sandbox. Project-only examples are labelled accordingly.

Grammar coloring is lexical, not a replacement for semantic analysis. Roslyn-backed editor services do not claim complete Visual Studio/Rider parity. Visual models state their simplifications and do not certify behavior on every native target.

The preview has an opaque origin and bounded ephemeral settings. An infinite loop can still stall a tab; there is no hard CPU/memory quota. Only run trusted code. Notes/progress are browser-local, not an encrypted account service. See [security](docs/security.md), [playback behavior](docs/atlas-playback.md), and [graphics validation](docs/graphics-validation.md).

## Source map

```text
site/src/course/         Guided lessons and runnable examples
site/src/learning/       Foundations chapters and per-lesson deep dives
site/src/atlas/lessons/  Forty-nine additional lesson-specific models
site/src/atlas/          Shared lab shell, playback, original models and GPU work
site/src/coloring/       Grammar engine, bounded worker and DOM adapter
site/src/editor.mjs      Monaco language-service adapters
site/src/workspace.mjs   Real Uno editor/preview composition
site/src/reference.mjs   Pinned documentation reader
site/design/            Shell, models, reading and syntax-color themes
runtime/                Uno application, Roslyn services and sandbox bridge
tests/                  Model, compiler, security and browser validation
scripts/                Static build and source import
docs/                   Architecture, authoring and operational boundaries
```

## Provenance and licensing

`sources.lock.json` pins the upstream snapshot; `build.json` identifies the deployed commit, version, runtime availability and content counts. Source documentation and the deliberately pinned runtime may differ; API availability must be verified against the selected target/version.

Original code and lessons are MIT-licensed; imported Uno documentation retains Apache-2.0 notices. Third-party names identify compatible technologies, not endorsement. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the source-linked [authoring guide](docs/course-authoring.md).
