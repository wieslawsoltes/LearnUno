import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../runtime/host/bridge.js', import.meta.url), 'utf8');
function createContext(hasExports = true) {
  const events = new Map(), messages = [], boot = {remove() { this.removed = true; }};
  const parent = {postMessage(message, origin) { messages.push({message, origin}); }};
  const context = vm.createContext({URLSearchParams, console, parent,
    location: {hash: '#channel=unit-test&parent=https%3A%2F%2Fexample.test'},
    document: {getElementById(id) { return id === 'boot' ? boot : {}; }},
    getDotnetRuntime: () => ({getAssemblyExports: async () => hasExports ? {LearnUnoRunner: {Bridge: {Request: async () => JSON.stringify({ok: true, result: 'actual-response'})}}} : {}})
  });
  context.window = context;
  context.addEventListener = (name, callback) => events.set(name, callback);
  vm.runInContext(source, context);
  return {context, events, messages, parent, boot};
}
test('a recoverable bootstrap rejection cannot poison later readiness', async () => {
  const c = createContext();
  c.events.get('unhandledrejection')({reason: new TypeError('Transient asset fetch failed')});
  assert.equal(c.messages[0].message.type, 'diagnostic');
  assert.equal(c.messages.some(item => item.message.type === 'error'), false);
  await c.context.learnUnoRuntimeReady();
  assert.equal(c.messages.at(-1).message.type, 'ready');
  assert(c.boot.removed);
  await c.events.get('message')({source: c.parent, origin: 'https://example.test', data: {protocol: 'learnuno:1', channel: 'unit-test', type: 'request', id: 7, payload: {method: 'schema'}}});
  assert.equal(c.messages.at(-1).message.payload.result, 'actual-response');
});
test('missing exports and explicit managed startup errors remain terminal', async () => {
  const c = createContext(false);
  await c.context.learnUnoRuntimeReady();
  assert.equal(c.messages.at(-1).message.type, 'error');
  assert.match(c.messages.at(-1).message.error, /did not expose/);
  c.context.learnUnoBootError('Managed initialization failed');
  assert.equal(c.messages.at(-1).message.error, 'Managed initialization failed');
});
test('runtime bridge rejects mismatched parent, origin and channel', async () => {
  const c = createContext();
  await c.context.learnUnoRuntimeReady();
  const data = {protocol: 'learnuno:1', channel: 'unit-test', type: 'request', id: 8, payload: {method: 'schema'}};
  const count = c.messages.length;
  await c.events.get('message')({source: {}, origin: 'https://example.test', data});
  await c.events.get('message')({source: c.parent, origin: 'https://attacker.invalid', data});
  await c.events.get('message')({source: c.parent, origin: 'https://example.test', data: {...data, channel: 'wrong'}});
  assert.equal(c.messages.length, count);
});
