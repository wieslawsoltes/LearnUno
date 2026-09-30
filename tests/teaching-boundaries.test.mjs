import test from 'node:test';
import assert from 'node:assert/strict';
import {labMap} from '../site/src/atlas/catalog.mjs';
import {scene} from '../site/src/atlas/scenes.mjs';
import {comparisonGeometry} from '../site/src/learning/guide-comparisons.mjs';
import {featureLinks} from '../site/src/learning/interface-patterns/coverage.mjs';
import {lessonMap} from '../site/src/course.mjs';

test('XAML size diagrams use logical-unit labels, not typographic points',()=>{
 for(const id of ['tree','precedence']){
  const lab=labMap.get(id),result=scene(lab,{...lab.defaults});
  assert(lab.controls.filter(c=>/font/i.test(c.label)).every(c=>c.unit==='u'));
  assert.doesNotMatch(result.svg,/NaN|undefined|\bpt\b/);
  assert.doesNotMatch(result.code,/\bpt\b/);
 }
 assert.doesNotMatch(comparisonGeometry('resource-template-boundaries'),/\bpt\b/);
 // Guard the adjacent easing implementation against accidental variable edits.
 const easing=labMap.get('easing');assert.doesNotMatch(scene(easing,{...easing.defaults}).svg,/NaN|undefined/);
});
test('comparison labels identify the active boundary instead of contradicting the scenario',()=>{
 assert.match(comparisonGeometry('notification-boundaries',true),/Unchanged value/);
 assert.match(comparisonGeometry('focus-is-state',false),/No focus request/);
 assert.match(comparisonGeometry('focus-is-state',true),/Current keyboard target/);
});
test('source coverage connects explicit foundational types without inventing lesson IDs',()=>{
 for(const name of ['RowDefinition','ColumnDefinition','Setter','ControlTemplate','ContentPresenter','ItemsControl','Slider']){
  assert(featureLinks[name]?.length);
  for(const entry of featureLinks[name]){
   const match=entry.href.match(/^#\/lesson\/([^/]+)\/learn$/);
   assert(match);assert(lessonMap.has(match[1]));
  }
 }
});
