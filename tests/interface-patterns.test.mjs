import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {interfaceLessons} from '../site/src/learning/interface-patterns/lessons.mjs';
import {featureLinks} from '../site/src/learning/interface-patterns/coverage.mjs';
import {lessons} from '../site/src/course.mjs';
import {validationLessons} from '../scripts/validation-lessons.mjs';
import {scanFeatures} from '../scripts/feature-survey.mjs';

test('design lessons cover eight different concrete control tasks',()=>{assert.equal(interfaceLessons.length,8);assert.equal(new Set(interfaceLessons.map(l=>l.id)).size,8);assert.equal(new Set(interfaceLessons.map(l=>l.code)).size,8);});
for(const l of interfaceLessons)test('design lesson content, challenge and primary links: '+l.id,()=>{assert.equal(l.steps.length,4);assert.equal(l.tips.length,3);for(const step of l.steps){assert(step.explanation.split(/\s+/).length>=60);assert(step.worked.length>80);assert(step.answer.length>50);}assert(l.code.includes('public static UIElement Build()'));assert(l.solution!==l.code);assert(l.rules.every(r=>l.solution.includes(r.contains)));assert(l.references.every(u=>new URL(u).protocol==='https:'));});
test('all compiler variants include independent workshops without altering core progress IDs',()=>{assert.equal(lessons.length,90);assert.equal(validationLessons.length,104);assert.equal(new Set(validationLessons.map(l=>l.id)).size,104);assert.equal(validationLessons.filter(l=>l.language==='csharp').length*2,174);});
test('feature learning routes resolve to authored content',()=>{for(const links of Object.values(featureLinks))for(const l of links){const id=l.href.split('/')[2];assert([...lessons,...interfaceLessons].some(x=>x.id===id),l.href);}});
test('feature survey counts distinct sample files, ignores comments and excludes generated declarations',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'learnuno-survey-'));
 try{
  const files={'src/Uno.UI/UI/Xaml/Controls/Button.cs':'public partial class Button {}','src/Uno.UI/Generated/Phantom.cs':'public class Phantom {}','src/SamplesApp/Example.xaml':'<Page><Button/><Button/><!-- <Phantom/> --></Page>','src/SamplesApp/Other.xaml':'<Page><mux:Button /></Page>','doc/articles/controls/Button.md':'# Button'};
  for(const [p,c]of Object.entries(files)){await mkdir(path.dirname(path.join(root,p)),{recursive:true});await writeFile(path.join(root,p),c);}
  const report=await scanFeatures(root,{repository:'unoplatform/uno',revision:'a'.repeat(40)});
  assert.equal(report.sampleFiles,2);assert.equal(report.features.length,1);assert.equal(report.features[0].sampleFiles,2);assert.equal(report.features[0].name,'Button');assert.equal(report.features[0].evidence[0].sha256.length,64);assert(!JSON.stringify(report).includes('Phantom'));
 }finally{await rm(root,{recursive:true,force:true});}
});
