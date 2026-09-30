import test from 'node:test';
import assert from 'node:assert/strict';
import {applicationGuides} from '../site/src/learning/application-guides.mjs';
import {guides as original} from '../site/src/learning/guides-core.mjs';
import {guides,guideMap} from '../site/src/learning/guides.mjs';
import {lessonMap} from '../site/src/course.mjs';
import {comparisonGeometry,renderGuideComparison} from '../site/src/learning/guide-comparisons.mjs';

test('six new fundamentals preserve all existing guide objects and stable routes',()=>{
 assert.equal(applicationGuides.length,6);assert.equal(guides.length,18);
 assert.deepEqual(guides.slice(0,12),original);
 assert.equal(guideMap.size,18);
});
for(const guide of applicationGuides)test('application fundamental: '+guide.id,()=>{
 assert(lessonMap.has(guide.lesson));assert.equal(guide.sections.length,4);
 assert(guide.sections.every(([title,text])=>title.length>8&&text.split(/\s+/).length>=50));
 assert.equal(guide.cases.length,2);assert(guide.cases.every(c=>c.rows.length===4));
 assert.equal(new URL(guide.source).hostname,'learn.microsoft.com');
 assert(guide.code.length>100);assert(guide.answer.length>100);
 assert.notEqual(comparisonGeometry(guide.id),comparisonGeometry(guide.id,true));
 for(let i=0;i<2;i++){
  const html=renderGuideComparison(guide,i);assert(html.includes('<caption>'));assert(html.includes('scope="row"'));
  assert(!/NaN|undefined|Infinity/.test(html));
 }
 assert.throws(()=>renderGuideComparison(guide,2),/Unknown/);
});
test('comparison rendering escapes content and uses distinct structural illustrations',()=>{
 const malicious={...applicationGuides[0],cases:[{label:'<script>x</script>',context:'<img src=x>',rows:[['<td>','<iframe>']]}]};
 const html=renderGuideComparison(malicious);assert(!html.includes('<script>'));assert(!html.includes('<img '));assert(!html.includes('<iframe>'));assert(html.includes('&lt;script&gt;'));
 const shapes=applicationGuides.map(g=>comparisonGeometry(g.id).replace(/<text[\s\S]*?<\/text>/g,''));
 assert.equal(new Set(shapes).size,6);
});
