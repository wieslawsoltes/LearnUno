# UI design labs

The new `#/design-labs` section teaches common UI decisions with four authored steps, a working situation and recall reasoning for each step, three design checkpoints per lesson, and a connected real-Uno exercise. It preserves core lesson IDs and progress. The existing `#/workshops` section contains six data-workspace workshops.

## Reading and source evidence

The eight design lessons cover bounded scrolling, independent/exclusive choices, commands, status with retained content, keyboard forms, responsive details, images and theme/density. They provide official API/design references and lazy links to exact implementation/sample files in the generated feature inventory. The source inventory is provenance, not a claim that a declaration is implemented on every renderer or version.

## Mockup boundaries

The inspectable preview is labelled **HTML design mockup — not Uno**. It demonstrates layout and task ownership with actual HTML input, selection, scrolling and form validation. It is not a substitute for the Uno sample, source/target checks or native accessibility tests. No network operation is simulated as a successful real request, and no percentage is reported as a measured completion time.

The form preserves rejected text and focuses its labelled field after submit. Adaptive detail preserves selection and draft during width changes. Menu examples demonstrate command discoverability without imposing incomplete ARIA menu semantics. Image fixtures are original, tiny, deterministic PNGs embedded in the code. Preview width, text scale and density are inspection inputs, not detection of physical device characteristics.

Large-scale text can intentionally exceed a particular design constraint; the bounded preview region allows that problem to be inspected without overflowing the course document. The preferred lesson outcome is a clear task and an explicit tradeoff, not a guaranteed score for using a particular spacing number.

## Storage and lifecycle

Editor drafts use `learnuno.interface-pattern-drafts.v1`, separate from core progress and data-workspace drafts. Only known lesson IDs and bounded strings are loaded. Navigation disposes the underlying Uno/Monaco workspace. Source-fetch responses are ignored when the view has been disposed. Mockups do not run animation timers, change global themes or persist app settings.

## Testing

The source tests validate content contracts, model/lesson identifiers, coverage links, source-scan behavior and the full compiler matrix. Browser tests exercise all eight reading/mockup/recall paths, focus and correction, selection and input preservation, small-screen overflow, source coverage gaps and all sixteen actual Uno variants. The release pipeline's result is the authority for verified behavior.
