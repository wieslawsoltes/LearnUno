import { chromium } from '@playwright/test';
import { cp,writeFile,mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const root='artifacts/runtime/wwwroot';
await cp('runtime/host',root,{recursive:true});
await writeFile(root+'/smoke-parent.html','<!doctype html><html><body><iframe title="Uno" sandbox="allow-scripts" src="index.html#channel=smoke&parent=http%3A%2F%2Flocalhost%3A4191" style="width:800px;height:500px"></iframe><script src="smoke-parent.js"></script></body></html>');
await writeFile(root+'/smoke-parent.js',`window.messages=[]; window.addEventListener('message', e=>{if(e.source===document.querySelector('iframe').contentWindow){window.messages.push(e.data);}}); window.request=payload=>new Promise((resolve,reject)=>{const id=crypto.randomUUID(); const timer=setTimeout(()=>reject(new Error('request timeout')),90000); const listener=e=>{if(e.data?.id===id){clearTimeout(timer);window.removeEventListener('message',listener);resolve(e.data.payload);}};window.addEventListener('message',listener);document.querySelector('iframe').contentWindow.postMessage({protocol:'learnuno:1',channel:'smoke',type:'request',id,payload},'*');});`);
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,SERVE_ROOT:root,PORT:'4191'},stdio:'inherit'});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1000,height:700}});const logs=[];page.on('console',m=>logs.push(m.type()+': '+m.text()));page.on('pageerror',e=>logs.push('ERROR: '+e.message));
await mkdir('artifacts/evidence',{recursive:true});
try{
 await new Promise(r=>setTimeout(r,1000));await page.goto('http://localhost:4191/smoke-parent.html');
 await page.waitForFunction(()=>window.messages.some(m=>m.type==='ready'||m.type==='error'),{},{timeout:120000});
 const messages=await page.evaluate(()=>window.messages);console.log('BOOT',JSON.stringify(messages));assert(messages.some(m=>m.type==='ready'),'Runtime must boot in an opaque-origin sandbox');
 const call=payload=>page.evaluate(p=>window.request(p),payload);
 const xaml=await call({method:'run',language:'xml',code:'<TextBlock xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" Text="Actual Uno works" FontSize="32" />'});console.log('XAML',JSON.stringify(xaml));assert.equal(xaml.result?.rendered,true);
 const code='using Microsoft.UI.Xaml; using Microsoft.UI.Xaml.Controls; public static class Lesson { public static UIElement Build() => new TextBlock { Text = "Actual Roslyn works" }; }';
 const csharp=await call({method:'run',language:'csharp',code});console.log('CSHARP',JSON.stringify(csharp));assert.equal(csharp.result?.rendered,true);
 const completionCode='using Microsoft.UI.Xaml.Controls; class X { void M() { var t = new TextBlock(); t. } }';
 const completion=await call({method:'complete',language:'csharp',code:completionCode,position:completionCode.indexOf('t. }')+2});console.log('COMPLETION',JSON.stringify(completion).slice(0,4000));assert(completion.result?.items.some(i=>i.label==='Text'),'Semantic member completion must include Text');
 const diagnostics=await call({method:'diagnostics',language:'csharp',code:code.replace('Text = "Actual Roslyn works"','Text = 123')});assert(diagnostics.result?.diagnostics.some(d=>d.severity==='Error'),'Real compiler must reject numeric Text');
 const schema=await call({method:'schema',language:'xml',code:''});assert(schema.result?.types.some(t=>t.name==='TextBlock'));
 await page.screenshot({path:'artifacts/evidence/runtime.png',fullPage:true});console.log('PASS: sandbox boot, XAML, C# execution, semantic completion, diagnostics, reflected XAML schema.');
}finally{await writeFile('artifacts/evidence/runtime-console.json',JSON.stringify(logs,null,2));await page.screenshot({path:'artifacts/evidence/runtime-final.png',fullPage:true}).catch(()=>{});await browser.close();server.kill();}
