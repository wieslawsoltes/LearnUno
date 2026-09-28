# Graphics validation

The explanatory canvas has two implementations. Its WebGPU path builds real WGSL compute and render pipelines, updates a storage buffer, and submits instanced rendering commands. The Canvas 2D path preserves the same teaching role when no adapter is available. Labels and interaction remain HTML in both cases.

The ordinary interface test runs with the browser's default graphics configuration and accepts the supported fallback. A separate test launches trusted local course content with Chromium's software graphics options, requires the WebGPU backend label, observes successful compute/render pipeline creation and queue submission, and fails on uncaptured GPU validation errors.

This software-adapter test validates shader and API execution. It is **not a physical GPU benchmark**, a measurement of the Uno renderer, or proof of performance on a particular learner's hardware. Public-site checks use the browser's normal configuration; no learner is asked to enable unsafe browser flags.

Inspect the workflow result and attached evidence for the current revision before asserting that either path passed. A configured test is not itself a passing test.
