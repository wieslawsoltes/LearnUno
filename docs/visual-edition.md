# Visual edition — design and explanatory models

The visual edition replaces the generic four-box illustrations with a connected atlas of eleven different experiments. It preserves the 60 lessons, real Uno runtime, Roslyn/Monaco workspace, course progress, bookmarks, notes, reference library and project exports.

## Design

The interface uses a light navigation rail, a quiet neutral reading surface, teal structural colors, coral emphasis and restrained serif display type. The homepage's layered interface is interactive: selecting Interface, Layout or State reveals a different representation. It is labelled as a model, not a running Uno application.

The homepage now introduces actual visual labs, exposes all ten curriculum paths instead of only the first six, and separates the learning loop from the reference library. The new design applies to lessons, playgrounds, quizzes and reference views as well as the homepage. Dark mode, reduced-motion preference, skip navigation and mobile layouts remain supported. No remote fonts or new runtime dependencies were added.

## Eleven interactive labs

| Lab | What changes | What the learner inspects |
| --- | --- | --- |
| Layout | Container width, fixed/Auto requests, star weight, spacing, padding; draggable edge | Track rectangles, allocated widths, remaining star space, overflow and generated XAML |
| Binding | Source/target values, binding mode and notifications | Stale values, directionality, explicit rebind and a real model event trace |
| Visual tree | Object selection, card padding and title font size | Linked selection bounds, owner, properties and the corresponding markup |
| Box model | Margin, border, padding and bounded width | Nested regions and the remaining content equation |
| State machine | Valid actions such as load, complete, fail, cancel and retry | Legal transitions, current status and bounded history |
| Async races | Latencies, second-request start, policy and scrub time | Out-of-order completion, stale overwrite and latest-started request acceptance |
| Virtualization | Dataset, scroll offset, row height, viewport and overscan | Visible/realized ranges and deterministic reusable container slots |
| Invalidation | Changed property and equality guard | Modeled measure/arrange/presentation dependencies, not fabricated timings |
| Damage | Draggable object, size, effect extent and tile size | Old/new dirty regions, disjoint versus union costs and independently computed GPU flags |
| Easing | Curve, elapsed progress and travel distance | A scrubbed curve, linear/eased markers and exact scalar interpolation |
| Value precedence | Style/local/animated values and active layers | The effective source, ClearValue semantics and a linked text preview |

Every lab has phase narration, presets, reset, expansion, generated code, calculated readouts, a scope statement and a link to its connected real Uno playground. Lab selection is mapped to lesson semantics. Shared links contain validated, bounded inputs; they do not run arbitrary code. Downloaded inputs are explicit JSON snapshots, not a project bundle.

## Model correctness and scope

`site/src/atlas/models.mjs` contains pure deterministic models. Its tests exercise allocation conservation, nonnegative star sizing, bounded realization, unique pool slots, notification directionality, legal state transitions, race ordering, easing endpoints/monotonicity, value precedence and conservative dirty-region containment.

These are deliberately explicit teaching subsets. The Grid model does not implement spanning, min/max constraints or Uno's iterative measurement algorithm. The tree is not a live Uno visual inspector. The virtualization pool policy is not a claim about Uno's exact recycling strategy. Property precedence represents four selected layers, not the entire framework specification. Network latency and timeline values are inputs, never reported as measured timings.

The connected lessons retain their pinned upstream references. Relevant primary material includes the pinned Uno repository's `doc/articles/composition.md`, `doc/articles/features/working-with-animations.md`, layout/control implementation and tests, and Microsoft's XAML layout/property-system documentation. The imported library retains its original provenance and notices.

## Actual WebGPU work

`DamageGpu` runs a WGSL compute pass to classify each tile against the expanded old and current rectangles. A separate instanced draw pass renders the computed flags. A staging-buffer readback checks every output flag against the CPU reference. The canvas is GPU output; the larger SVG is the inspectable reference with the old/current/union overlays.

Requests are revisioned and coalesced so a stale readback cannot replace the newest verification status. Buffers, device and observers are disposed on navigation. Device loss, unavailable adapters and initialization failures preserve the SVG and text explanation. Readback is a validation aid for this lesson, not a recommended per-frame production design. The implementation follows the WebGPU specification's storage/uniform bindings, dispatch, copy and mapping contracts: https://www.w3.org/TR/webgpu/.

## Accessibility and lifecycle

The diagrams have equivalent calculated text and generated code. Pointer manipulation has labelled range-control alternatives. Tree objects are keyboard-selectable and keep focus after rerendering. Narrow displays scroll the diagram within its own region, without overflowing the document; controls and readouts stack beneath it. Expanded mode can be dismissed with Escape. Playback is opt-in, pauses when hidden/offscreen, honors reduced motion and stops on navigation. Clipboard failure offers a downloadable text alternative.

## Verification

Node tests cover the models and scene contracts. Playwright covers all eleven routes, direct manipulation, broken/repaired notification edges, state transitions, async races, shared inputs, keyboard focus, mobile overflow, reduced motion and dark mode. A software WebGPU test requires actual compute/render pipeline creation and exact reference parity at multiple tile sizes. The existing full Uno/Roslyn suite continues to gate deployment, and public-site checks run against the deployed Pages artifact.

Check the workflow and retained artifacts for the exact revision's results. Physical GPU performance and screen-reader behavior across every native target are not inferred from a browser or software-adapter test.
