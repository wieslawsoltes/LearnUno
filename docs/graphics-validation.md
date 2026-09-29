# Graphics validation

The visual atlas separates inspectable SVG/HTML teaching models from the real Uno preview. The dirty-region lab additionally executes WGSL compute and rendering. The compute pass classifies each tile against expanded old and current bounds; an instanced draw renders its flags. A staging-buffer readback compares every GPU flag against the independent CPU calculation in `atlas/models.mjs`.

The ordinary interface tests exercise all eleven labs with the browser's default graphics configuration. The SVG reference, numerical readouts, generated code and explanation remain available when WebGPU is unavailable. There is no decorative Canvas 2D substitution presented as actual GPU output.

A separate test launches trusted course content with Chromium's software graphics options. It requires successful compute and render pipeline creation, queue submission and exact CPU parity at 32- and 16-unit tile sizes. After changing the scene, it waits for a newer verified revision rather than accepting an old success label. It fails on uncaptured GPU validation errors.

The software-adapter test validates shader/API execution and classification correctness. It is **not a physical GPU benchmark**, a measurement of the Uno renderer, or proof of performance on a particular learner's hardware. Readback exists for teaching and validation, not as a recommended production frame-loop design. Public-site checks use normal browser configuration; learners are not asked to enable experimental flags.

Screenshots, per-test attachments and the workflow result identify the exact revision tested. A configured test is not itself a passing test. See [visual-edition.md](visual-edition.md) for the scope of each explanatory model.
