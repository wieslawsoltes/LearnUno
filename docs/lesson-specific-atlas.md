# Lesson-specific atlas and expanded foundations

## One lesson, one authored experiment

Each of the sixty lesson IDs has an explicit, distinct atlas assignment. Eleven established experiments retain their stable URLs; forty-nine new models live in `site/src/atlas/lessons`, grouped by course path. `labForLesson` rejects missing authoring instead of falling back to a generic pipeline.

The models cover reference aliasing, event reachability, build artifacts, panel policies, resources, templates, responsive constraints, notifications, draft commits, binding generation, collection signals, commands, domain projections, immutable snapshots, dependency lifetimes, navigation, schema migration, HTTP validation, configuration, culture, authorization, logging, package capabilities, dependency-property callbacks, template-part lifetime, pointer transforms, accessible names, affine geometry, LRU caches, UI queues, statistics, startup budgets, target evidence, renderer representations, message envelopes, native resources, pixel coverage, release coherence, regression tests, condition waits, raster differences, delivery gates, stable IDs, source evidence, namescopes, panel extents and contribution evidence.

Shared SVG primitives provide a consistent visual language. Every new lesson has its own calculation, input schema, result data, diagram composition, four explanation phases, scope statement and controlled variation. Tests require an input to affect model data and all sixty lesson mappings to be distinct. A separate visual-diversity test strips SVG captions and DOM identifiers before comparing default scene geometry; changing a title alone cannot disguise a duplicated scene. This structural check complements, rather than replaces, the behavioral tests and pedagogical review.

The existing playback controller remains authoritative for pause/resume, steps, seeking, speed, visibility suspension and reduced motion. Phase highlights use model-specific bounds. These are explicit teaching models, not fabricated runtime traces. The established damage lab retains actual WebGPU classification and CPU-reference comparison.

## Deeper reading

All sixty lessons include a deeper investigation: mechanism, counterexample, authored phase reasoning and a link to the exact lesson model. A separate Fundamentals field guide contains twelve chapters on value/reference identity, nullable contracts, closures, generic capabilities, async outcomes, XAML construction, namescopes, layout constraints, binding context, dependency properties, resource ownership and stable identity.

Each chapter has original explanations, a labelled code fragment, a recall prompt with revealable reasoning, a transfer exercise, a primary-documentation link and a connected runnable lesson. The guide scratchpad is explicitly transient; existing lesson notes remain the saved-note workflow. Lesson IDs, progress, bookmarks and the original 120 runnable variants are preserved.

## Grammar-based code coloring

Highlight.js 11.12.0 is pinned and bundled locally with 26 registered language modes, including the explicit plaintext fallback. The core set covers C#, XML/XAML, JavaScript, TypeScript, JSON, CSS, Bash, PowerShell, YAML, diff, INI, SQL, Markdown, Python, C++, F#, HTTP, Dockerfile and WGSL. Reference-corpus coverage adds Apache, Nginx, Gradle, Swift, Mermaid source and Visual Studio solution files. Mermaid is colored as source, never evaluated or rendered by a diagram engine.

`dotnetcli` resolves to Bash and `pwsh` to PowerShell. These aliases and the additional grammars were selected by inspecting actual fence labels in the 420-document pinned Uno corpus, rather than only testing synthetic course examples. File lists, URI samples, logs and other explicitly non-code fences remain labelled plaintext. Fenced-language metadata is preserved by the reference renderer.

A module worker performs coloring without downloading Monaco or starting Uno. The DOM adapter observes static and dynamic code: lessons, inline snippets, atlas code, solution dialogs and reference documents. It skips Monaco-owned content, preserves exact source text, checks pending results against the connected node and source revision, and deduplicates updates. The worker has a bounded cache and a deadline. Very large or unsupported-language snippets remain complete, labelled plain text.

Grammar coloring is not semantic type checking; Roslyn remains the playground's compiler/language service. Theme-aware token colors do not change copied source. Source is escaped and never evaluated as executable markup. New code-fence grammars must include text-preservation and hostile-markup fixtures.

## Verification and boundaries

Unit tests cover one-to-one mappings, geometry diversity, boundary calculations, changed-input outcomes, original course contracts, source preservation across languages, hostile-markup escaping, aliases and Markdown fences. Browser tests cover the sixty atlas routes, every lesson assignment, twelve guides, dynamic coloring, dialogs, themes, mobile overflow and the original Uno/Roslyn/playback journeys. A reference-snippet test navigates actual imported documents and verifies CLI, PowerShell, hosting, Gradle, Swift, Mermaid and solution-file coloring without changing their source text.

The complete pipeline validates, deploys the same artifact and checks the public URL. Latency, memory-count and configuration fixtures are teaching inputs, not reported Uno benchmarks. Exact target support and renderer behavior need validation against the selected platform/version. A software-GPU test is not a physical-device benchmark. The guide fragments are not advertised as complete projects; their connected course lessons provide runnable examples.

Primary references accompany each chapter. They include the pinned Uno source corpus, Microsoft C#/XAML contracts and Highlight.js's documented API:

- https://github.com/unoplatform/uno/tree/e1292e0d87f9d38c9f3a120c69f0200b3c0999c1
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types
- https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions
- https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters
- https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/async-return-types
- https://learn.microsoft.com/en-us/windows/apps/develop/platform/xaml/xaml-namescopes
- https://learn.microsoft.com/en-us/windows/apps/design/layout/layouts-with-xaml
- https://learn.microsoft.com/en-us/windows/apps/develop/platform/xaml/dependency-properties-overview
- https://learn.microsoft.com/en-us/windows/apps/develop/data-binding/data-binding-in-depth
- https://highlightjs.readthedocs.io/en/latest/api.html
- https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md
