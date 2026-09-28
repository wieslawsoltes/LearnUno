# Third-party notices

LearnUno is independent of Uno Platform and Microsoft. Names identify compatible technologies; no endorsement is implied.

| Component | Source | License / use |
| --- | --- | --- |
| Uno Platform | https://github.com/unoplatform/uno | Apache-2.0; UI runtime and imported documentation |
| Monaco Editor | https://github.com/microsoft/monaco-editor | MIT; browser code editor |
| DOMPurify | https://github.com/cure53/DOMPurify | Apache-2.0 OR MPL-2.0; Monaco's transitive HTML sanitizer, overridden to 3.4.16 |
| marked | https://github.com/markedjs/marked | MIT; Monaco's transitive Markdown rendering dependency |
| .NET and Roslyn | https://github.com/dotnet/roslyn | MIT; runtime and semantic compiler services |
| fflate | https://github.com/101arrowz/fflate | MIT; client-side project ZIP export, version 0.8.3 |
| esbuild | https://github.com/evanw/esbuild | MIT; build tooling |
| Playwright | https://github.com/microsoft/playwright | Apache-2.0; development/test tooling |

The reference library imports the Markdown documents physically present under `doc` at Uno revision `e1292e0d87f9d38c9f3a120c69f0200b3c0999c1`. Original LICENSE and NOTICE files are retained in the generated reference directory when present. External documentation repositories are linked, not silently included.

Original lesson prose, diagrams, coach logic, and site code are MIT-licensed. LearnUno's reference reader uses a small, escaped-markup renderer of its own; the separately bundled Monaco editor uses marked and DOMPurify internally. The committed npm lockfile records both direct and transitive dependencies. Dependency bundles retain their applicable license comments/files.

Fonts and other runtime assets distributed by Uno and Monaco remain subject to their respective package licenses. They are not original LearnUno artwork or a grant of trademark rights.
