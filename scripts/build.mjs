import {buildControlStudy} from './control-study.mjs';
import {interfaceLessons} from '../site/src/learning/interface-patterns/lessons.mjs';
import {dataWorkspaces} from '../site/src/learning/data-workspaces/lessons.mjs';
import {build} from 'esbuild';
import {buildFeatureSurvey} from './feature-survey.mjs';
import {mkdir, cp, writeFile, readFile, readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {buildCatalog} from './catalog.mjs';
import {buildStudyMaterial} from './study-material.mjs';
import {relocateRuntime} from './relocate-runtime.mjs';

await mkdir('dist/assets', {recursive: true});
for (const file of ['index.html', 'styles.css', 'visual.css', 'favicon.svg']) await cp('site/' + file, 'dist/' + file);
await cp('site/design', 'dist/design', {recursive: true});
await writeFile('dist/.nojekyll', '');
await build({
  entryPoints: {
    app: 'site/src/entry.mjs',
    editor: 'site/src/editor.mjs',
    'editor.worker': 'node_modules/monaco-editor/esm/vs/editor/editor.worker.js',
    'coloring.worker': 'site/src/coloring/worker.mjs'
  },
  bundle: true, splitting: true, format: 'esm', outdir: 'dist/assets', target: ['es2022'],
  minify: true, sourcemap: true, loader: {'.ttf': 'file'}, assetNames: '[name]-[hash]',
  chunkNames: 'chunk-[hash]', logLevel: 'info'
});
await cp('LICENSE', 'dist/LICENSE.txt');
await cp('THIRD_PARTY_NOTICES.md', 'dist/THIRD_PARTY_NOTICES.md');
await mkdir('dist/third-party', {recursive: true});
await cp('node_modules/highlight.js/LICENSE', 'dist/third-party/highlight.js-LICENSE.txt');
await buildCatalog();
const featureSurvey=await buildFeatureSurvey();
const study = await buildStudyMaterial();
const controlSourceExcerpts = await buildControlStudy();

async function findEmbedded(directory) {
  if (!existsSync(directory)) return null;
  for (const item of await readdir(directory, {withFileTypes: true})) {
    if (item.isFile() && item.name === 'embedded.js') return directory;
    if (item.isDirectory()) {
      const match = await findEmbedded(path.join(directory, item.name));
      if (match) return match;
    }
  }
  return null;
}

const runtime = await findEmbedded(process.env.RUNTIME_OUTPUT || 'artifacts/runtime');
if (runtime) {
  await cp(runtime, 'dist/runner', {recursive: true});
  await cp('runtime/host', 'dist/runner', {recursive: true});
  await relocateRuntime('dist/runner');
} else if (process.env.REQUIRE_RUNTIME === '1') {
  throw new Error('Published Uno embedded.js was not found. The complete site cannot be deployed.');
}

const {lessons, tracks} = await import('../site/src/course.mjs');
const source = JSON.parse(await readFile('sources.lock.json', 'utf8'));
const {labs}=await import('../site/src/atlas/catalog.mjs');
const {guides}=await import('../site/src/learning/guides.mjs');
const manifest = {
  dataWorkshops: dataWorkspaces.length, designLessons: interfaceLessons.length, independentWorkshopSteps: [...dataWorkspaces,...interfaceLessons].reduce((n,l)=>n+l.steps.length,0), controlSourceExcerpts, sourceFeatureTypes: featureSurvey?.features.length || 0,
  version: JSON.parse(await readFile('package.json', 'utf8')).version, builtAt: new Date().toISOString(), commit: process.env.GITHUB_SHA || 'local',
  runtime: !!runtime, lessons: lessons.length, tracks: tracks.length, visualLabs:labs.length, foundationGuides:guides.length, studyChapters:study.lessons.length, guidedSteps:study.steps, studyWords:study.authoredWords, sourceExcerpts:study.documentExcerpts+study.codeExcerpts, source
};
await writeFile('dist/build.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
