/** Explicit target boundary, not a fabricated RichTextBlock implementation. */
export const richTextRuntimeBoundary = Object.freeze({
  title: 'One text contract, two target-specific examples',
  runner: 'Uno 6.7.135 · NativeRenderer / WebAssembly',
  summary: 'The provided starter runs with real TextBlock inlines. RichTextBlock is kept as a project-only comparison for this pinned host; saved drafts are not replaced.',
  draftNote: 'An older saved draft may still instantiate RichTextBlock or use the previous keyboard wiring. Export that draft before using Reset code to load the supported starter; opening this lesson does not replace your edits.',
  live: 'The live exercise uses two real TextBlock controls, Run inlines, and a Hyperlink. It does not instantiate RichTextBlock. In this pinned browser NativeRenderer, a guarded runtime UIElement adapter makes the inline a native tab stop and handles Enter on that same object. Marking the key handled prevents the anchor from navigating the preview. Pointer Click and keyboard input call the same local help action. The portable Hyperlink reference API does not expose KeyDown; this browser implementation detail is excluded from the project comparison.',
  project: 'The separate RichTextBlock example demonstrates Blocks and Paragraph for a target/version where that control is implemented. It is not run by this browser host.',
  reason: 'The runner version marks RichTextBlock and its constructor Uno.NotImplemented. Constructing the type and populating Blocks can succeed without rendering paragraphs. A non-null UIElement is not proof that its content or interaction works.',
  sourceUrl: 'https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/RichTextBlock/RichTextBlock.cs#L9-L17',
  sourceBlob: 'b7d032733357411dc89ab01031120dc7a82c6689',
  hyperlinkUrl: 'https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Documents/Hyperlink.wasm.cs#L13-L17'
});
