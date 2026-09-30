# Common controls: contracts before decoration

This refinement adds four source-connected learning units to the existing Design labs section. It preserves the ninety core lesson IDs, core completion criteria, eighteen fundamentals guides, six data workshops, and the real Uno/Roslyn preview. The design section now has twelve lessons: 108 runnable learning units, 216 starter/solution variants and 182 C# variants across the complete course. Four-step workshop explanations add sixteen steps; core chapters still contain 360 steps, with 72 steps across the independent data/design units.

## Why these features

The pinned feature survey scans 19,024 source files and 1,542 SamplesApp XAML files. UserControl appears in 841 sample files, Run in 166, GridView in 35, NumberBox in 20, and RichTextBlock in 18. These counts guided an editorial priority, not a popularity ranking: UserControl is also a sample-root convention, and API presence does not prove implementation parity. The map now links these types to the new lessons. Other reference-only gaps remain visible rather than claiming exhaustive coverage.

## Four different experiments

| Lesson | Reproducible boundary | Actual Uno exercise |
| --- | --- | --- |
| Compose a control without stealing its context | Replacing the component root context breaks the caller's Title lookup; explicit inner sources preserve ownership. | A UserControl exposes a Caption dependency property. Updating the host changes only the bound instance. |
| Make text structure carry the meaning | Replace a descriptive link with Here; increase text scale without cutting off the instruction. | RichTextBlock paragraphs contain Runs and a Hyperlink that activates local help. |
| A card collection is still a data collection | Selection survives reversal by stable key; hiding the selected item clears it, not another arbitrary item. | A real GridView rebinds its ItemsSource, restores the selected document by ID, and keeps ItemClick separate. The chosen document moves from first to last. |
| A missing number is not zero | Blank, syntax errors, fractions and out-of-range drafts cannot overwrite the accepted quantity. | NumberBox clearing yields NaN; an application commit gate additionally requires a finite integer in range. |

Each unit contains a practical scenario, four developed steps, worked situations, recall questions and reasoned answers, design tips, a knowledge check, runnable starter/solution code, and an original responsive HTML specimen. Mockup controls have accessible names, reset disposes and recreates listeners, a selected card preserves keyboard focus after updates, and help activation does not accidentally navigate the fragment router.

## Source evidence

`site/content/control-study.json` pins four excerpts from revision `e1292e0d87f9d38c9f3a120c69f0200b3c0999c1`: UserControl content ownership, RichTextBlock hyperlink examples, GridView collection/template configuration, and NumberBox's empty-input validation path. `scripts/control-study.mjs` verifies whole-file and selected-line SHA-256 hashes, line bounds and allowed paths before producing `dist/control-study/index.json`. Strict builds fail on altered or missing evidence. The reader loads the small evidence artifact on demand, escapes its code, and preserves exact source text through the existing coloring worker.

The excerpts remain Apache-2.0 upstream material with revision and line links, not original course code or standalone executable projects. Captions explain the omitted context. The installed Uno runner and the pinned source snapshot may differ; actual exercises are separately compiled and executed against the runner.

## Explicit limits

The HTML specimens are design models, not a reconstruction of Uno's binding engine, GridView input routing, line layout or localized NumberBox parser. In particular, the numeric specimen accepts a deliberately bounded invariant decimal syntax, whereas the control supports a richer target/culture-specific editing system. SmallChange is not an integer business-rule validator. A small GridView example does not establish large-data performance, native keyboard behavior or screen-reader support.

The active runner still uses actual CommunityToolkit.Mvvm 8.4.0 and Microsoft.Extensions packages already validated by the prior release. This refinement adds no package and does not change source-generator or sandbox permissions.

## Validation

Model tests cover independent binding sources, stable-key reconciliation, numeric missing/invalid/valid states, accepted-value preservation, distinct mockups, source hashes and traversal rejection. Browser tests cover reading and coloring of all four actual excerpts, controlled failures, reset/listener behavior, local link activation, keyboard focus, narrow/large-text layouts, dark mode, and four actual Uno interactions. The existing complete lesson execution suite automatically includes all new starter/solution variants.

The local environment blocks browser navigation by policy. A strict static build and focused model tests are useful evidence but are not represented as full runtime verification. GitHub Actions remains the release gate for compilation, actual Uno execution, browser interaction, software-WebGPU regression checks and public-site delivery. Consult the workflow for the exact commit's results.

Primary reading used for editorial review:

- https://learn.microsoft.com/en-us/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.controls.usercontrol
- https://learn.microsoft.com/en-us/windows/apps/develop/data-binding/data-binding-in-depth
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/rich-text-block
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/hyperlinks
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/listview-and-gridview
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/number-box
