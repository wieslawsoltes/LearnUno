# Runtime package boundaries

The browser teaching host uses CommunityToolkit.Mvvm **8.4.0**, the published version available when validating this expansion. The previously authored 8.4.2 pin failed NuGet restore and was corrected throughout the runner, lesson declarations, export registry and documentation. Package declarations are still checked against the shared registry.

A second restore exposed a separate implicit dependency: Uno.UI.HotDesign 1.20.485 required CommunityToolkit.Mvvm >= 8.4.2 even for this Release publish. Excluding its runtime assets is not the same as excluding its dependency graph. The runner does not use Hot Design, so it now sets the supported **UnoDisableHotDesign** property instead of suppressing NU1605 or accepting an incompatible dependency graph.

The property is read by `src/Uno.Sdk/targets/Uno.Implicit.Packages.ProjectSystem.targets` in the Uno 6.7 source line:
https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.Sdk/targets/Uno.Implicit.Packages.ProjectSystem.targets

The same property is included in downloaded minimal lesson projects. This boundary concerns optional Studio design tooling; it does not remove Roslyn, MVVM Toolkit, the Uno renderer, XamlReader, or the course's own editor/visual atlas. A full application that needs Studio tooling should choose a mutually compatible SDK/package set rather than copying this isolated-host policy without review.

Regression tests require the opt-out and prohibit package-warning suppression. The full pipeline must still restore, compile every core/workshop example, boot the actual WebAssembly host and exercise the browser UI before publishing. A source-level test alone does not prove runtime compatibility.
