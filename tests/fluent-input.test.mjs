import test from 'node:test';
import assert from 'node:assert/strict';
import {commonControlLessons} from '../site/src/learning/interface-patterns/common-controls.mjs';

const richText = commonControlLessons.find(lesson => lesson.id === 'richtext-reading');
for (const variant of ['code', 'solution']) test(`rich-text ${variant} exposes deliberate keyboard input in the pinned browser host`, () => {
  const code = richText[variant];
  assert.match(code, /link\.IsTabStop = true/);
  assert.match(code, /link\.KeyDown \+=/);
  assert.match(code, /Windows\.System\.VirtualKey\.Enter/);
  assert.match(code, /args\.Handled = true/);
  assert.match(code, /void ShowHelp\(\)/);
  assert.match(code, /link\.Click \+= \(_, _\) => ShowHelp\(\)/);
  assert.doesNotMatch(richText.projectCode, /link\.KeyDown/);
  assert.match(richText.runtimeBoundary.live, /browser-specific KeyDown/);
});
