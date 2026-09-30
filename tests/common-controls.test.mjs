import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {commonControlLessons} from '../site/src/learning/interface-patterns/common-controls.mjs';
import {captionBinding,collectionView,quantityDraft,reportCards} from '../site/src/learning/interface-patterns/common-models.mjs';
import {commonMockup} from '../site/src/learning/interface-patterns/common-mockups.mjs';
import {verifyControlEvidence} from '../scripts/control-study.mjs';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';

test('common-control lessons have distinct specimens, source contracts, and meaningful quizzes',()=>{
 assert.equal(commonControlLessons.length,4);assert.equal(new Set(commonControlLessons.map(l=>commonMockup(l))).size,4);
 for(const l of commonControlLessons){assert(l.sourceBacked);assert(l.steps.every(s=>s.explanation.split(/\s+/).length>=60));assert(l.solution!==l.code);assert(l.rules.every(r=>l.solution.includes(r.contains)));assert.equal(l.quiz.options.length,3);assert(l.prerequisites.length>=2);assert(l.code.includes('public static UIElement Build()'));}
 assert.deepEqual(commonControlLessons.map(l=>l.quiz.answer),[1,0,2,1]);
});
test('component model isolates internal source from host context and the second instance',()=>{
 const good=captionBinding('Changed host');assert.equal(good.caption,'Changed host');assert.equal(good.archive,'Archive');
 const bad=captionBinding('Changed host',true);assert.equal(bad.caption,'');assert.equal(bad.hostTitle,'Changed host');assert.equal(bad.bound,false);
 assert.equal(captionBinding('x'.repeat(200)).hostTitle.length,80);
});
test('selection reconciles by key, not position; missing selection does not choose a neighbor',()=>{
 assert.equal(collectionView(false,null,'doc-1').selectedKey,'doc-1');const reversed=collectionView(true,null,'doc-1');assert.equal(reversed.items[2].id,'doc-1');assert.equal(reversed.selectedKey,'doc-1');assert.equal(collectionView(true,'doc-2','doc-2').selectedKey,null);assert.deepEqual(reportCards.map(c=>c.id),['doc-1','doc-2','doc-3']);
});
for(const [text,kind] of [['','missing'],['  ','missing'],['zero','syntax'],['1e2','syntax'],['Infinity','syntax'],['2.5','fraction'],['0','range'],['-1','range'],['101','range'],['1','valid'],['2','valid'],['100','valid'],['3.0','valid']])test('quantity boundary: '+JSON.stringify(text),()=>{
 const r=quantityDraft(text);assert.equal(r.kind,kind);assert.equal(r.accepted,kind==='valid');if(r.accepted)assert(Number.isSafeInteger(r.value));
});
test('the solution tightens only the minimum, and invalid policy is rejected',()=>{assert.equal(quantityDraft('1',2).accepted,false);assert.equal(quantityDraft('2',2).accepted,true);assert.equal(quantityDraft('2.5',2).accepted,false);assert.throws(()=>quantityDraft('3',10,1),RangeError);});
test('excerpt verifier checks bytes, bounds, provenance and traversal',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'learnuno-common-'));const file='src/Test.cs';const code='first\nsecond\nthird\n';const sha=s=>createHash('sha256').update(s).digest('hex');
 try{await mkdir(path.join(root,'src'));await writeFile(path.join(root,file),code);const manifest={repository:'unoplatform/uno',revision:'a'.repeat(40),lessons:{sample:{path:file,start:2,end:2,fileSha256:sha(code),sha256:sha('second')}}};const result=await verifyControlEvidence(root,manifest);assert.equal(result.lessons.sample.code,'second');assert(result.lessons.sample.url.endsWith('#L2-L2'));await writeFile(path.join(root,file),code+'changed');await assert.rejects(verifyControlEvidence(root,manifest),/Source changed/);manifest.lessons.sample.path='src/../escape.cs';await assert.rejects(verifyControlEvidence(root,manifest),/Invalid source path/);}finally{await rm(root,{recursive:true,force:true});}
});
test('every new lesson is mapped to a reviewed pinned excerpt',async()=>{const map=JSON.parse(await readFile('site/content/control-study.json','utf8'));assert.deepEqual(Object.keys(map.lessons),commonControlLessons.map(l=>l.id));for(const v of Object.values(map.lessons)){assert.match(v.fileSha256,/^[a-f0-9]{64}$/);assert.match(v.sha256,/^[a-f0-9]{64}$/);assert(v.end>=v.start);assert(v.caption.length>80);assert(v.boundary.length>100);}});
