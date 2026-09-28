import {build} from 'esbuild';
import {mkdir, cp, writeFile, readFile, readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {buildCatalog} from './catalog.mjs';
import {relocateRuntime} from './relocate-runtime.mjs';

await mkdir('dist/assets', {recursive: true});
for (const file of ['index.html', 'styles.css', 'favicon.svg']) await cp('site/' + file, 'dist/' + file);
await writeFile('dist/.nojekyll', '');
await build({
  entryPoints: {
    app: 'site/src/entry.mjs',
    editor: 'site/src/editor.mjs',
    'editor.worker': 'node_modules/monaco-editor/esm/vs/editor/editor.worker.js'
  },
  bundle: true, splitting: true, format: 'esm', outdir: 'dist/assets', target: ['es2022'],
  minify: true, sourcemap: true, loader: {'.ttf': 'file'}, assetNames: '[name]-[hash]',
  chunkNames: 'chunk-[hash]', logLevel: 'info'
});
await cp('LICENSE', 'dist/LICENSE.txt');
await cp('THIRD_PARTY_NOTICES.md', 'dist/THIRD_PARTY_NOTICES.md');
await buildCatalog();

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
const manifest = {
  version: '0.1.0', builtAt: new Date().toISOString(), commit: process.env.GITHUB_SHA || 'local',
  runtime: !!runtime, lessons: lessons.length, tracks: tracks.length, source
};
await writeFile('dist/build.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
