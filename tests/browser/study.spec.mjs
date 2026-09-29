import {test, expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {lessons} from '../../site/src/course.mjs';
import {labMap, labForLesson} from '../../site/src/atlas/catalog.mjs';
const sha = value => createHash('sha256').update(value).digest('hex');

test('guided chapters publish ninety complete source-connected lessons', async ({page}) => {
  const indexResponse = await page.request.get('./study/index.json');
  expect(indexResponse.ok()).toBe(true);
  const index = await indexResponse.json();
  expect(index.lessons).toHaveLength(90);expect(index.steps).toBe(360);
  expect(index.authoredWords).toBeGreaterThan(42000);expect(index.documentExcerpts).toBe(191);expect(index.codeExcerpts).toBe(117);
  for (const lesson of lessons) {
    const response = await page.request.get(`./study/${lesson.id}.json`);
    expect(response.ok(), lesson.id).toBe(true);
    const chapter = await response.json();
    expect(chapter.id).toBe(lesson.id);expect(chapter.steps).toHaveLength(4);expect(chapter.vocabulary).toHaveLength(3);expect(chapter.cases).toHaveLength(2);
    expect(chapter.steps.map(s=>s.title)).toEqual(labMap.get(labForLesson(lesson)).steps.map(s=>s[0]));
    for (const source of chapter.snippets) {
      expect(sha(source.code)).toBe(source.codeHash);
      expect(source.url).toContain(`/blob/${index.revision}/`);
      expect(source.url).toContain(`#L${source.startLine}-L${source.endLine}`);
    }
  }
});
for (const id of ['one-codebase','grid-sizing','change-notification','dependency-injection','pointer-input','custom-panel']) {
  test('guided chapter reader renders explanations, source and coloring: '+id, async ({page}) => {
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`./#/lesson/${id}/learn`);
    await expect(page.locator(`[data-chapter="${id}"]`)).toBeVisible();
    await expect(page.locator('.study-steps > article')).toHaveCount(4);
    await expect(page.locator('.study-vocabulary dt')).toHaveCount(3);
    await expect(page.locator('.study-variation-table tbody tr')).toHaveCount(2);
    const code=page.locator('.study-code code').first();
    await code.scrollIntoViewIfNeeded();await expect(code).toHaveAttribute('data-colored',/csharp|xml/);
    const lesson=lessons.find(l=>l.id===id);expect(await code.textContent()).toBe(lesson.code);
    expect(await page.locator('.study-source').count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator('.study-scene')).toHaveCount(1);
    await expect(page.locator('.study-metrics output')).toHaveCount(3);
    expect(errors).toEqual([]);
  });
}

test('guided chapter outline keeps the route and focuses the requested step', async ({page}) => {
  await page.goto('./#/lesson/grid-sizing/learn');await expect(page.locator('.study-layout')).toBeVisible();
  const url=page.url();await page.locator('.study-outline [data-study-jump="step-2"]').click();
  expect(page.url()).toBe(url);await expect(page.locator('#study-grid-sizing-step-2')).toBeFocused();
  const recall=page.locator('[data-chapter-step="2"] .study-recall');
  await recall.locator('summary').click();await expect(recall.locator('p')).toBeVisible();
  await page.locator('[data-study-show-phase="2"]').click();await expect(page.locator('.study-infographic')).toHaveAttribute('data-phase','2');
  await expect(page.locator('#study-grid-sizing-model')).toBeFocused();
  await page.screenshot({path:'artifacts/evidence/expanded-layout-chapter.png',fullPage:true});
});

test('guided chapter comparisons change outcomes and keep code source exact',async({page})=>{
  await page.goto('./#/lesson/csharp-essentials/learn');await expect(page.locator('.study-layout')).toBeVisible();
  const before=await page.locator('.study-scene').innerHTML();
  await page.locator('[data-study-variation]').click();await expect(page.locator('.study-infographic')).toHaveAttribute('data-variation','true');
  expect(await page.locator('.study-scene').innerHTML()).not.toBe(before);
  await page.locator('[data-study-variation]').click();expect(await page.locator('.study-scene').innerHTML()).toBe(before);
  await page.locator('.study-source').first().scrollIntoViewIfNeeded();
  const c=await (await page.request.get('./study/csharp-essentials.json')).json();
  const code=page.locator('.study-source pre code').first();await expect(code).toHaveAttribute('data-colored',/csharp|xml/);expect(await code.textContent()).toBe(c.snippets[0].code);
  await page.screenshot({path:'artifacts/evidence/expanded-source-study.png',fullPage:true});
});

test('guided step reading follows atlas steps, loads once and links to the full chapter',async({page})=>{
  const requests=[];page.on('request',r=>{if(r.url().includes('/study/grid-sizing.json'))requests.push(r.url());});
  await page.goto('./#/lesson/grid-sizing/visualize?step=1');
  await expect(page.locator('.visual-lab')).toHaveAttribute('data-step','1');
  await page.locator('.atlas-phase-reading>summary').click();
  await expect(page.locator('#visual-phase-reading')).toHaveAttribute('data-reading-step','1');
  await expect(page.locator('.phase-reading-content>h3')).toHaveText('Measure');
  await page.getByRole('button',{name:'Next step',exact:true}).click();
  await expect(page.locator('#visual-phase-reading')).toHaveAttribute('data-reading-step','2');
  await expect(page.locator('.phase-reading-content>h3')).toHaveText('Distribute');
  expect(requests).toHaveLength(1);
  await page.screenshot({path:'artifacts/evidence/expanded-atlas-step.png',fullPage:true});
  await page.getByRole('link',{name:'Read the full chapter at this step →'}).click();
  await expect(page.locator('#study-grid-sizing-step-2')).toBeFocused();
});

test('guided chapters remain readable on mobile and in dark mode',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('./#/lesson/events/learn');
  await expect(page.locator('.study-layout')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('.study-outline [data-study-jump="steps"]').click();
  await expect(page.locator('#study-events-steps')).toBeFocused();
  await page.screenshot({path:'artifacts/evidence/expanded-chapter-mobile.png',fullPage:true});
  await page.locator('#theme-button').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('.study-outline [data-study-jump="sources"]').click();
  await expect(page.locator('.study-source').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:'artifacts/evidence/expanded-chapter-dark.png',fullPage:true});
});

test('guided chapter loading failures can retry without changing progress',async({page})=>{
  let attempts=0;
  await page.route('**/study/events.json',route=>{attempts++;return attempts===1?route.fulfill({status:503,contentType:'text/plain',body:'fixture unavailable'}):route.continue();});
  await page.goto('./#/lesson/events/learn');await expect(page.getByRole('heading',{name:'The chapter could not be loaded.'})).toBeVisible();
  await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.locator('[data-chapter="events"]')).toBeVisible();
  expect(attempts).toBe(2);const entry=await page.evaluate(()=>JSON.parse(localStorage.getItem('learnuno.progress.v1')).lessons.events);expect(entry?.completed).not.toBe(true);
});
