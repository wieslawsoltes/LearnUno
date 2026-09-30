import test from 'node:test';
import assert from 'node:assert/strict';
import {commonControlLessons} from '../site/src/learning/interface-patterns/common-controls.mjs';

test('rich text separates an implemented inline exercise from the unavailable block renderer',()=>{
 const lesson=commonControlLessons.find(l=>l.id==='richtext-reading');
 assert.match(lesson.runtimeNote,/6\.7\.135.*unimplemented/);
 assert.match(lesson.projectNote,/Project-only/);
 assert.match(lesson.projectCode,/new RichTextBlock/);
 assert.doesNotMatch(lesson.code,/new RichTextBlock/);
 assert.match(lesson.code,/new Hyperlink/);
 assert.match(lesson.code,/FontSize = paragraph.FontSize/);
 assert.match(lesson.solution,/FontSize = 24/);
 assert.match(lesson.code,/Browser exercise: TextBlock.Inlines/);
 assert(lesson.references.some(url=>url.includes('/6.7.135/')&&url.endsWith('/RichTextBlock.cs')));
});
