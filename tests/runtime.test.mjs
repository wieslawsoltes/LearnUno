import test from 'node:test';
import assert from 'node:assert/strict';
import {UnoRuntime} from '../site/src/runtime.mjs';
function fixture(t) {
  const previous={window:globalThis.window,document:globalThis.document,location:globalThis.location};
  const listeners=new Set(),posted=[];
  const frame={attrs:{},setAttribute(k,v){this.attrs[k]=v;},remove(){this.removed=true;},contentWindow:{postMessage(message){posted.push(message);}}};
  globalThis.window={addEventListener(_,fn){listeners.add(fn);},removeEventListener(_,fn){listeners.delete(fn);}};
  globalThis.document={baseURI:'https://example.test/LearnUno/',createElement(){return frame;}};
  globalThis.location={origin:'https://example.test'};
  const runtime=new UnoRuntime({replaceChildren(){}});
  t.after(()=>{runtime.dispose();for(const[key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
  const send=(data,override={})=>runtime.receive({source:frame.contentWindow,origin:'null',data:{protocol:'learnuno:1',channel:runtime.channel,...data},...override});
  return{runtime,frame,posted,send,listeners};
}
test('preview transport validates sender, origin and channel before accepting readiness',async t=>{const f=fixture(t),ready=f.runtime.start();assert.equal(f.frame.attrs.sandbox,'allow-scripts');assert(f.frame.src.startsWith('https://example.test/LearnUno/runner/index.html#'));f.send({type:'ready'},{origin:'https://example.test'});f.send({type:'ready'},{source:{}});f.send({type:'ready',channel:'wrong'});assert.equal(f.runtime.ready,false);f.send({type:'ready'});await ready;assert.equal(f.runtime.ready,true);const pending=f.runtime.request({method:'schema'});await Promise.resolve();f.send({type:'response',id:f.posted[0].id,payload:{ok:true,result:{types:[]}}});assert.deepEqual(await pending,{types:[]});});
test('closing a booting preview rejects pending startup and removes its listener',async t=>{const f=fixture(t);const rejected=assert.rejects(f.runtime.start(),/closed/);f.runtime.dispose();await rejected;assert.equal(f.listeners.size,0);assert(f.frame.removed);});
test('a fatal preview error rejects in-flight and future operations',async t=>{const f=fixture(t);const ready=f.runtime.start();f.send({type:'ready'});await ready;const request=f.runtime.request({method:'schema'});const rejected=assert.rejects(request,/broken/);await Promise.resolve();f.send({type:'error',error:'broken'});await rejected;assert.equal(f.runtime.pending.size,0);await assert.rejects(f.runtime.request({method:'run'}),/broken/);});
