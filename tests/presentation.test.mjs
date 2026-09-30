import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {presentationPreferences,applyPresentation} from '../site/src/presentation/preferences.mjs';

test('Fluent presentation defaults are additive and do not mutate existing progress preferences',()=>{
  const state={theme:'dark',motion:false,custom:'kept'};
  const before=structuredClone(state);
  const root={dataset:{theme:'dark'}};
  assert.deepEqual(applyPresentation(state,root),{density:'compact',materials:'subtle'});
  assert.deepEqual(state,before);
  assert.deepEqual(root.dataset,{theme:'dark',fluent:'true',density:'compact',materials:'subtle'});
});
test('Fluent settings reject unsupported imported values without injecting CSS',()=>{
  for(const value of [null,undefined,{},'text',{density:'large',materials:'<style>bad</style>'}]){
    assert.deepEqual(presentationPreferences(value),{density:'compact',materials:'subtle'});
  }
  assert.deepEqual(presentationPreferences({density:'comfortable',materials:'solid'}),{density:'comfortable',materials:'solid'});
});
test('Fluent effects are static CSS, scoped to the shell, with explicit accessibility fallbacks',()=>{
  const base=readFileSync('site/design/fluent-surfaces.css','utf8');
  const mobile=readFileSync('site/design/fluent-mobile.css','utf8');
  assert.match(base,/data-materials=solid/);
  assert.match(mobile,/prefers-reduced-transparency/);
  assert.match(mobile,/forced-colors:active/);
  assert.match(mobile,/safe-area-inset-bottom/);
  assert.doesNotMatch(base+mobile,/@keyframes|animation:\s*(?:\d|[a-z]+\s+\d)/);
  assert.doesNotMatch(base+mobile,/url\(\s*['"]?https?:/);
  assert.doesNotMatch(base+mobile,/:is\([^)]*study-main[^)]*\)\s*\{[^}]*backdrop-filter:\s*blur/);
});
test('Presentation controllers dispose listeners and preserve the Uno sandbox boundary',()=>{
  const nav=readFileSync('site/src/presentation/navigation.mjs','utf8');
  const reader=readFileSync('site/src/presentation/chapter-navigation.mjs','utf8');
  const panes=readFileSync('site/src/presentation/workspace-panes.mjs','utf8');
  assert.match(nav,/controller\.abort/);assert.match(nav,/page\.inert = true/);assert.match(nav,/page\.inert = false/);
  assert.match(reader,/observer\.disconnect/);assert.match(reader,/cancelAnimationFrame/);
  assert.match(panes,/removeEventListener/);assert.doesNotMatch(panes,/iframe|contentWindow|postMessage|localStorage/);
});
