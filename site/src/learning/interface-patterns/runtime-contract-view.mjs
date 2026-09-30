import {escapeHtml as h,safeUrl} from '../../helpers.mjs';
const sourceHref=value=>h(safeUrl(value,'https://github.com/'));

/** Authored metadata only. No runtime feature guessing or raw source execution. */
export function renderRuntimeBoundary(lesson) {
  const boundary = lesson.runtimeBoundary;
  if (!boundary) return '';
  return `<section class="cc-runtime-boundary" role="note" aria-label="Runtime implementation boundary">
    <span class="eyebrow">TARGET / VERSION / OBSERVABLE BEHAVIOR</span>
    <h2>${h(boundary.title)}</h2>
    <p><strong>${h(boundary.runner)}</strong></p>
    <p>${h(boundary.summary)}</p>
    <details><summary>Why the two examples are different</summary>
      <div class="cc-runtime-choices">
        <div><h3>Runs in this playground</h3><p>${h(boundary.live)}</p></div>
        <div><h3>Requires a supported project target</h3><p>${h(boundary.project)}</p></div>
      </div>
      <p>${h(boundary.reason)}</p>
      <a href="${sourceHref(boundary.sourceUrl)}" target="_blank" rel="noopener noreferrer">Inspect the runner-version RichTextBlock implementation ↗</a>
      <a href="${sourceHref(boundary.hyperlinkUrl)}" target="_blank" rel="noopener noreferrer">Inspect the actual browser Hyperlink implementation ↗</a>
      <p class="cc-draft-note">${h(boundary.draftNote)}</p>
    </details>
  </section>`;
}
