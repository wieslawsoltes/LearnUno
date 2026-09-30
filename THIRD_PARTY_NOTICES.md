# Third-party notices

LearnUno is independent of Uno Platform and Microsoft. Names identify compatible technologies; no endorsement is implied.

| Component | Source | License / use |
| --- | --- | --- |
| Uno Platform | https://github.com/unoplatform/uno | Apache-2.0; UI runtime and imported documentation |
| Monaco Editor | https://github.com/microsoft/monaco-editor | MIT; browser code editor |
| highlight.js 11.12.0 | https://github.com/highlightjs/highlight.js | BSD-3-Clause; locally bundled syntax grammars and worker coloring |
| DOMPurify | https://github.com/cure53/DOMPurify | Apache-2.0 OR MPL-2.0; Monaco transitive sanitizer, overridden to 3.4.16 |
| marked | https://github.com/markedjs/marked | MIT; Monaco transitive Markdown dependency |
| CommunityToolkit.Mvvm 8.4.0 | https://github.com/CommunityToolkit/dotnet | MIT; actual observable objects, commands, validation and messaging in the app-building runner |
| Microsoft.Extensions.DependencyInjection and Options 10.0.12 | https://github.com/dotnet/runtime | MIT; actual service container and typed options in app-building examples |
| .NET and Roslyn | https://github.com/dotnet/roslyn | MIT; runtime and semantic compiler services |
| fflate 0.8.3 | https://github.com/101arrowz/fflate | MIT; client-side project ZIP export |
| esbuild | https://github.com/evanw/esbuild | MIT; build tooling |
| Playwright | https://github.com/microsoft/playwright | Apache-2.0; test tooling |

The reference library imports Markdown physically present under `doc` at Uno revision `e1292e0d87f9d38c9f3a120c69f0200b3c0999c1`. Original LICENSE and NOTICE files are retained in the generated reference directory when present. External documentation repositories are linked, not silently included.

Original lesson prose, diagrams, models, coach logic and site code are MIT-licensed. The reference renderer escapes raw HTML. Code coloring produces escaped token spans through highlight.js and never executes snippets. Monaco separately uses marked and DOMPurify internally. The committed lockfile records direct and transitive dependencies.

The published build retains highlight.js's complete license at `third-party/highlight.js-LICENSE.txt`; dependency bundles retain applicable license comments/files. The custom WGSL grammar and site adapter are original LearnUno code.

Fonts and runtime assets distributed by Uno and Monaco remain subject to their package licenses. They are not original LearnUno artwork or a grant of trademark rights.
