import test from 'node:test';
import assert from 'node:assert/strict';
import {commonControlLessons} from '../site/src/learning/interface-patterns/common-controls.mjs';

const richText = commonControlLessons.find(lesson => lesson.id === 'richtext-reading');
for (const variant of ['code', 'solution']) test(`rich-text ${variant} scopes its native inline input adapter to the pinned browser`, () => {
  const code = richText[variant];
  assert.match(code, /link\.IsTabStop = true/);
  assert.match(code, /OperatingSystem\.IsBrowser\(\) && \(object\)link is UIElement browserLink/);
  assert.match(code, /browserLink\.SetHtmlAttribute\("tabindex", "0"\)/);
  assert.match(code, /browserLink\.KeyDown \+=/);
  assert.match(code, /Windows\.System\.VirtualKey\.Enter/);
  assert.match(code, /args\.Handled = true/);
  assert.match(code, /void ShowHelp\(\)/);
  assert.match(code, /link\.Click \+= \(_, _\) => ShowHelp\(\)/);
  assert.doesNotMatch(code, /(?:paragraph|link)\.KeyDown \+=/);
  assert.doesNotMatch(code, /JSImport|JSExport|eval\(/);
  assert.doesNotMatch(richText.projectCode, /\.KeyDown|SetHtmlAttribute|browserLink/);
  assert.match(richText.runtimeBoundary.live, /runtime UIElement/);
});
