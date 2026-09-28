# LearnUno

An interactive, source-connected learning studio for Uno Platform: from your first XAML control to production architecture, rendering, WebAssembly, and framework internals.

**Course:** https://wieslawsoltes.github.io/LearnUno/

LearnUno is an independent educational project, not an official Uno Platform product. Course prose and illustrations are original. The reference library is generated from a pinned revision of `unoplatform/uno`, with upstream attribution and license notices retained.

## Learning by building

- Progressive learning paths with explanations, predictions, worked examples, guided challenges, quizzes, and capstones.
- Monaco editing with a lesson-aware coach and language services.
- A real, locally compiled Uno WebAssembly host for XAML and C# experiments; educational diagrams are explicitly separate from runtime previews.
- Interactive visual explanations and an optional WebGPU renderer, with accessible fallbacks and reduced-motion support.
- Searchable upstream documentation, source links, progress tracking, notes, bookmarks, and portable progress exports.

## Development

The site uses HTML, CSS, and JavaScript. The embedded runtime uses C# and Uno Platform. Node.js 22 and .NET 10 are required for a complete build. GitHub Actions builds and tests both parts before publishing to GitHub Pages.

See the repository documentation for architecture, course authoring, security boundaries, and validation results as implementation lands.
