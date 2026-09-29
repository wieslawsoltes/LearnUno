import test from 'node:test';
import assert from 'node:assert/strict';
import {AtlasPlayback,timelineForLab} from '../site/src/atlas/playback.mjs';
import {phaseOverlay} from '../site/src/atlas/phase-focus.mjs';
import {labs} from '../site/src/atlas/catalog.mjs';

function fixture(options={}) {
 let time=0,id=0;const pending=new Map(),updates=[];
 const player=new AtlasPlayback({now:()=>time,requestFrame:cb=>{pending.set(++id,cb);return id;},
   cancelFrame:id=>pending.delete(id),onUpdate:(state,reason)=>updates.push({state,reason}),...options});
 return {player,pending,updates,
   advance(ms){time+=ms;const callbacks=[...pending.values()];pending.clear();callbacks.forEach(cb=>cb(time));},
   elapse(ms){time+=ms;}};
}

test('play schedules one frame and pause preserves sub-step progress',()=>{
 const f=fixture(),p=f.player;p.play();p.play();assert.equal(f.pending.size,1);
 f.advance(1200);assert.equal(p.snapshot.position,1200);f.elapse(50);p.pause();
 assert.equal(p.snapshot.position,1250);assert.equal(f.pending.size,0);
 f.advance(20000);assert.equal(p.snapshot.position,1250);p.play();f.advance(450);
 assert.equal(p.snapshot.position,1700);assert.equal(f.pending.size,1);
});
test('manual next/previous/phase selection cancel playback and synchronize the clock',()=>{
 const f=fixture(),p=f.player;p.play();f.advance(600);p.next();
 assert.equal(p.snapshot.position,2600);assert.equal(p.snapshot.step,1);assert.equal(p.playing,false);
 f.advance(5000);assert.equal(p.snapshot.step,1);p.play();f.advance(400);assert.equal(p.snapshot.position,3000);
 p.seekStep(3);assert.equal(p.snapshot.step,3);assert.equal(f.pending.size,0);
 p.previous();assert.equal(p.snapshot.position,5200);p.previous();p.previous();p.previous();assert.equal(p.position,0);
});
test('next at last phase does not wrap; explicit restart preserves speed and loop options',()=>{
 const p=fixture().player;p.seekStep(3);p.next();assert.equal(p.snapshot.step,3);
 p.setSpeed(1.5);p.setLoop(true);p.restart();assert.equal(p.position,0);assert.equal(p.rate,1.5);assert(p.loop);
});
test('default playback reaches the exact end, holds it, and Replay starts at zero',()=>{
 const f=fixture(),p=f.player;p.play();f.advance(11000);
 assert.equal(p.position,10400);assert.equal(p.snapshot.step,3);assert(p.snapshot.completed);
 assert.equal(p.playing,false);assert.equal(f.pending.size,0);
 p.play();assert.equal(p.position,0);f.advance(100);assert.equal(p.position,100);
});
test('optional looping retains elapsed remainder and speed changes preserve position',()=>{
 const f=fixture(),p=f.player;p.setLoop(true);p.play();f.advance(10425);assert.equal(p.position,25);
 f.elapse(75);p.setSpeed(2);assert.equal(p.position,100);f.advance(200);assert.equal(p.position,500);
 p.setLoop(false);f.advance(10000);assert.equal(p.position,10400);assert.equal(f.pending.size,0);
});
test('suspension reasons compose, do not accumulate hidden time and schedule one callback on resume',()=>{
 const f=fixture(),p=f.player;p.play();f.advance(400);p.suspend('document',true);p.suspend('viewport',true);
 assert(p.playing);assert(!p.running);assert.equal(f.pending.size,0);f.elapse(60000);
 p.suspend('document',false);assert(!p.running);p.suspend('viewport',false);p.suspend('viewport',false);
 assert.equal(f.pending.size,1);f.advance(150);assert.equal(p.position,550);
});
test('explicit Pause while suspended overrides automatic resumption',()=>{
 const f=fixture(),p=f.player;p.play();f.advance(100);p.suspend('viewport',true);p.pause();
 p.suspend('viewport',false);assert.equal(f.pending.size,0);assert.equal(p.playing,false);assert.equal(p.position,100);
});
test('starting while offscreen records intent but schedules no work until visible',()=>{
 const f=fixture(),p=f.player;p.suspend('viewport',true);p.play();assert.equal(f.pending.size,0);
 f.elapse(1000);p.suspend('viewport',false);f.advance(200);assert.equal(p.position,200);
});
test('reduced motion cancels running frames without disabling manual stepping',()=>{
 const f=fixture(),p=f.player;p.play();f.advance(100);p.setAllowed(false);
 assert.equal(f.pending.size,0);assert.equal(p.play(),false);p.next();assert.equal(p.snapshot.step,1);
 p.setAllowed(true);assert.equal(p.playing,false);assert.equal(f.pending.size,0);
});
test('seek uses finite bounded input, is precise and stops the clock',()=>{
 const f=fixture(),p=f.player;p.play();p.seek(3891.25);assert.equal(p.position,3891.25);
 assert.equal(f.pending.size,0);p.seek(-10);assert.equal(p.position,0);p.seek(999999);assert.equal(p.position,p.duration);
 assert.throws(()=>p.seek(NaN),TypeError);assert.throws(()=>p.setSpeed(Infinity),TypeError);
});
test('same timestamp or stale timestamps cannot move playback backwards',()=>{
 const f=fixture(),p=f.player;p.play();f.advance(500);p.sample(400);p.sample(500);assert.equal(p.position,500);
});
test('elapsed time is frame-rate independent, including a slow visible frame',()=>{
 const a=fixture(),b=fixture();a.player.play();b.player.play();
 for(let i=0;i<60;i++)a.advance(20);b.advance(1200);
 assert.equal(a.player.position,b.player.position);assert.equal(a.player.position,1200);
});
test('a callback can pause or dispose without scheduling a second frame',()=>{
 const f=fixture();f.player.onUpdate=(_,reason)=>{if(reason==='frame')f.player.dispose();};
 f.player.play();f.advance(10);assert.equal(f.pending.size,0);assert(!f.player.playing);
});
test('disposal cancels pending callbacks and is idempotent',()=>{
 const f=fixture(),p=f.player;p.play();const callback=[...f.pending.values()][0];p.dispose();p.dispose();
 callback(999);p.play();p.seek(0);p.next();assert.equal(f.pending.size,0);assert.equal(f.updates.length,1);
});
test('invalid construction fails fast',()=>{
 for(const duration of [0,-1,NaN,Infinity])assert.throws(()=>new AtlasPlayback({duration}),RangeError);
 assert.throws(()=>new AtlasPlayback({steps:1}),RangeError);
});
test('continuous lab positions and manual phase seeks share one normalized timeline',()=>{
 for(const [id,value] of [['easing',35],['race',2000]]){
  const t=timelineForLab(id),p=fixture({duration:t.duration,position:value/t.max*t.duration}).player;
  assert.equal(Math.round(p.snapshot.progress*t.max),value);
  p.seekStep(2);assert.equal(p.snapshot.progress,.5);
 }
 assert.equal(timelineForLab('layout'),null);
});
for(const lab of labs)test('phase spotlight is finite and distinct for '+lab.id,()=>{
 const s={...lab.defaults,revision:0,trace:[],status:'idle',sequence:0};
 const outputs=lab.steps.map((_,step)=>phaseOverlay(lab,s,step));
 assert(outputs.every(o=>o.includes('<rect ')&&!/NaN|undefined|Infinity/.test(o)));
 assert.equal(new Set(outputs).size,4);
});
