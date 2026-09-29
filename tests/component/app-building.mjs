/**
 * Isolated, local-document component checks; no navigation, server or .NET host.
 * The fixture transport is explicit. A pass is not a deployed-site/runtime pass.
 * Run after `npm run build`: node tests/component/app-building.mjs
 */
import {build} from 'esbuild';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {lessons} from '../../site/src/course.mjs';
import {labMap, labForLesson} from '../../site/src/atlas/catalog.mjs';

const output = process.env.COMPONENT_EVIDENCE || 'artifacts/app-building-components';
await fs.mkdir(output, {recursive: true});
const bundle = await build({
  stdin: {resolveDir: process.cwd(), contents: String.raw`
    import {mountChapter} from './site/src/learning/chapters.mjs';
    import {mountLab} from './site/src/atlas/lab.mjs';
    import {mountAppBuilding} from './site/src/learning/app-building.mjs';
    import {lessonMap} from './site/src/course.mjs';
    import {labForLesson} from './site/src/atlas/catalog.mjs';
    import {colorCode} from './site/src/coloring/engine.mjs';
    import {freshProgress} from './site/src/progress.mjs';
    let dispose = () => {};
    window.fetch = async input => {
      const url = new URL(input, document.baseURI);
      const match = /^\/study\/([a-z0-9-]+)\.json$/.exec(url.pathname);
      if (!match || url.origin !== 'https://learnuno-component.invalid') throw new Error('Only an explicit chapter fixture can be fetched.');
      const text = await window.readChapterFixture(match[1]);
      return {ok: true, status: 200, text: async () => text};
    };
    window.mountFixture = (kind, id) => {
      dispose();
      const root = document.getElementById('fixture'); root.replaceChildren();
      if (kind === 'roadmap') dispose = mountAppBuilding(root, freshProgress());
      else if (kind === 'chapter') dispose = mountChapter(root, lessonMap.get(id));
      else if (kind === 'atlas') dispose = mountLab(root, labForLesson({id}), {motion: false, lesson: lessonMap.get(id)});
      else throw new Error('Unknown component fixture.');
    };
    window.colorFixture = () => {
      for (const node of document.querySelectorAll('pre code')) {
        const original = node.textContent; const result = colorCode(original, node.dataset.language || '');
        node.innerHTML = result.html; node.dataset.componentColored = result.language;
        if (node.textContent !== original) throw new Error('Coloring changed source text.');
      }
    };
  `},
  bundle: true, platform: 'browser', format: 'iife', write: false, target: ['es2022']
});
const styles = ['site/styles.css', 'site/design/syntax.css', 'site/design/learning.css',
  'site/design/shell.css', 'site/design/labs.css', 'site/design/responsive.css',
  'site/design/app-building.css', 'site/design/playback.css', 'site/design/study.css'];
const css = (await Promise.all(styles.map(p => fs.readFile(p, 'utf8'))))
  .map(s => s.replace(/@import[^;]+;/g, '')).join('\n');
const pageStyles = `
  :root { --sidebar: 0px; }
  body { padding:0; }
  .component-banner { padding:14px 30px;background:#163b45;color:#e6f2ef;font:12px system-ui;letter-spacing:.03em; }
  .component-banner strong { margin-right:14px; }
  #fixture { max-width:1300px;padding:32px 36px 50px;margin:auto; }
  @media(max-width:680px) { #fixture {padding:22px 16px;} .component-banner {padding:14px 16px;line-height:1.6;} }
`;
const browser = await chromium.launch({headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath: process.env.CHROMIUM_EXECUTABLE} : {})});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
const errors = [], results = [];
page.on('pageerror', error => errors.push(error.message));
await page.exposeFunction('readChapterFixture', async id => {
  assert(lessons.some(l => l.id === id), 'Unknown fixture ID');
  return fs.readFile(path.join('dist/study', id + '.json'), 'utf8');
});
const snapshot = async name => {
  await page.evaluate(() => { window.colorFixture(); scrollTo(0, 0); });
  await page.screenshot({path: path.join(output, name + '.png'), fullPage: false});
};
try {
  await page.setContent('<!doctype html><html lang="en"><head><base href="https://learnuno-component.invalid/"><title>LearnUno component review</title></head><body><div class="component-banner"><strong>LearnUno · App-building edition</strong>Local component preview — not deployed · no Uno runtime execution</div><main id="fixture"></main><div id="toast" role="status"></div></body></html>');
  await page.addStyleTag({content: css + pageStyles});
  await page.addScriptTag({content: bundle.outputFiles[0].text});
  await page.evaluate(() => window.mountFixture('roadmap'));
  assert.equal(await page.locator('[data-app-track]').count(), 5);
  assert.equal(await page.locator('[data-app-lesson]').count(), 30);
  assert.equal(await page.locator('.app-goals article').count(), 4);
  await snapshot('app-building-roadmap');
  results.push({component: 'roadmap', status: 'passed', paths: 5, lessons: 30});

  for (const lesson of lessons.filter(l => l.introducedIn === '0.4.0')) {
    await page.evaluate(id => window.mountFixture('chapter', id), lesson.id);
    await page.locator(`[data-chapter="${lesson.id}"]`).waitFor();
    assert.equal(await page.locator('.study-steps > article').count(), 4, lesson.id);
    assert.equal(await page.locator('.study-concepts').count(), 0, 'New chapter must not duplicate the first three full steps.');
    assert.equal(await page.locator('.study-vocabulary dt').count(), 3);
    assert.equal(await page.locator('.study-variation-table tbody tr').count(), 2);
    assert.equal(await page.locator('.study-code code').first().textContent(), lesson.code);
    await page.evaluate(() => window.colorFixture());
    assert.equal(await page.locator('.study-code code').first().textContent(), lesson.code);
    const before = await page.locator('.study-scene').innerHTML();
    await page.locator('[data-study-variation]').click();
    assert.notEqual(await page.locator('.study-scene').innerHTML(), before, lesson.id);
    await page.locator('.study-outline [data-study-jump="step-2"]').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), `study-${lesson.id}-step-2`);
    await page.locator('[data-chapter-step="2"] .study-recall summary').click();
    assert.equal(await page.locator('[data-chapter-step="2"] .study-recall').getAttribute('open'), '');
    if (lesson.id === 'toolkit-commands') await snapshot('toolkit-commands-chapter');
    results.push({component: 'chapter', lesson: lesson.id, status: 'passed'});

    await page.evaluate(id => window.mountFixture('atlas', id), lesson.id);
    const lab = labMap.get(labForLesson(lesson));
    assert.equal(await page.locator('.visual-lab').getAttribute('data-lab'), lab.id);
    assert.equal(await page.locator('#visual-metrics output').count(), 3);
    await page.getByRole('button', {name: 'Next step', exact: true}).click();
    assert.equal(await page.locator('#stage-title').textContent(), lab.steps[1][0]);
    await page.locator('.atlas-phase-reading > summary').click();
    await page.waitForFunction(() => document.querySelector('#visual-phase-reading')?.dataset.readingStep === '1');
    assert.equal(await page.locator('.phase-reading-content > h3').textContent(), lab.steps[1][0]);
    if (lesson.id === 'scope-ownership') await snapshot('di-scope-atlas');
    if (lesson.id === 'autosuggest-search') await snapshot('autosuggest-atlas');
    results.push({component: 'atlas', lesson: lesson.id, status: 'passed'});
  }

  await page.setViewportSize({width: 390, height: 844});
  await page.evaluate(() => window.mountFixture('roadmap'));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Roadmap overflow');
  await snapshot('app-building-mobile');
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; window.mountFixture('chapter', 'scope-ownership'); });
  await page.locator('[data-chapter="scope-ownership"]').waitFor();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Chapter overflow');
  await snapshot('scope-chapter-mobile-dark');
  results.push({component: 'mobile-theme', status: 'passed', viewport: '390x844'});
  assert.deepEqual(errors, []);
} finally {
  await fs.writeFile(path.join(output, 'component-results.json'), JSON.stringify({
    kind: 'isolated component checks', results, pageErrors: errors,
    boundaries: ['No browser navigation or actual HTTP transport was tested.',
      'No .NET/Uno runtime, C# compilation, package restoration or deployment was exercised.',
      'Code coloring used the pure grammar engine, not the module-worker transport.']
  }, null, 2));
  await browser.close();
}
console.log(`${results.length} isolated component checks passed; these are not full-site or runtime tests.`);
