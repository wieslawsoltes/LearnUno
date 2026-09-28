# Build and deployment

## GitHub Actions

`ci.yml` builds and validates the source on pull requests and main. Main additionally deploys a verified Pages artifact and runs representative browser checks against the public URL.

The validation job installs pinned dependencies, imports the pinned Uno source, publishes the browser inner target, and asserts that actual `embedded.js` and WebAssembly files exist. It caches the runtime by the relevant source inputs. Compiler tests use a copy of the built runner assembly solely to read its embedded metadata references; that copy is outside the published `wwwroot`.

The course build refuses to publish without runtime and source material when `REQUIRE_RUNTIME=1` and `REQUIRE_SOURCES=1` are set. The Pages artifact is uploaded only after validation passes.

## Pages configuration

The repository must have GitHub Pages enabled with **GitHub Actions** as its build source. The configure action attempts enablement. For a repository where the normal Actions token cannot enable Pages, an administrator can either enable it once in repository settings or provide the narrowly scoped `PAGES_TOKEN` secret. No token is embedded in the website.

Public URL: `https://wieslawsoltes.github.io/LearnUno/`.

Fragment routes and relative assets support the repository subpath. The Uno iframe also derives its host URL relative to the course document. Test the public deployment: a local root-path test alone is not sufficient.

## Evidence

Validation artifacts include compiler output, runtime console logs, screenshots, per-lab results, and Playwright traces/reports where available. Public-site artifacts are separate from local build evidence. Keep those distinctions when describing a release.

`build.json` identifies the source commit, build time, runner availability, lesson/track counts, and pinned source snapshot. A workflow in progress is not a completed deployment.

## Static hosting

The generated `dist` directory is static. A custom host must serve JavaScript with the correct MIME type and WebAssembly as `application/wasm`. The opaque-origin runtime frame requires appropriate cross-origin access to its public bootstrap assets; GitHub Pages supplies public asset CORS headers. Do not add same-origin frame permission merely to hide a hosting misconfiguration.

## Source normalization

The one-time normalization workflow repairs specifically asserted source-string escaping and commits the generated dependency lock. It is not a production runtime dependency or an arbitrary code-execution API. Its resulting commit is validated separately so build provenance points to the repaired source.
