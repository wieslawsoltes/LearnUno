# Fundamentals at application boundaries

The field guide now contains eighteen chapters. The original twelve keep their IDs, text and connected lessons. Six additional chapters explain boundaries that commonly confuse otherwise correct-looking app code:

| Chapter | Controlled comparison |
| --- | --- |
| Item and collection notifications | Renaming an item versus replacing the collection property |
| Focus as task state | An invalid explicit submit versus a background refresh that must not steal focus |
| Culture and typed values | Accepted localized input versus a formatted value that loses precision |
| Command observation | A now-true predicate without invalidation versus NotifyCanExecuteChanged |
| Resource/style/template responsibilities | Shared style changes versus a replacement template's interaction obligations |
| Asynchronous initialization | Rejecting an obsolete result versus beginning a real retry after failure |

Each new chapter contains four original explanation sections, a labelled code fragment, recall reasoning, a transfer exercise, a primary-documentation link and two scenario tables with distinct SVG illustrations. The cases are authored reasoning examples, not live Uno instrumentation. Their tables provide the accessible equivalent of the geometry. The illustrations do not autoplay, and selection uses keyboard-operable buttons with pressed state.

These additions are reading chapters, not six additional standalone C# projects. The connected existing core lessons provide actual runnable experiments. Grammar coloring preserves the fragment text; project-dependent members and surrounding types remain explicitly labelled. No new package is required by these guides.

The guide registry composes the original and new content. The reader is extended through a small adapter instead of duplicating its routing, recall, notes and code-rendering behavior. Event listeners are disposed with the view. Tests check all stable original guide objects, new lesson links, source escaping, meaningful scenario changes, distinct geometry, correct displayed count and mobile/dark-mode behavior.

The app-building release also fixes the real runtime's dependency graph; see `runtime-package-boundaries.md`. Neither a passing text contract nor a static diagram proves successful .NET execution. CI continues to restore the actual browser host, compile all executable core/workshop snippets and run the complete browser suite before deployment.
