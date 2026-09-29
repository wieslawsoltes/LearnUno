import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../site/src/course.mjs';
import {labs,labMap,labForLesson,normalizeSettings} from '../site/src/atlas/catalog.mjs';
import {lessonLabs} from '../site/src/atlas/lessons/index.mjs';
import {scene} from '../site/src/atlas/scenes.mjs';
import {phaseOverlay} from '../site/src/atlas/phase-focus.mjs';
import {guides} from '../site/src/learning/guides.mjs';
import {renderLessonDepth} from '../site/src/learning/views.mjs';
const model=id=>lessonLabs.find(l=>l.lesson===id);
const run=(id,settings={})=>{const l=model(id);return l.run({...l.defaults,...settings});};
test('every lesson has its own model identity with no generic fallback',()=>{
 assert.equal(labs.length,90);assert.equal(lessonLabs.length,79);
 const ids=lessons.map(labForLesson);assert.equal(new Set(ids).size,90);
 for(const l of lessons)assert.equal(labMap.get(labForLesson(l)).lesson,l.id);
 assert.throws(()=>labForLesson({id:'missing-authoring'}),/no authored/);
});
for(const lab of lessonLabs)test('lesson-specific model: '+lab.lesson,()=>{
 const defaults={...lab.defaults},base=scene(lab,defaults);
 assert.equal(base.metrics.length,3);assert(lab.why.length>160);assert(lab.pitfall.length>90);assert(lab.steps.every(s=>s[1].length>25));
 assert(!/NaN|undefined|Infinity/.test(base.svg));assert(!base.svg.includes('<script'));assert(lab.run(defaults).data);
 for(let step=0;step<4;step++)assert(phaseOverlay(lab,defaults,step).includes('<rect'));
 let affected=false;
 for(const c of lab.controls){const alternatives=c.type==='range'?[c.min,c.max]:c.type==='toggle'?[!c.value]:c.type==='select'?c.options:['</text><script>injection()</script>'];for(const value of alternatives){const settings=normalizeSettings(lab,{...defaults,[c.key]:value});const out=scene(lab,settings);assert(!/NaN|undefined|Infinity/.test(out.svg),lab.id+' '+c.key);assert(!/<script[\s>]/i.test(out.svg));if(JSON.stringify(out.data)!==JSON.stringify(base.data))affected=true;}}
 assert(affected,'At least one authored input must change actual model data, not just the caption.');
});
test('all ninety deep dives have concrete lesson-specific content',()=>{
 for(const lesson of lessons){const html=renderLessonDepth(lesson);assert(html.includes(labMap.get(labForLesson(lesson)).challenge.replaceAll('&','&amp;').replaceAll('>','&gt;').replaceAll('<','&lt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));assert(html.includes('#/lesson/'+lesson.id+'/visualize'));}
});
test('fundamentals chapters have distinct substance, code and primary references',()=>{
 assert.equal(guides.length,18);assert.equal(new Set(guides.map(g=>g.id)).size,18);
 for(const g of guides){assert(g.sections.length>=3);assert(g.sections.every(s=>s[1].length>160));assert(g.code.length>100);assert(g.answer.length>70);assert(g.source.startsWith('https://learn.microsoft.com/'));assert(lessons.some(l=>l.id===g.lesson));}
});
test('reference/value assignments and captured subscriber reachability',()=>{
 assert.equal(run('csharp-essentials',{kind:'Reference object',value:7}).data.a,7);
 assert.equal(run('csharp-essentials',{kind:'Value struct',value:7}).data.a,3);
 assert.equal(run('events',{closed:true,subscribed:true}).data.retained,true);
 assert.equal(run('events',{closed:true,subscribed:false}).data.retained,false);
});
test('domain dependencies, independent template contexts and write-back policy',()=>{
 assert.deepEqual(run('change-notification',{quantity:5,notifyTotal:false}).data,{total:60,shown:24});
 assert.equal(run('change-notification',{quantity:5,notifyTotal:true}).data.shown,60);
 assert.deepEqual(run('data-templates',{items:3,selected:1,value:75}).data.values,[20,75,36]);
 assert.equal(run('two-way',{trigger:'On explicit save',commit:false,draft:'New'}).data.source,'Original title');
});
test('DI lifetimes, immutable history and typed document acceptance',()=>{
 assert.equal(new Set(run('dependency-injection',{lifetime:'Singleton',scopes:3,requests:4}).data.ids).size,1);
 assert.equal(new Set(run('dependency-injection',{lifetime:'Scoped',scopes:3,requests:4}).data.ids).size,3);
 assert.equal(new Set(run('dependency-injection',{lifetime:'Transient',scopes:3,requests:4}).data.ids).size,12);
 assert.equal(run('mvux',{edits:3,immutable:true}).data.history[0],0);
 assert.equal(run('mvux',{edits:3,immutable:false}).data.history[0],3);
 assert.equal(run('persistence',{schema:'Unknown',valid:true}).data.accepted,false);
});
test('HTTP gates and authorization remain independent of presentation',()=>{
 assert.equal(run('http-data',{httpStatus:'204'}).data.outcome,'Empty');
 assert.equal(run('http-data',{httpStatus:'200',json:false}).data.outcome,'Parse error');
 assert.equal(run('http-data',{httpStatus:'200',required:false}).data.outcome,'Contract error');
 for(const button of [false,true])assert.equal(run('authentication',{role:'Guest',button}).data.del,false);
});
test('layout and pixel coverage conserve their defined quantities',()=>{
 for(const zoom of [.5,1,1.5,3]){const s={screenX:320,origin:140,zoom};assert(Math.abs(run('pointer-input',s).data.local*zoom+s.origin-s.screenX)<1e-8);}
 for(const dpr of [1,1.5,2,3]){const r=run('assets-fonts',{dpr,width:1.5,offset:.25}).data;assert(Math.abs(r.coverage.reduce((a,b)=>a+b)-1.5*dpr)<1e-8);}
 for(let children=0;children<=6;children++)assert.equal(run('custom-panel',{children,gap:12,bug:false}).data.occupied,run('custom-panel',{children,gap:12,bug:false}).data.measured);
});
test('cache, profile and test gates compute results rather than decorative numbers',()=>{
 assert.equal(run('allocation-budget',{capacity:3,keys:5}).data.hits,0);
 assert.equal(run('allocation-budget',{capacity:5,keys:5}).data.hits,15);
 assert.equal(run('profiling',{outlier:80}).data.median,11);
 assert.equal(run('unit-tests',{maximum:8,bug:true}).data.failed,1);
 assert.equal(run('visual-regression',{shift:0}).data.changed,0);
 assert.equal(run('visual-regression',{shift:1}).data.changed,8);
});
test('namescope collisions and stable identities survive projections',()=>{
 assert.equal(run('xaml-pipeline',{templates:true,duplicate:true}).data.collision,false);
 assert.equal(run('xaml-pipeline',{templates:false,duplicate:true}).data.collision,true);
 assert.deepEqual(run('capstone-app',{complete:2,filter:'Completed',reverse:true}).data.ids,[2]);
});
