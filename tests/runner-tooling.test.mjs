import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectFiles} from '../site/src/export.mjs';
import {lessons} from '../site/src/course.mjs';
import {runtimePackages} from '../site/src/runtime-dependencies.mjs';

test('static runner excludes optional Hot Design without suppressing package failures', () => {
  const source = readFileSync(new URL('../runtime/LearnUnoRunner.csproj', import.meta.url), 'utf8');
  assert.match(source, /<UnoDisableHotDesign>true<\/UnoDisableHotDesign>/);
  assert.doesNotMatch(source, /NU1605|NoWarn|WarningsNotAsErrors/);
  assert.match(source, /CommunityToolkit.Mvvm" Version="8.4.0"/);
  assert.equal(runtimePackages['CommunityToolkit.Mvvm'], '8.4.0');
});

test('every exported lesson retains the same optional-tooling boundary', () => {
  for (const lesson of lessons) {
    const files = createProjectFiles(lesson, lesson.solution);
    assert.match(files['LessonApp.csproj'], /<UnoDisableHotDesign>true<\/UnoDisableHotDesign>/);
    assert.doesNotMatch(files['LessonApp.csproj'], /NoWarn|WarningsNotAsErrors/);
    assert.match(files['README.md'], /Hot Design is disabled/);
  }
});
