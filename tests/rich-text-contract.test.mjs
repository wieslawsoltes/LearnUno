import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {commonControlLessons} from '../site/src/learning/interface-patterns/common-controls.mjs';
import {richTextRuntimeBoundary} from '../site/src/learning/interface-patterns/rich-text-contract.mjs';
import {renderRuntimeBoundary} from '../site/src/learning/interface-patterns/runtime-contract-view.mjs';
import {createProjectFiles} from '../site/src/export.mjs';
import {colorCode} from '../site/src/coloring/engine.mjs';

const lesson=commonControlLessons.find(l=>l.id==='richtext-reading');
function textOf(html) {
  return html.replace(/<\/?span\b[^>]*>/g,'').replace(/&(?:amp|lt|gt|quot|#x27|#39);/g,
    s=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#x27;':"'",'&#39;':"'"}[s]));
}
for(const variant of ['code','solution'])test(`live rich-text ${variant} uses implemented Uno controls, not a silent stub`,()=>{
 const source=lesson[variant];
 assert.match(source,/new TextBlock/);assert.match(source,/new Hyperlink\(\)/);
 assert.match(source,/paragraph\.Inlines\.Add\(link\)/);
 assert.match(source,/link\.Click \+=/);
 assert.doesNotMatch(source,/new RichTextBlock\b|new Paragraph\b|XamlReader\.Load|JSImport|JSExport/);
 assert.match(source,/root\.Children\.Add\(reminder\)/);
 assert.match(source,/FontSize = paragraph\.FontSize/);
 assert.match(source,/Browser exercise: TextBlock.Inlines/);
 assert.equal(textOf(colorCode(source,'csharp').html),source);
});
test('the complete RichTextBlock equivalent remains explicitly project-only',()=>{
 assert.match(lesson.projectCode,/new RichTextBlock/);assert.match(lesson.projectCode,/new Paragraph\(\)/);
 assert.match(lesson.projectCode,/rich\.Blocks\.Add\(reminder\)/);
 assert.match(lesson.projectNote,/Project-only/);
 assert.equal(textOf(colorCode(lesson.projectCode,'csharp').html),lesson.projectCode);
 assert.match(lesson.runtimeBoundary.reason,/Uno\.NotImplemented/);
 assert.match(lesson.runtimeBoundary.sourceUrl,/\/blob\/6\.7\.135\//);
 assert.match(lesson.runtimeBoundary.sourceBlob,/^[a-f0-9]{40}$/);
 assert.match(lesson.steps[0].explanation,/Uno 6\.7\.135/);
});
for(const variant of ['code','solution'])test(`export isolates project-only rich text from the ${variant} browser build`,()=>{
 const files=createProjectFiles(lesson,lesson[variant]);
 assert.equal(files['Lesson.cs'],lesson[variant]);
 assert.equal(files['ProjectExample.txt'],lesson.projectCode+'\n\n'+lesson.projectNote);
 assert.doesNotMatch(files['Lesson.cs'],/new RichTextBlock/);
 assert.equal(Object.keys(files).filter(name=>name.endsWith('.cs')).length,2);
 assert.match(files['Program.cs'],/Lesson\.Build\(\)/);
});
test('implementation cards are absent for unaffected lessons',()=>{
 for(const l of commonControlLessons.filter(l=>l!==lesson)){
  assert.equal(renderRuntimeBoundary(l),'');
 }
 assert.equal(lesson.rules.every(rule=>lesson.solution.includes(rule.contains)),true);
});
test('target-boundary prose is escaped and executable URL schemes are rejected',()=>{
 const hostile='</code><img src=x onerror="alert(1)"><script>bad()</script>&';
 const rendered=renderRuntimeBoundary({...lesson,runtimeBoundary:{...richTextRuntimeBoundary,title:hostile,live:hostile,sourceUrl:'javascript:bad()',hyperlinkUrl:'data:text/html,bad'}});
 assert.doesNotMatch(rendered,/<(?:script|img)\b/i);
 assert.doesNotMatch(rendered,/href="(?:javascript:|data:)/);
 assert.match(rendered,/&lt;script&gt;/);
});
test('upstream sample caption does not claim support in the older runner',async()=>{
 const manifest=JSON.parse(await readFile('site/content/control-study.json','utf8'));
 assert.match(manifest.lessons['richtext-reading'].boundary,/6\.7\.135/);
 assert.match(manifest.lessons['richtext-reading'].boundary,/project-only/);
 assert.match(manifest.lessons['richtext-reading'].boundary,/TextBlock\.Inlines/);
});
