# Prioritizing lessons from source evidence

The feature map is generated from the pinned Uno checkout, not a hand-written assertion that every control is covered. The inspected snapshot contains **19,024 C#/XAML source paths**, **1,542 SamplesApp XAML files** and **559 discovered public UI types** under the scanner's lexical inclusion rules. `dist/feature-map/index.json` records the revision, method, counts, source paths and evidence hashes.

The scan matches public class declarations outside Uno.UI/Generated to distinct SamplesApp XAML files after removing XML comments. It is not a Roslyn semantic API scan. Name collisions, generated declarations and source constructs outside the matching pattern are explicit limitations. A declaration or sample is not proof that an API works on every target. A sample-file count is not application-use or market-popularity telemetry.

## Why these additions come first

At this revision, common sample elements include TextBlock (1,076 sample files), StackPanel (1,025), Grid (858), Border (627), Button (565), ScrollViewer (299), TextBox (212), ListView (176), ComboBox (129), CheckBox (122) and Image (112). These counts motivated concrete editing, selection, bounded-scrolling, choice, image, state-feedback and composition lessons before specialized renderer or device APIs.

The 30 core app-building lessons teach forms, collection identity, commands, navigation and service ownership. Six data workshops turn those foundations into paging, converters, load/refresh states, version conflicts, collection transactions and history. Eight design lessons connect common controls to mockups and real Uno exercises. The six additional fundamentals explain the contracts beneath those workflows rather than introducing another isolated API list.

The coverage map also connects RowDefinition, ColumnDefinition, Setter, ControlTemplate, ContentPresenter, ItemsControl and Slider to their existing applicable lessons. A connected entry means related instructional material is available; it does not mean every member or target has been exhaustively taught or tested.

## Keep the remaining boundary visible

High-sample-count types without a dedicated chapter, such as UserControl, remain discoverable as reference-only where appropriate. Further lesson candidates include reusable composite controls, inline rich text, items-panel strategies, TreeView/GridView/TabView workflows, drag and drop, menus and keyboard accelerators, and platform integration. Source/sample counts help locate evidence, but prerequisite order, task frequency, accessibility, and a runnable supported-target example must also inform authoring.

Do not relabel a type as fully covered simply to make a progress metric larger. Add a causal explanation, an experiment or mockup suited to that concept, a verified code example, source context and regression checks. Preserve the difference between authored curriculum coverage, source discovery and actual runtime support.
