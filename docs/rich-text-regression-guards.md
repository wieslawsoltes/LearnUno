# Rich-text evidence and regression guards

## Baseline and scope

This follow-up targets merged main `677d056e4acabbd52e4f4870b74c279409278585`.
PR #6 already replaced the unimplemented Uno 6.7.135 RichTextBlock exercise with
real TextBlock.Inlines, Run and Hyperlink controls. Its full RichTextBlock
program remains a separately labelled project-only comparison. The release
has its own CI evidence; this supplement does not claim that its added browser
tests have run merely because the baseline passed.

All 216 runnable starter/solution strings are byte-for-byte unchanged by this
follow-up. It does not add dependencies, change the runtime, replace a
framework control, or modify core lesson/progress identifiers.

## Make the boundary visible before Run

A compact target/version card appears on every tab of the rich-text lesson,
including the playground. It explains the supported inline exercise and the
separate block-based project example. The detailed explanation is a native,
keyboard-operable disclosure, avoiding an always-expanded panel above the editor.
Primary links point to the **runner version**, not only to the newer source
snapshot. The comparison uses an actual NotImplemented marker as evidence for
this case; the absence of an attribute is not a universal support detector.

The existing reading-page notice and complete project example remain in place.
The source-card caption now explicitly distinguishes its compiled SamplesApp
fragment from the older browser host. Its file/excerpt hashes and selected
line ranges are unchanged. Strict build verification still checks the original
pinned source instead of updating hashes to hide drift.

## Preserve a learner's work

An older saved draft can contain the original RichTextBlock code. Loading the
page must not replace it silently. The card tells the learner to export their
draft before using the existing Reset code action. A regression checks that
resetting this lesson restores its supported starter while keeping another
lesson's independent draft unchanged. No migration changes the browser's
saved values merely because new content is available.

## Observable behavior, not construction alone

The reusable browser assertion checks the complete first sentence, the second
paragraph, the actual inline link and the explicit renderer label. Both
starter and solution are tested at narrow width. The all-design-example test
also applies the content assertion after successful construction for this
lesson, so a non-null UIElement is no longer the only evidence.

Pointer activation must change the help result while preserving the surrounding
text. Before keyboard activation, the test reloads the same original program
through the public runner and requires `Help topic: none`. It then focuses the
real anchor and presses Enter. This prevents the earlier pointer result from
making a nonfunctional keyboard handler look successful. No callback is
invoked directly and no replacement HTML is inserted into the Uno preview.

Export tests verify that Lesson.cs contains the live program while the
project-only comparison stays in ProjectExample.txt. Grammar-coloring tests
verify exact copied text, and the card renderer escapes metadata and rejects
executable URL schemes. Empty metadata does not create a notice for unrelated
lessons.

## Validation boundaries

Local Node tests and strict source/build validation cover the model, content,
export and markup contracts. A compiler-only check uses the unmodified
published .NET WebAssembly runtime and its Roslyn reference metadata to emit
all 182 authored C# variants; this is not UI execution or an SDK restore.
In-memory Chromium component checks cover the card at desktop/mobile widths
in both themes without network navigation. They are not the complete routed
site, the worker lifecycle or a screen-reader certification.

The added Playwright journeys must run in the normal CI environment before
publishing this supplement. Retain the baseline and supplemental evidence
separately; a passing baseline is not permission to skip new tests.

Primary evidence:

- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/RichTextBlock/RichTextBlock.cs#L9-L17
- Source blob: b7d032733357411dc89ab01031120dc7a82c6689
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Documents/Hyperlink.wasm.cs
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-block
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/rich-text-block
