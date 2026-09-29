import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {lessons} from '../site/src/course.mjs';
import {labMap, labForLesson} from '../site/src/atlas/catalog.mjs';
import {renderChapter, comparisonFor} from '../site/src/learning/chapters.mjs';
import {buildStudyMaterial, codeFences, sourceUrl} from '../scripts/study-material.mjs';
const lock = JSON.parse(fs.readFileSync('sources.lock.json', 'utf8'));
const selections = JSON.parse(fs.readFileSync('site/content/source-map.json', 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const authored = lessons.map(lesson => JSON.parse(fs.readFileSync(`site/content/chapters/${lesson.id}.json`, 'utf8')));

test('all ninety expanded chapters contain four substantial, distinct guided steps', () => {
  assert.equal(authored.length, 90);
  const explanations = new Set();
  for (const chapter of authored) {
    assert(chapter.scenario.split(/\s+/).length >= 35, chapter.id);
    assert.equal(chapter.vocabulary.length, 3);
    assert.equal(chapter.steps.length, 4);
    assert.equal(chapter.cases.length, 2);
    for (const step of chapter.steps) {
      for (const key of ['explain', 'worked', 'question', 'answer']) assert.equal(typeof step[key], 'string');
      assert((step.explain + ' ' + step.worked + ' ' + step.answer).split(/\s+/).length >= 90, chapter.id);
      assert(!explanations.has(step.explain), 'Repeated step: ' + chapter.id);
      explanations.add(step.explain);
    }
    assert(chapter.bridge.length > 140, chapter.id);
  }
  assert.equal(explanations.size, 360);
});
for (const lesson of lessons) test('expanded chapter source and rendering contract: ' + lesson.id, () => {
  const c = authored.find(c => c.id === lesson.id), sources = selections[lesson.id];
  assert(sources.documents.length >= 2, lesson.id);
  assert(sources.code.length >= 1, lesson.id);
  for (const entry of [...sources.documents, ...sources.code]) {
    assert(/^(doc|src)\//.test(entry.path));
    assert(!entry.path.includes('..'));
    assert.match(entry.expectedHash, /^[a-f0-9]{64}$/);
  }
  const lab = labMap.get(labForLesson(lesson));
  const html = renderChapter({...c, revision:lock.revision, repository:lock.repository, readingMinutes:5, documents:[],snippets:[],steps:c.steps.map((step,i)=>({...step,title:lab.steps[i][0],summary:lab.steps[i][1]}))}, lesson);
  assert.equal((html.match(/data-chapter-step=/g)||[]).length,4);
  assert.equal((html.match(/data-study-phase=/g)||[]).length,4);
  assert(html.includes('Chapter outline'));
  assert(html.includes(`#/lesson/${lesson.id}/playground`));
  assert(html.includes('study-variation-table'));
  assert(!html.includes('undefined'));
});

test('source snippets are exact pinned line/fence selections when the checkout is available', t => {
  const root=process.env.UNO_SOURCE||'.sources/uno';
  if (!fs.existsSync(path.join(root, 'doc'))) return t.skip('Pinned checkout is checked in the complete build.');
  let count=0;
  for (const selected of Object.values(selections)) {
    for (const d of selected.documents) assert.equal(sha(fs.readFileSync(path.join(root,d.path),'utf8')),d.expectedHash,d.path);
    for (const c of selected.code) {
      const raw=fs.readFileSync(path.join(root,c.path),'utf8');
      const text=c.path.endsWith('.md')?codeFences(raw)[c.fence].code:raw.replace(/^\uFEFF/,'').split(/\r?\n/).slice(c.startLine-1,c.endLine).join('\n');
      assert.equal(sha(text),c.expectedHash,c.path);count++;
    }
  }
  assert.equal(count,117);
});

test('code fence ranges preserve line numbers, language and longer outer fences',()=>{
 const blocks=codeFences('# Title\r\n\r\n```csharp\r\nvar x = 1;\r\n```\r\n\r\n~~~~xml\n<Panel />\n~~~~\n');
 assert.deepEqual(blocks.map(b=>[b.language,b.startLine,b.endLine,b.code]),[['csharp',4,4,'var x = 1;'],['xml',8,8,'<Panel />']]);
 const outer=codeFences('````markdown\n```xml\n<T />\n```\n````');assert.equal(outer.length,1);assert.equal(outer[0].code,'```xml\n<T />\n```');
});

test('pinned source URLs encode path segments and retain exact line references',()=>{
 const url=sourceUrl(lock,'src/sample folder/Foo.xaml',7,15);assert(url.includes('/'+lock.revision+'/src/sample%20folder/Foo.xaml#L7-L15'));
});

test('chapter renderer escapes authored text, upstream source and titles',()=>{
 const lesson=lessons[0],lab=labMap.get(labForLesson(lesson)),bad='<img src=x onerror="alert(1)">';
 const c={...authored[0],scenario:bad,revision:lock.revision,readingMinutes:5,documents:[],snippets:[{path:'src/x.cs',code:bad,language:'csharp',caption:bad,url:sourceUrl(lock,'src/x.cs',1,1),startLine:1,endLine:1,digest:'abc',codeHash:'def',kind:'Sample'}],steps:authored[0].steps.map((s,i)=>({...s,title:lab.steps[i][0]}))};
 const html=renderChapter(c,lesson);assert(!html.includes('<img'));assert(html.includes('&lt;img'));
});

test('strict study build emits all chapters with source provenance and no empty passages',async t=>{
 if(!fs.existsSync('.sources/uno/doc'))return t.skip('Complete CI build performs the pinned source check.');
 const output=fs.mkdtempSync(path.join(os.tmpdir(),'learnuno-study-'));t.after(()=>fs.rmSync(output,{recursive:true,force:true}));
 const result=await buildStudyMaterial({outputRoot:output,strict:true});
 assert.equal(result.lessons.length,90);assert.equal(result.steps,360);assert.equal(result.codeExcerpts,117);assert.equal(result.documentExcerpts,191);assert(result.authoredWords>42000);
 for(const lesson of lessons){const c=JSON.parse(fs.readFileSync(path.join(output,lesson.id+'.json'),'utf8'));assert.equal(c.revision,lock.revision);assert(c.documents.every(d=>d.markdown.trim()&&!d.markdown.trim().startsWith('```')));assert(c.snippets.every(s=>sha(s.code)===s.codeHash));}
});

test('every chapter comparison changes calculated model data or metrics',()=>{for(const lesson of lessons){const lab=labMap.get(labForLesson(lesson));assert(comparisonFor(lab),'No meaningful comparison: '+lesson.id);}});
