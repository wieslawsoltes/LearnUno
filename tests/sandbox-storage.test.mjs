import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(new URL('../runtime/host/sandbox-storage.js',import.meta.url),'utf8');
function instance(){const context=vm.createContext({DOMException});vm.runInContext(script,context);return context;}
test('ephemeral settings support Uno named-key existence and the Storage methods',()=>{const {localStorage:s}=instance();assert.equal(s.length,0);assert.equal(s.getItem('unknown'),null);s.setItem('__Uno.test','value');assert(s.hasOwnProperty('__Uno.test'));assert.equal(s.getItem('__Uno.test'),'value');assert.equal(s.key(0),'__Uno.test');assert.deepEqual(Object.keys(s),['__Uno.test']);s.a=42;assert.equal(s.getItem('a'),'42');delete s.a;assert.equal(s.length,1);s.setItem('__proto__','harmless');assert.equal(s.getItem('__proto__'),'harmless');assert(s.hasOwnProperty('__proto__'));s.clear();assert.equal(s.length,0);});
test('settings quota is bounded and a rejected write is atomic',()=>{const {localStorage:s}=instance();s.setItem('safe','kept');assert.throws(()=>s.setItem('large','x'.repeat(1024*1024)),e=>e.name==='QuotaExceededError');assert.equal(s.length,1);assert.equal(s.getItem('safe'),'kept');s.removeItem('safe');assert.equal(s.length,0);});
test('settings are never shared across frames or local/session stores',()=>{const a=instance(),b=instance();a.localStorage.setItem('k','secret');assert.equal(a.sessionStorage.getItem('k'),null);assert.equal(b.localStorage.getItem('k'),null);});
