import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {installWorkspacePanes} from '../../site/src/presentation/workspace-panes.mjs';
import {installChapterNavigation} from '../../site/src/presentation/chapter-navigation.mjs';
import {installNavigation} from '../../site/src/presentation/navigation.mjs';

// Browser-DOM component checks, intentionally independent of a server or Uno.
// Full route/runtime tests in fluent.spec.mjs and common-controls.spec.mjs are
// separate release gates; these fixtures must never be counted as Uno execution.
async function paneFixture(page, width = 390) {
  await page.setViewportSize({width, height: 844});
  await page.setContent(`<style>
    body { margin:16px; } .workspace-pane-switch { display:none; }
    @media(max-width:720px) {
      .workspace-pane-switch { display:flex; }
      .lab-grid[data-pane=code] .preview-pane,
      .lab-grid[data-pane=preview] .editor-pane { display:none; }
    }
  </style><div id="fixture">
    <button id="run">Run code</button>
    <div class="workspace-pane-switch" role="group" aria-label="Playground view">
      <button data-pane="code">Code</button><button data-pane="preview">Preview</button>
    </div><div class="lab-grid">
      <section class="editor-pane"><textarea aria-label="Lesson code editor">// keep my draft</textarea></section>
      <section class="preview-pane"><button id="preview-action">Preview action</button><output id="preview-state">kept</output></section>
    </div></div>`);
  await page.addScriptTag({content: `window.paneController = (${installWorkspacePanes.toString()})(document.querySelector('#fixture'));`});
}

test('Fluent component keyboard-run handoff moves focus out of the hidden editor', async ({page}) => {
  await paneFixture(page);
  await page.getByLabel('Lesson code editor').focus();
  await page.evaluate(() => window.paneController.showPreview());
  await expect(page.getByRole('button', {name:'Preview',exact:true})).toBeFocused();
  await expect(page.locator('.editor-pane')).toBeHidden();
  expect(await page.locator('.editor-pane').evaluate(n=>n.inert)).toBe(true);
  await expect(page.locator('.preview-pane')).toBeVisible();
  await page.getByRole('button', {name:'Code',exact:true}).click();
  await expect(page.getByLabel('Lesson code editor')).toHaveValue('// keep my draft');
});

test('Fluent component Run button keeps focus and pane toggles preserve mounted state', async ({page}) => {
  await paneFixture(page);
  await page.evaluate(() => {window.previewNode=document.querySelector('#preview-state');});
  await page.getByRole('button', {name:'Run code'}).focus();
  await page.evaluate(() => window.paneController.showPreview());
  await expect(page.getByRole('button', {name:'Run code'})).toBeFocused();
  await page.getByRole('button', {name:'Code',exact:true}).click();
  await page.getByRole('button', {name:'Preview',exact:true}).click();
  expect(await page.evaluate(()=>document.querySelector('#preview-state')===window.previewNode)).toBe(true);
});

for (const owner of ['editor','preview']) test(`Fluent component narrowing preserves the focused ${owner}`, async ({page}) => {
  await paneFixture(page);
  // Establish the opposite mobile selection before moving to desktop.
  if (owner==='editor') await page.evaluate(()=>window.paneController.showPreview());
  await page.setViewportSize({width:1200,height:900});
  await expect(page.locator('.editor-pane')).toBeVisible();
  await expect(page.locator('.preview-pane')).toBeVisible();
  const focused=owner==='editor'?page.getByLabel('Lesson code editor'):page.locator('#preview-action');
  await focused.focus();
  await page.setViewportSize({width:390,height:844});
  await expect(focused).toBeVisible();
  await expect(focused).toBeFocused();
  await expect(page.locator('.lab-grid')).toHaveAttribute('data-pane',owner==='editor'?'code':'preview');
});

test('Fluent component iframe focus and in-frame state survive pane switching and resize', async ({page}) => {
  await paneFixture(page);
  await page.setViewportSize({width:1200,height:900});
  await page.evaluate(() => {
    const frame=document.createElement('iframe');
    frame.title='Component preview, not Uno';
    frame.srcdoc='<button id="increment">Increment local state</button><output id="count">0</output><script>let count=0;document.querySelector("button").onclick=()=>document.querySelector("output").textContent=++count;<\/script>';
    document.querySelector('.preview-pane').append(frame);
    window.frameNode=frame;
  });
  const inside=page.frameLocator('iframe[title="Component preview, not Uno"]');
  const increment=inside.getByRole('button',{name:'Increment local state'});
  await increment.click();await expect(inside.locator('#count')).toHaveText('1');
  await expect(page.locator('.lab-grid')).toHaveAttribute('data-pane','preview');
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.preview-pane')).toBeVisible();await expect(increment).toBeFocused();
  await page.getByRole('button',{name:'Code',exact:true}).click();
  await page.getByRole('button',{name:'Preview',exact:true}).click();
  expect(await page.evaluate(()=>document.querySelector('iframe')===window.frameNode)).toBe(true);
  await increment.click();await expect(inside.locator('#count')).toHaveText('2');
});

test('Fluent component disposal is idempotent and rejects late presentation callbacks', async ({page}) => {
  await paneFixture(page);
  await page.evaluate(()=>{window.paneController.dispose();window.paneController.dispose();window.paneController.showPreview();});
  await expect(page.locator('.lab-grid')).toHaveAttribute('data-pane','code');
  expect(await page.locator('.editor-pane').evaluate(n=>n.inert)).toBe(false);
  expect(await page.locator('.preview-pane').evaluate(n=>n.inert)).toBe(false);
  await page.getByRole('button',{name:'Preview',exact:true}).click();
  await expect(page.locator('.lab-grid')).toHaveAttribute('data-pane','code');
});

test('Fluent component source handoff restores Code without replacing either pane', async ({page}) => {
  await paneFixture(page);
  await page.evaluate(()=>window.paneController.showPreview());
  await page.locator('#preview-action').focus();
  await page.evaluate(()=>window.paneController.showCode());
  await expect(page.getByRole('button',{name:'Code',exact:true})).toBeFocused();
  await expect(page.getByLabel('Lesson code editor')).toHaveValue('// keep my draft');
});

test('Fluent component chapter location uses the resolved calc scroll offset', async ({page}) => {
  await page.setViewportSize({width:1200,height:800});
  await page.setContent(`<style>
    :root { --reading-offset:calc(100px + 80px); }
    body { margin:0; } .study-outline { position:fixed; right:0; top:0; }
    .study-main { padding-top:600px; } .study-main [id] { scroll-margin-top:var(--reading-offset); height:500px; }
    .study-main { padding-bottom:1200px; }
  </style><div id="chapter"><aside class="study-outline"><div class="study-outline-inner"><nav>
    <button data-study-jump="intro">Overview</button><button data-study-jump="step-1">First step</button>
  </nav></div></aside><main class="study-main"><section class="study-intro" id="study-demo-intro">Intro</section>
  <article data-chapter-step="1" id="study-demo-step-1">First step</article></main></div>`);
  await page.addScriptTag({content:`window.chapterAbort=new AbortController();(${installChapterNavigation.toString()})(document.querySelector('#chapter'),window.chapterAbort.signal);`});
  await page.evaluate(()=>{const node=document.querySelector('#study-demo-step-1');scrollTo(0,node.getBoundingClientRect().top+scrollY-170);});
  await expect(page.locator('.chapter-location')).toHaveText('First step');
  await expect(page.locator('[data-study-jump="step-1"]')).toHaveAttribute('aria-current','location');
  const progress=page.getByRole('progressbar',{name:'Position in chapter, not lesson completion'});
  expect(+await progress.getAttribute('aria-valuenow')).toBeGreaterThan(0);
  await page.evaluate(()=>window.chapterAbort.abort());
  await page.evaluate(()=>scrollTo(0,0));
  await expect(page.locator('.chapter-location')).toHaveText('First step');
});

// Resolve authored CSS imports from disk, excluding only Monaco's stylesheet
// because this fixture has no Monaco nodes. No network or font download occurs.
function styles(path) {
  const file=resolve(path);
  return readFileSync(file,'utf8').replace(/@import\s+url\(['"]?([^'"\)]+)['"]?\);/g,(_,next)=>
    next==='./assets/editor.css'?'':styles(resolve(dirname(file),next)));
}
const shellCss = ['site/styles.css','site/visual.css','site/design/data-workspaces.css','site/design/interface-patterns.css','site/design/fluent.css'].map(styles).join('\n');

test('Fluent component touch drawer uses actual shell CSS and retains its modal boundary', async ({browser}) => {
  const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage();
  try {
    await page.setContent(`<html data-fluent="true" data-theme="light"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${shellCss}</style></head><body>
    <aside class="sidebar" aria-label="Course navigation"><button id="close-navigation" aria-label="Close navigation">×</button><nav class="main-nav"><a href="#lesson" class="active">Current lesson</a><a href="#atlas">Visual atlas</a></nav></aside>
    <button id="navigation-backdrop" hidden aria-label="Dismiss navigation"></button>
    <div class="page-shell"><header class="topbar"><button id="mobile-menu" class="icon-button mobile-menu" aria-label="Toggle navigation">☰</button></header><main id="main" tabindex="-1">Lesson</main></div></body></html>`);
    await page.addScriptTag({content:`window.navigationController=(${installNavigation.toString()})({sidebar:document.querySelector('.sidebar'),page:document.querySelector('.page-shell'),toggle:document.querySelector('#mobile-menu'),backdrop:document.querySelector('#navigation-backdrop'),closeButton:document.querySelector('#close-navigation')});`});
    const opener=page.getByRole('button',{name:'Toggle navigation'});
    const box=await opener.boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);
    await opener.tap();
    const drawer=page.getByRole('dialog',{name:'Course navigation'});
    await expect(drawer).toBeVisible();
    expect(await page.locator('.page-shell').evaluate(n=>n.inert)).toBe(true);
    const heights=await drawer.locator('.main-nav a').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
    expect(heights.every(h=>h>=44)).toBe(true);
    await page.setViewportSize({width:852,height:393});
    expect((await drawer.boundingBox()).height).toBeLessThanOrEqual(393);
    await drawer.getByRole('button',{name:'Close navigation'}).tap();
    await expect(opener).toBeFocused();
    expect(await page.locator('.page-shell').evaluate(n=>n.inert)).toBe(false);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  } finally { await context.close(); }
});
