# Fluent input and preview release checks

The presentation redesign must preserve actual lesson interaction, not just produce different screenshots. These regressions were isolated with the pinned Uno 6.7.135 NativeRenderer browser host and retained as normal release tests. Temporary diagnostic workflows and source-adaptation scripts are not part of the final source tree.

## Mobile execution results

A long lesson heading can put the embedded preview below the viewport. Revealing a pane in CSS alone does not necessarily make its content usable: an offscreen browser frame can also suspend layout/frame callbacks that an interaction test waits for.

The pane controller now brings the selected pane controls below the fixed chrome when the workspace is currently visible and not enough of the selected pane is on screen. It does not remount the editor or runtime, replace the draft, reset an interaction, or scroll after disposal. Desktop behavior is unchanged. If the learner has scrolled completely away while a slow runtime starts, completion does not pull them back from another section.

The normal suite checks focus-before-inert ordering, draft and iframe retention, desktop/narrow transitions, and actual rich-text pointer activation immediately after a mobile Run. In-memory component tests cover the offscreen-reader and redundant-scroll boundaries. They supplement rather than replace full Uno execution.

## Native inline keyboard behavior

The portable Hyperlink reference API does not expose KeyDown. In the pinned browser implementation, however, the inline's runtime object is a UIElement. The lesson uses an explicit browser guard and runtime type check, sets its native tabindex using Uno's public SetHtmlAttribute extension, and handles Enter on that object. Marking the event handled prevents the anchor's default navigation from replacing the runtime document. The normal Click event remains responsible for pointer activation.

This is a scoped, version-specific lesson adaptation. It is not a global DOM patch, a new portable Hyperlink contract, or a replacement for RichTextBlock. The project-only RichTextBlock comparison does not contain it. Existing saved drafts are not rewritten; the visible target notice explains exporting edits before resetting an older draft.

Primary implementation references:

- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Documents/Hyperlink.wasm.cs
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI.Runtime.WebAssembly/Xaml/UIElementWasmExtensions.cs
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/UIElement.Keyboard.cs

## Test the traversal the learner performs

The keyboard regression starts at the preview toolbar and sends actual forward Tab events until the native inline is focused. Uno's root adds an intermediate focus stop. Programmatically focusing the inline and assuming Shift+Tab/Tab is an exact inverse is not a reliable cross-frame traversal contract.

The test does not assign tabindex, add listeners, focus the inline directly, or force an activation. It resets the sample after the pointer assertion so the earlier click cannot satisfy the keyboard result. Enter must update the real managed help text while retaining the frame URL. Full paragraphs and subsequent execution are checked independently.

## Deployment identity

The release suite reads build.json and checks its source revision against the workflow's GITHUB_SHA, both before deployment and on the public Pages URL. It also requires the expected course counts, actual runtime and new presentation CSS. A green test against a stale previous deployment is not sufficient.

Software Chromium/WebGPU checks do not establish physical iOS, Android, screen-reader or hardware-GPU certification. Those boundaries remain documented in the theme and runtime guidance.
