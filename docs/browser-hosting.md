# Relocatable BrowserEmbedded hosting

Uno's generated `embedded.js` locates its package relative to its script URL. In the pinned bootstrapper, `uno-config.js` nevertheless contains root-absolute RequireJS dependencies. Copying the output below `/runner/` or a GitHub Pages repository path can therefore load .NET correctly while failing to load the UI scripts.

The static build normalizes only that generated configuration. `scripts/relocate-runtime.mjs` resolves package dependencies relative to the configuration module's own `import.meta.url` and updates the web-app base path used for assets. It preserves nested dependency paths, rejects unexpected dependencies outside the original package, and updates precompressed configuration variants if present.

Unit tests cover root, embedded, and GitHub Pages-style subpaths. Browser tests execute the actual site under its `/runner/` path, and the post-deployment job exercises the public `/LearnUno/` URL. This is asset relocation, not an iframe permission change: the preview still has an opaque origin and ephemeral settings.

The raw runtime smoke test also verifies the original root-hosted output independently. This keeps compilation/runtime defects distinguishable from static-host packaging defects.
