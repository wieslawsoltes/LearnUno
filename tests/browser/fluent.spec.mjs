import {test,expect} from '@playwright/test';

const noOverflow=async page=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
const goto=async(page,route)=>{await page.goto('./#/'+route);await expect(page.locator('html')).toHaveAttribute('data-fluent','true');};
async function drawer(page){await page.getByRole('button',{name:'Toggle navigation',exact:true}).click();return page.getByRole('dialog',{name:'Course navigation',exact:true});}

for(const theme of ['light','dark'])test(`Fluent shell and reader use restrained materials in ${theme}`,async({page})=>{
  await goto(page,'');
  if(theme==='dark')await page.getByRole('button',{name:'Switch color theme'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await expect(page.locator('.main-nav .navigation-group')).toHaveCount(3);
  await expect(page.locator('.main-nav [data-nav]')).toHaveCount(12);
  await expect(page.locator('.path-disclosure')).not.toHaveAttribute('open');
  expect(await page.locator('.editorial-hero').evaluate(node=>node.getBoundingClientRect().height)).toBeLessThan(445);
  await page.screenshot({path:`artifacts/evidence/fluent-home-${theme}.png`,fullPage:true});
  await goto(page,'lesson/grid-sizing/learn');
  await expect(page.locator('.chapter-contents')).toHaveAttribute('open','');
  await expect(page.locator('.study-steps>article')).toHaveCount(4);
  const appearance=await page.locator('.study-main').evaluate(node=>{const s=getComputedStyle(node);return {blur:s.backdropFilter,bg:s.backgroundColor,size:parseFloat(getComputedStyle(node.querySelector('p')).fontSize)};});
  expect(appearance.blur).toBe('none');expect(appearance.bg).not.toMatch(/rgba.*0\)/);expect(appearance.size).toBeGreaterThanOrEqual(15);
  await page.locator('.study-outline [data-study-jump="model"]').click();
  await expect(page.locator('#study-grid-sizing-model')).toBeFocused();
  expect(await page.locator('#study-grid-sizing-model').evaluate(node=>node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(105);
  await page.screenshot({path:`artifacts/evidence/fluent-chapter-${theme}.png`,fullPage:true});
});

test('Fluent appearance settings persist without changing drafts or completion',async({page})=>{
  await goto(page,'lesson/events/notes');
  await page.getByLabel('Personal lesson notes').fill('Keep my lesson notes.');
  await page.evaluate(()=>{const key='learnuno.progress.v1';const value=JSON.parse(localStorage.getItem(key));value.drafts.events='// Keep my code';localStorage.setItem(key,JSON.stringify(value));});
  await page.reload();
  await page.getByRole('button',{name:'Progress and preferences'}).click();
  const modal=page.getByRole('dialog',{name:'LearnUno dialog'});
  await modal.getByLabel('Layout density').selectOption('comfortable');
  await modal.getByLabel('Surface materials').selectOption('solid');
  await expect(page.locator('html')).toHaveAttribute('data-materials','solid');
  expect(await modal.evaluate(n=>getComputedStyle(n).backdropFilter)).toBe('none');
  await modal.getByRole('button',{name:'Close dialog'}).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-density','comfortable');
  await expect(page.locator('html')).toHaveAttribute('data-materials','solid');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('learnuno.progress.v1')));
  expect(saved.notes.events).toBe('Keep my lesson notes.');expect(saved.drafts.events).toBe('// Keep my code');expect(saved.lessons.events?.completed).not.toBe(true);
});

test('Fluent mobile navigation is modal, traps focus and restores it on close',async({page})=>{
  await page.setViewportSize({width:390,height:844});await goto(page,'');
  const hiddenRail=page.locator('.sidebar');await expect(hiddenRail).toBeHidden();
  expect(await hiddenRail.evaluate(n=>n.inert)).toBe(true);
  const rail=await drawer(page);await expect(rail).toBeVisible();
  expect(await page.locator('.page-shell').evaluate(n=>n.inert)).toBe(true);
  await page.screenshot({path:'artifacts/evidence/fluent-mobile-navigation.png'});
  await rail.getByRole('button',{name:'Close navigation',exact:true}).focus();await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(()=>document.querySelector('.sidebar').contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Toggle navigation',exact:true})).toBeFocused();
  expect(await page.locator('.page-shell').evaluate(n=>n.inert)).toBe(false);
  await drawer(page);await page.locator('.sidebar [data-nav="fundamentals"]').click();
  await expect(page).toHaveURL(/#\/fundamentals$/);await expect(page.locator('.sidebar')).toBeHidden();
  await drawer(page);await page.setViewportSize({width:1440,height:1000});
  await expect(page.locator('.sidebar')).toBeVisible();expect(await page.locator('.page-shell').evaluate(n=>n.inert)).toBe(false);
  await noOverflow(page);
});

test('Fluent mobile chapter outline opens, jumps, closes and preserves the route',async({page})=>{
  await page.setViewportSize({width:390,height:844});await goto(page,'lesson/grid-sizing/learn');
  const outline=page.locator('.chapter-contents');await expect(outline).not.toHaveAttribute('open');
  await expect(page.locator('.study-intro')).toBeVisible();const url=page.url();
  await outline.locator('summary').click();await outline.locator('[data-study-jump="step-2"]').click();
  await expect(outline).not.toHaveAttribute('open');await expect(page.locator('#study-grid-sizing-step-2')).toBeFocused();
  expect(page.url()).toBe(url);expect(await page.locator('#study-grid-sizing-step-2').evaluate(n=>n.getBoundingClientRect().top)).toBeGreaterThanOrEqual(95);
  expect(await page.getByRole('progressbar',{name:'Position in chapter, not lesson completion'}).getAttribute('aria-valuenow')).not.toBe('0');
  await noOverflow(page);await page.screenshot({path:'artifacts/evidence/fluent-mobile-reader.png'});
});

test('Fluent small-screen pane changes preserve edited code and the preview frame',async({page})=>{
  await page.setViewportSize({width:390,height:844});await goto(page,'lesson/events/playground');
  const switcher=page.getByRole('group',{name:'Playground view'});await expect(switcher).toBeVisible();
  await expect(page.getByLabel('Lesson code editor')).toBeVisible();
  const original=await page.getByLabel('Lesson code editor').inputValue();await page.getByLabel('Lesson code editor').fill(original+'\n// mobile draft');
  await switcher.getByRole('button',{name:'Preview',exact:true}).click();await expect(page.locator('.preview-pane')).toBeVisible();
  await expect(page.locator('.editor-pane')).toBeHidden();await noOverflow(page);
  await switcher.getByRole('button',{name:'Code',exact:true}).click();await expect(page.getByLabel('Lesson code editor')).toHaveValue(original+'\n// mobile draft');
  await page.getByRole('button',{name:/Run code/}).click();
  await expect(page.locator('#run-output')).toContainText('Roslyn + Uno',{timeout:90000});
  await expect(page.locator('.preview-pane')).toBeVisible();
  const channel=await page.locator('#runtime-mount iframe').getAttribute('src');
  await switcher.getByRole('button',{name:'Code',exact:true}).click();await switcher.getByRole('button',{name:'Preview',exact:true}).click();
  expect(await page.locator('#runtime-mount iframe').getAttribute('src')).toBe(channel);
  await page.frameLocator('#runtime-mount iframe').getByText('Add one',{exact:true}).click();
  await expect(page.frameLocator('#runtime-mount iframe').getByText('Count: 1',{exact:true})).toBeVisible();
  await page.screenshot({path:'artifacts/evidence/fluent-mobile-playground.png'});
  await page.setViewportSize({width:1200,height:900});await expect(page.locator('.editor-pane')).toBeVisible();await expect(page.locator('.preview-pane')).toBeVisible();
});

for(const width of [320,390,768,1024])test(`Fluent responsive routes stay within ${width}px`,async({page})=>{
  test.setTimeout(180000);await page.setViewportSize({width,height:844});
  for(const route of ['', 'paths','app-building','fundamentals','atlas','atlas/layout','lesson/grid-sizing/learn','lesson/events/check','lesson/events/notes','workshops','design-labs','design-labs/numberbox-boundaries/mockup','reference']){
    await goto(page,route);await expect(page.locator('.route-view h1').first()).toBeVisible();
    if(route.includes('/learn'))await expect(page.locator('.study-main')).toBeVisible();
    if(route.includes('/mockup'))await expect(page.locator('.ip-device')).toBeVisible();
    await noOverflow(page);
  }
});

test('Fluent solid mode and forced colors remove optional materials without losing navigation',async({page})=>{
  await page.setViewportSize({width:390,height:844});await goto(page,'');
  await page.getByRole('button',{name:'Progress and preferences'}).click();
  await page.getByLabel('Surface materials').selectOption('solid');await page.getByRole('button',{name:'Close dialog'}).click();
  await drawer(page);expect(await page.locator('.sidebar').evaluate(n=>getComputedStyle(n).backdropFilter)).toBe('none');
  await page.keyboard.press('Escape');await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await drawer(page);expect(await page.locator('.sidebar').evaluate(n=>getComputedStyle(n).backdropFilter)).toBe('none');
  await expect(page.locator('.sidebar [data-nav="paths"]')).toBeVisible();await noOverflow(page);
  await page.screenshot({path:'artifacts/evidence/fluent-high-contrast.png'});
});

for(const width of [320,390])test(`Fluent mobile search remains named and keyboard-operable at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});await goto(page,'');
  const search=page.getByRole('button',{name:'Find your next idea',exact:true});
  await expect(search).toBeVisible();await search.focus();await search.press('Enter');
  const modal=page.getByRole('dialog',{name:'LearnUno dialog'});
  await expect(modal).toBeVisible();await modal.getByLabel('Search lessons').fill('binding');
  await expect(modal.locator('#search-results a').first()).toBeVisible();
  await page.keyboard.press('Escape');await expect(search).toBeFocused();await noOverflow(page);
});

test('Fluent small-screen compiler errors reveal source without replacing the session',async({page})=>{
  await page.setViewportSize({width:390,height:844});await goto(page,'lesson/events/playground');
  await page.waitForFunction(()=>!!window.learnUnoLab);
  const original=await page.evaluate(()=>window.learnUnoLab.getValue());
  const broken=original+'\n#error Deliberate lesson diagnostic';
  await page.evaluate(code=>window.learnUnoLab.setValue(code),broken);
  const switcher=page.getByRole('group',{name:'Playground view'});
  await switcher.getByRole('button',{name:'Preview',exact:true}).click();
  const run=page.getByRole('button',{name:'Run code',exact:false});
  await run.click();await expect(run).toBeEnabled({timeout:120000});
  await expect(page.locator('#run-output')).toHaveClass(/error/);
  await expect(page.locator('#run-output')).toContainText('Deliberate lesson diagnostic');
  await expect(switcher.getByRole('button',{name:'Code',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByLabel('Lesson code editor')).toHaveValue(broken);
  const session=await page.locator('#runtime-mount iframe').getAttribute('src');
  await page.evaluate(code=>window.learnUnoLab.setValue(code),original);
  await run.click();await expect(run).toBeEnabled({timeout:120000});
  await expect(page.locator('#run-output')).toHaveClass(/success/);
  await expect(page.locator('.preview-pane')).toBeVisible();
  expect(await page.locator('#runtime-mount iframe').getAttribute('src')).toBe(session);
  await noOverflow(page);
});
