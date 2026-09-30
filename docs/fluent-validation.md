# Fluent release regression findings

## Mobile presentation and focus

The initial complete PR suite ran 250 browser tests: 247 passed and three stronger rich-text checks failed. The lightweight Fluent route, preference, drawer, focus, overflow and high-contrast checks passed. Interface-only success did not prove embedded-runtime behavior.

Two narrow tests called the low-level request transport while the mobile workspace was showing Code. That API intentionally does not select presentation tabs or award exercise completion. The tests now use the same Run action as a learner. They require the current run to finish, a real Roslyn success, a visible Preview pane, complete paragraphs and a working inline link. Separate tests verify that switching panes and resizing preserve the original iframe, draft and focus owner.

## Inline keyboard input and the actual compiler surface

The fresh-instance keyboard test exposed that the inline link was not a tab stop and Enter did not raise its managed Click in the pinned runner. The first proposed adapter attached KeyDown to Hyperlink. That was incorrect: the **reference metadata available to both compilers does not expose Hyperlink.KeyDown**, regardless of internal implementation inheritance. The full browser run correctly rejected both variants with CS1061.

The revised browser example explicitly sets Hyperlink.IsTabStop and registers KeyDown on the owning TextBlock. It accepts Enter only while the link's FocusState is not Unfocused, marks the event handled, and calls the same local help action as pointer Click. This is a documented workaround for the pinned browser host, not a replacement Hyperlink implementation. The portable project-only RichTextBlock comparison does not include the adapter.

Primary API and source references:
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/hyperlinks#input-events
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Documents/Hyperlink.wasm.cs
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/TextBlock/TextBlock.cs

The test starts a fresh example, checks the untouched label, reaches the link through Tab navigation and requires Enter to produce the help result. A prior pointer click cannot satisfy the assertion. Full content remains checked after activation. No synthetic DOM click or host-side help action substitutes for Uno input.

## Compiler failures must fail the gate

Run 36742187162 exposed a second, independent validation defect: `dotnet run ... | tee report.log` returned tee's success under the implicit GitHub shell even though compilation produced two errors. The compiler itself correctly returned failure, and the browser gate prevented publication, but the compilation step misleadingly appeared green.

`scripts/compile-lessons.sh` now owns that pipeline with `set -euo pipefail`, quoted arguments and merged diagnostic logging. The CI step invokes it explicitly. Regression tests inject a deterministic compiler process returning 0 or 23 and verify that tee preserves the exact exit status and complete report. These fixture tests do not claim to compile C#; the separate real compiler and Uno gates remain mandatory.

## Preservation and release evidence

Only the rich-text starter and derived solution change in this PR; the other 214 variants, lesson identifiers, progress, source excerpts and dependency versions are unchanged. The refined suite includes coarse-pointer portrait/landscape checks alongside the 320/390/768/1024-width route matrix. Chromium emulation is not physical iOS certification.

Check the final PR/main workflows and their public-site jobs for the exact released revision. Earlier failed runs and source inspections are recorded here as regression history, not advertised as passing release evidence.
