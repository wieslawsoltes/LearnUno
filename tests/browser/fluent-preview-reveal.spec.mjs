import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {runWorkspaceCode} from './workspace-driver.mjs';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';

async function specimen(page, width=390) {
  await page.setViewportSize({width,height:844});
  await page.setContent(`<style>
    body{margin:0}.topbar{position:fixed;top:0;height:56px;width:100%;background:white}
    .before{height:700px}.after{height:1300px}#workspace{min-height:600px}
    .workspace-pane-switch{height:48px;scroll-margin-top:66px}
    .lab-grid{display:flex}.editor-pane,.preview-pane{height:450px;flex:1}
    @media(max-width:720px){.lab-grid{display:block}
    .lab-grid[data-pane=code] .preview-pane,.lab-grid[data-pane=preview] .editor-pane{display:none}}
  </style><header class="topbar"></header><div class="before"></div>
  <div id="workspace"><button id="run">Run</button>
    <div class="workspace-pane-switch"><button data-pane="code">Code</button><button data-pane="preview">Preview</button></div>
    <div class="lab-grid"><section class="editor-pane"><textarea>Keep this draft</textarea></section>
    <section class="preview-pane"><button id="inside-preview">Stateful preview</button></section></div>
  </div><div class="after"></div>`);
  const source=await readFile('site/src/presentation/workspace-panes.mjs','utf8');
  await page.addScriptTag({content:source.replace('export function','function')+';globalThis.panes=installWorkspacePanes(document.querySelector("#workspace"));'});
}

test('Fluent mobile preview reveals useful content below a long lesson header',async({page})=>{
  await specimen(page);
  await page.locator('#run').scrollIntoViewIfNeeded();
  await page.evaluate(()=>{window.previewIdentity=document.querySelector('.preview-pane');panes.showPreview();});
  const viewport=await page.locator('.preview-pane').boundingBox();
  expect(viewport.y).toBeGreaterThanOrEqual(56);
  expect(viewport.y+160).toBeLessThanOrEqual(844);
  expect(await page.evaluate(()=>document.querySelector('.preview-pane')===window.previewIdentity)).toBe(true);
  await expect(page.locator('textarea')).toHaveValue('Keep this draft');
  const position=await page.evaluate(()=>scrollY);
  await page.evaluate(()=>panes.showPreview());
  expect(await page.evaluate(()=>scrollY)).toBe(position);
});

test('Fluent delayed preview does not drag a reader back from another section',async({page})=>{
  await specimen(page);
  await page.evaluate(()=>scrollTo(0,1800));
  const position=await page.evaluate(()=>scrollY);
  await page.evaluate(()=>panes.showPreview());
  expect(await page.evaluate(()=>scrollY)).toBe(position);
  await page.evaluate(()=>panes.dispose());
  await page.evaluate(()=>panes.showPreview());
  expect(await page.evaluate(()=>scrollY)).toBe(position);
});

test('Fluent desktop panes and responsive cleanup do not force a scroll',async({page})=>{
  await specimen(page,1200);
  await page.evaluate(()=>scrollTo(0,200));
  await page.evaluate(()=>panes.showPreview());
  expect(await page.evaluate(()=>scrollY)).toBe(200);
  await expect(page.locator('.editor-pane')).toBeVisible();
  await expect(page.locator('.preview-pane')).toBeVisible();
});

test('Fluent small-screen rich text can be reached after Run without a forced click',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./#/design-labs/richtext-reading/playground');
  const lesson=commonControlLessons.find(l=>l.id==='richtext-reading');
  const frame=await runWorkspaceCode(page,lesson.code);
  const bounds=await page.locator('#runtime-mount').boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(56);
  expect(bounds.y).toBeLessThan(600);
  const link=frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
  await link.click({timeout:15000});
  await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible();
});
