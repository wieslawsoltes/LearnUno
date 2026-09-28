import { chromium } from '@playwright/test';
import { cp, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const root = 'artifacts/runtime/wwwroot';
await cp('runtime/host', root, { recursive: true });
await writeFile(root + '/smoke-parent.html', '<!doctype html><html><body><iframe title="Uno" sandbox="allow-scripts" src="index.html#channel=smoke&parent=http%3A%2F%2Flocalhost%3A4191" style="width:800px;height:500px"></iframe><script src="smoke-parent.js"></script></body></html>');
await writeFile(root + '/smoke-parent.js', `window.messages=[]; window.addEventListener('message', e=>{if(e.source===document.querySelector('iframe').contentWindow)window.messages.push(e.data);}); window.request=payload=>new Promise((resolve,reject)=>{const id=crypto.randomUUID();const timer=setTimeout(()=>{window.removeEventListener('message',listener);reject(new Error('request timeout'));},90000);const listener=e=>{if(e.source===document.querySelector('iframe').contentWindow&&e.data?.id===id){clearTimeout(timer);window.removeEventListener('message',listener);resolve(e.data.payload);}};window.addEventListener('message',listener);document.querySelector('iframe').contentWindow.postMessage({protocol:'learnuno:1',channel:'smoke',type:'request',id,payload},'*');});`);
const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, SERVE_ROOT: root, PORT: '4191' }, stdio: 'inherit' });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1000, height: 700 } });
await context.addInitScript(() => {
  window.__bootEvents = [];
  addEventListener('unhandledrejection', event => { window.__bootEvents.push(String(event.reason?.stack || event.reason)); });
});
const page = await context.newPage();
const logs = [], network = [], pending = new Set();
page.on('console', message => logs.push(message.type() + ': ' + message.text()));
page.on('pageerror', error => logs.push('ERROR: ' + error.stack));
page.on('request', request => pending.add(request.url()));
page.on('requestfinished', request => { pending.delete(request.url()); network.push({ url: request.url(), status: 'finished' }); });
page.on('requestfailed', request => { pending.delete(request.url()); network.push({ url: request.url(), error: request.failure()?.errorText }); });
page.on('response', response => { if (response.status() >= 400) logs.push('HTTP ' + response.status() + ' ' + response.url()); });
await mkdir('artifacts/evidence', { recursive: true });
let failure;
try {
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.goto('http://localhost:4191/smoke-parent.html');
  await page.waitForFunction(() => window.messages.some(message => message.type === 'ready' || message.type === 'error'), {}, { timeout: 60000 });
  const messages = await page.evaluate(() => window.messages);
  console.log('BOOT', JSON.stringify(messages));
  assert(messages.some(message => message.type === 'ready'), 'Runtime must boot in an opaque-origin sandbox');
  const call = payload => page.evaluate(input => window.request(input), payload);
  const xaml = await call({ method: 'run', language: 'xml', code: '<TextBlock xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" Text="Actual Uno works" FontSize="32" />' });
  console.log('XAML', JSON.stringify(xaml)); assert.equal(xaml.result?.rendered, true);
  const code = 'using Microsoft.UI.Xaml; using Microsoft.UI.Xaml.Controls; public static class Lesson { public static UIElement Build() => new TextBlock { Text = "Actual Roslyn works" }; }';
  const csharp = await call({ method: 'run', language: 'csharp', code });
  console.log('CSHARP', JSON.stringify(csharp)); assert.equal(csharp.result?.rendered, true);
  const completionCode = 'using Microsoft.UI.Xaml.Controls; class X { void M() { var t = new TextBlock(); t. } }';
  const completion = await call({ method: 'complete', language: 'csharp', code: completionCode, position: completionCode.indexOf('t. }') + 2 });
  console.log('COMPLETION', JSON.stringify(completion).slice(0, 5000));
  assert(completion.result?.items.some(item => item.label === 'Text'), 'Semantic member completion must include Text');
  const diagnostics = await call({ method: 'diagnostics', language: 'csharp', code: code.replace('Text = "Actual Roslyn works"', 'Text = 123') });
  assert(diagnostics.result?.diagnostics.some(item => item.severity === 'Error'), 'Compiler must reject numeric Text');
  const schema = await call({ method: 'schema', language: 'xml', code: '' });
  assert(schema.result?.types.some(type => type.name === 'TextBlock'));
  console.log('PASS: sandbox boot, XAML, C# execution, semantic completion, diagnostics, XAML schema.');
} catch (error) {
  failure = error;
  console.error(error);
} finally {
  for (const frame of page.frames()) {
    try {
      const diagnostic = await frame.evaluate(() => ({
        url: location.href, readyState: document.readyState,
        runtimeRegistered: !!globalThis.getDotnetRuntime?.(0),
        runtimeKeys: Object.keys(globalThis.getDotnetRuntime?.(0) || {}),
        moduleKeys: Object.keys(globalThis.Module || {}),
        config: globalThis.config,
        rejected: globalThis.__bootEvents,
        requireDefined: Object.keys(globalThis.requirejs?.s?.contexts?._?.defined || {}),
        requirePending: Object.entries(globalThis.requirejs?.s?.contexts?._?.registry || {}).map(([key, value]) => ({ key, inited: value.inited, enabled: value.enabled, depCount: value.depCount, fetched: value.fetched, error: String(value.error || '') })),
        body: document.body.innerText.slice(0, 4000),
        messages: globalThis.messages
      }));
      logs.push(diagnostic);
    } catch (error) { logs.push('Diagnostic failure: ' + error.message); }
  }
  await writeFile('artifacts/evidence/runtime-console.json', JSON.stringify(logs, null, 2));
  await writeFile('artifacts/evidence/runtime-network.json', JSON.stringify({ pending: [...pending], requests: network }, null, 2));
  console.log('RUNTIME DIAGNOSTICS', JSON.stringify(logs, null, 2));
  await page.screenshot({ path: 'artifacts/evidence/runtime-final.png', fullPage: true, timeout: 5000 }).catch(() => {});
  await browser.close(); server.kill();
}
if (failure) throw failure;
