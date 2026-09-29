import test from 'node:test';
import assert from 'node:assert/strict';
import {labs,normalizeSettings,labForLesson} from '../site/src/atlas/catalog.mjs';
import {lessons} from '../site/src/course.mjs';
import {scene} from '../site/src/atlas/scenes.mjs';
import {gridLayout,boxGeometry,visibleRange,bindingTransition,rebind,effectiveValue,easing,raceState,stateTransition,damageTiles} from '../site/src/atlas/models.mjs';

test('sixty distinct visual labs cover every existing lesson',()=>{assert.equal(labs.length,60);assert.equal(new Set(labs.map(l=>l.id)).size,60);for(const lesson of lessons)assert(labs.some(l=>l.id===labForLesson(lesson)));});
for(const lab of labs)test('render contract and bounded shared inputs: '+lab.id,()=>{
 const s={...lab.defaults,revision:0,trace:[],status:'idle',sequence:0};
 const result=scene(lab,s);
 assert(!/NaN|undefined|Infinity/.test(result.svg),lab.id);
 assert.equal(result.metrics.length,3);assert(result.code.length>40);assert(result.readout);assert(lab.scope.length>120);assert.equal(lab.steps.length,4);
 assert.deepEqual(normalizeSettings(lab,{...lab.defaults,unknown:'<script>',__proto__:{evil:true}}),lab.defaults);
 for(const c of lab.controls)if(c.type==='range'){const parsed=normalizeSettings(lab,{[c.key]:Infinity});assert.equal(parsed[c.key],c.value);const high=normalizeSettings(lab,{[c.key]:1e99});assert.equal(high[c.key],c.max);}
});
test('Grid allocation conserves space and reports overflow rather than negative stars',()=>{
 const s=labs[0].defaults;const m=gridLayout(s);assert.equal(m.remainder,492);assert.deepEqual(m.sizes,[120,104,164,328]);
 const narrow=gridLayout({...s,width:360,fixed:240});assert.equal(narrow.overflow,68);assert.deepEqual(narrow.sizes.slice(2),[0,0]);
 for(let width=320;width<=1280;width+=13)for(let weight=1;weight<=5;weight++){const v=gridLayout({...s,width,weight});assert(v.sizes.every(n=>n>=0));assert(Math.abs(v.sizes.reduce((a,b)=>a+b,0)+s.gap*3+s.padding*2-width-v.overflow)<1e-8);}
});
test('uniform padding changes both sides of content width',()=>{const s={width:520,margin:24,border:4,padding:32};assert.equal(boxGeometry(s).content,400);assert.equal(boxGeometry({...s,padding:48}).content,368);});
test('notification enablement does not replay a missed event',()=>{
 const s={source:'A',target:'A',mode:'OneWay',notify:false,revision:0};const changed=bindingTransition(s,'source','B');assert.equal(changed.target,'A');assert.equal({...changed,notify:true}.target,'A');assert.equal(rebind(changed).target,'B');assert.equal(bindingTransition({...changed,notify:true},'source','C').target,'C');
});
test('TwoWay writes back; OneTime does not observe later source assignments',()=>{const s={source:'A',target:'A',mode:'TwoWay',notify:true,revision:0};assert.equal(bindingTransition(s,'target','B').source,'B');assert.equal(bindingTransition({...s,mode:'OneTime'},'source','C').target,'A');});
test('removing a local entry reveals the style, assigning default does not',()=>{const s={defaultValue:14,styleValue:24,localValue:14,hasLocal:true,animated:false,animationValue:32};assert.equal(effectiveValue(s).winner.id,'local');assert.equal(effectiveValue({...s,hasLocal:false}).winner.value,24);assert.equal(effectiveValue({...s,animated:true}).winner.value,32);});
test('race fixture reproduces and prevents stale completion overwrite',()=>{const s={a:1800,b:400,secondAt:300,time:2000,latestOnly:false};assert.equal(raceState(s).result.id,1);assert.equal(raceState(s).stale,true);assert.equal(raceState({...s,latestOnly:true}).result.id,2);assert.equal(raceState({...s,latestOnly:true}).stale,false);});
test('state machine rejects illegal actions and bounds its event history',()=>{let s={status:'idle',sequence:0,trace:[]};assert.equal(stateTransition(s,'success'),s);s=stateTransition(s,'load');s=stateTransition(s,'cancel');assert.equal(s.status,'cancelled');for(let i=0;i<20;i++){s=stateTransition(s,'load');s=stateTransition(s,'fail');s=stateTransition(s,'retry');s=stateTransition(s,'success');}assert(s.trace.length<=6);});
test('virtualization bounds realization and does not duplicate pool slots',()=>{
 const base={count:5000,offset:0,rowHeight:40,viewport:240,overscan:2};
 assert.equal(visibleRange(base).realized,8);
 for(let offset=0;offset<200000;offset+=177){const r=visibleRange({...base,offset});assert(r.realized<=r.capacity);assert.equal(new Set(r.rows.map(r=>r.slot)).size,r.rows.length);assert(r.first>=0&&r.last<5000);assert(r.rows.every(row=>row.slot>=0&&row.slot<r.capacity));}
 assert.equal(visibleRange({...base,offset:999999}).last,4999);
});
test('cubic easing endpoints and monotonicity',()=>{for(const kind of ['linear','ease-in','ease-out','ease-in-out']){assert.equal(easing(0,kind),0);assert.equal(easing(1,kind),1);for(let i=1;i<=100;i++)assert(easing(i/100,kind)>=easing((i-1)/100,kind));}assert.equal(easing(.25,'ease-in'),.015625);});
test('disjoint damage is contained by the bounding union but often much smaller',()=>{const a={x:440,y:208,size:112,stroke:8,tile:32};const m=damageTiles(a);assert(m.dirty<m.unionCount);for(const c of m.cells)if(c.flag)assert(c.union);for(const tile of [16,32,64])for(const x of [0,128,250,500]){const r=damageTiles({...a,tile,x});assert(r.dirty>0&&r.dirty<=r.cells.length);assert.equal(r.cells.length,r.cols*r.rows);assert(r.cells.every(c=>c.flag>=0&&c.flag<=3));}});
