# Security and execution boundaries

## Threat model

LearnUno is a local educational playground on a public static host. A learner explicitly starts the runtime and runs edited code. There is no remote compilation service, backend account, or secret-bearing API needed for the course.

Do not paste or run code you do not trust. .NET code can use the browser capabilities available inside its sandbox, consume memory, start network requests permitted by browser policy, or fail to return. The frame is not a hard CPU/memory quota or a defense against an unknown browser/runtime vulnerability.

## Frame isolation

The preview iframe uses `sandbox="allow-scripts"` without `allow-same-origin`. It therefore has an opaque origin and cannot directly read the course’s origin-local progress or reach the parent DOM. It has no popup, top-navigation, form, or download sandbox permissions.

The parent checks the exact frame window, opaque-origin message origin, protocol, per-instance channel, and request ID. The child checks its parent window and expected parent origin. The wildcard destination is necessary when sending to an opaque origin; it is not used as a substitute for receiver validation.

Do not weaken the sandbox to fix a boot problem. If a runtime component expects unavailable storage, provide an explicitly documented sandbox-compatible implementation or remove that dependency.

## Source and content

The reference reader escapes raw HTML. Its small Markdown renderer only emits controlled markup and validates URL protocols. Unsupported DocFX directives remain readable or are inspected through the pinned upstream source. Course text, notes, imported data, and runtime error messages are escaped or assigned through text APIs.

The shell’s Content Security Policy restricts scripts, connections, workers, fonts, and frames to the intended sources. The separate runtime document requires the capabilities needed by the .NET bootstrapper and compiler. Neither page receives a deployment credential.

## Local state

Notes, drafts, bookmarks, and progress are not encrypted secrets. They live in browser-local storage and can be exported as a JSON file. Imports are versioned, constrained to known lesson IDs, and size-bounded. Clearing site data removes them. Avoid storing credentials in notes or examples.

## Availability and lifecycle

A long synchronous loop can stall the tab. A JavaScript request timeout cannot preempt code that blocks the same event loop. Resetting the preview releases the runtime instance when the browser can process the reset. Closing the tab may be necessary for non-returning code.

The runtime preserves reflection and compiler metadata, so its first-use download and memory use are materially larger than a small trimmed production app. Dynamic assemblies are bounded by a run-count limit and a full-frame reset.

## Supply chain and deployment

Use the committed npm lockfile and pinned .NET/Uno/Roslyn versions. The upstream documentation revision is fixed. Pull-request validation has read-only permissions; the Pages deployment job receives only the permissions it requires. Enabling a new Pages site may require an administrator-configured Pages token or a one-time repository setting; a normal Actions token is not a general repository-administration credential.

Do not include real service tokens, passwords, personal data, or proprietary application code in fixtures, screenshots, traces, or build logs.
