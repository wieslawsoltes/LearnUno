# Rich-text runner boundary and regression evidence

The common-control release tests behavior, not merely construction. The installed Uno 6.7.135 NativeRenderer's RichTextBlock declaration is explicitly `[Uno.NotImplemented]`; its constructor supplies a BlockCollection without drawing those blocks. The original exercise compiled and returned a UIElement but rendered no paragraph or hyperlink. The browser interaction test correctly rejected that empty result.

The runnable lesson now builds **actual Uno TextBlock.Inlines**, one text control per paragraph, with Run emphasis and a real Hyperlink click handler. It declares this adaptation in the chapter and inside the running preview. It does not inject HTML, alias RichTextBlock to another type, suppress the regression test, or claim full block-layout support. The exercise's single font-size edit is shared by both paragraph controls.

The original complete RichTextBlock example is retained in a separately labelled, syntax-colored **project-only** section and downloadable project appendix. Use a Windows App SDK host, or independently verify an Uno target/version with block rendering. The pinned SamplesApp excerpt explains that API but does not prove every renderer in the installed host implements it.

Regression checks require visible inline content, repeated local hyperlink activation, a retained second paragraph and an explicit runtime label. A reading check distinguishes browser and project code and verifies that coloring preserves exact source. The complete CI compiles and executes every runnable starter and solution; the project-only example is not falsely counted as executed.

Primary implementation evidence:
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/RichTextBlock/RichTextBlock.cs
- https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/TextBlock/TextBlock.wasm.cs

This is also a lesson about capability validation: API presence, construction and visible behavior are three different checks.
