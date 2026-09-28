import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectFiles} from '../site/src/export.mjs';
import {lessons} from '../site/src/course.mjs';
test('every exported project includes renderer initialization and browser manifest',()=>{for(const lesson of lessons){const files=createProjectFiles(lesson,lesson.solution);assert(files['Program.cs'].includes('Assembly.Load("Uno.UI.Runtime.WebAssembly")'));assert(files['WasmScripts/AppManifest.js'].includes('UnoAppManifest'));assert(files['LessonApp.csproj'].includes('<PublishTrimmed>false</PublishTrimmed>'));assert(files['README.md'].includes(lesson.challenge));assert.equal(JSON.parse(files['global.json'])['msbuild-sdks']['Uno.Sdk'],'6.7.30');if(lesson.language==='xml'){assert.equal(files['Lesson.xaml.txt'],lesson.solution);assert(files['LessonMarkup.cs'].includes(lesson.solution.replaceAll('"','""')));}else assert.equal(files['Lesson.cs'],lesson.solution);}});
