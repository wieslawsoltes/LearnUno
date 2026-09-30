# Fluent release regression findings

The first complete PR suite ran 250 browser tests: 247 passed and three stronger rich-text checks failed. The lightweight Fluent route, preference, drawer, focus, overflow and high-contrast checks passed. This distinction matters: an interface-only green check does not prove every embedded-runtime interaction works.

## Mobile exercise presentation

The two narrow rich-text tests called the low-level `learnUnoLab.request` transport while the new workspace was showing its Code pane. That API intentionally does not control presentation or award exercise completion. The tests now invoke the same Run code action as a learner. They require a real Roslyn result, the visible Preview pane, full paragraph content and a working inline link. The pane-retention test independently checks that tab changes keep the original iframe and draft.

## Keyboard activation in the pinned runner

The fresh-instance test exposed a separate problem: the original inline Hyperlink had `tabindex="-1"`, and pressing Enter after DOM focus did not raise its managed Click event in the pinned Uno 6.7.135 NativeRenderer. A prior pointer click must not satisfy a subsequent keyboard assertion.

The two authored browser variants now explicitly enable `IsTabStop` and attach a small KeyDown adapter for Enter. Pointer Click and keyboard input call the same local help action. The adapter handles the key so default anchor navigation does not change the iframe channel fragment. This uses the browser target's Hyperlink/UIElement surface; it is not presented as a portable Windows App SDK Hyperlink API. The separate project-only RichTextBlock program does not contain that handler.

Primary runner-version implementations:
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Documents/Hyperlink.wasm.cs
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Documents/Hyperlink.cs
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/TextBlock/TextBlock.cs

The test resets the program, checks the untouched help label, reaches the link through Tab navigation and requires Enter to produce the result. Full content must remain readable afterward. No host-side DOM click adapter or synthetic managed action is substituted for the real Uno input path.

## Preservation and gates

Only the rich-text starter and derived solution change; the other 214 authored runnable variants are unchanged. Lesson IDs, progress, source excerpts, dependency versions and runtime sandbox permissions are unchanged. The refined suite also includes a coarse-pointer portrait/landscape check in addition to the ordinary 320/390/768/1024-width route matrix. Those tests are Chromium emulation, not physical iOS certification.

Check the final PR/main workflow and its public-site job for release results. A source change or a discovered test is not a completed validation.
