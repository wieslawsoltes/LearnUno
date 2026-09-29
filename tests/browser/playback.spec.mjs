import {test,expect} from '@playwright/test';

const lab=page=>page.locator('.visual-lab');
const position=async page=>Number(await lab(page).getAttribute('data-position'));
const setRange=async(page,name,value)=>page.getByRole('slider',{name,exact:true}).evaluate((input,n)=>{
 input.value=String(n);input.dispatchEvent(new Event('input',{bubbles:true}));
},value);
const advance=async(page,ms)=>page.clock.runFor(ms);
async function open(page,id='layout'){
 await page.clock.install();
 await page.goto('./#/atlas/'+id);
 await expect(page.locator('.atlas-step-player')).toBeVisible();
 await page.locator('#visual-play').scrollIntoViewIfNeeded();
}

test('visual atlas playback transport is beside the explanation, with bounded next and previous steps',async({page})=>{
 await open(page);
 await expect(page.locator('.v-toolbar #visual-step')).toHaveCount(0);
 await expect(page.locator('.atlas-step-player #stage-title')).toHaveText('Constraint');
 await expect(page.locator('.atlas-step-player #visual-step')).toBeVisible();
 await expect(page.getByRole('button',{name:'Previous step',exact:true})).toBeDisabled();
 for(let i=1;i<4;i++){
  await page.getByRole('button',{name:'Next step',exact:true}).click();
  await expect(lab(page)).toHaveAttribute('data-step',String(i));
  await expect(page.locator('[data-phase-focus]')).toHaveAttribute('data-phase-focus',String(i));
  await expect(lab(page)).toHaveAttribute('data-playback','paused');
 }
 await expect(page.getByRole('button',{name:'Next step',exact:true})).toBeDisabled();
 await advance(page,12000);await expect(lab(page)).toHaveAttribute('data-step','3');
 await page.getByRole('button',{name:'Previous step',exact:true}).click();
 await expect(page.locator('#stage-title')).toHaveText('Distribute');
 await page.screenshot({path:'artifacts/evidence/playback-desktop.png',fullPage:true});
});

test('visual atlas playback pause and resume retain fractional progress and update the visible icon',async({page})=>{
 await open(page);
 await page.getByRole('button',{name:'Play explanatory sequence',exact:true}).click();
 await advance(page,1100);
 await expect(page.locator('#visual-play')).toContainText('Pause');
 await expect(page.locator('#visual-play svg rect')).toHaveCount(2);
 await page.getByRole('button',{name:'Pause explanatory sequence',exact:true}).click();
 const paused=await position(page);expect(paused).toBeGreaterThan(1000);expect(paused).toBeLessThan(2400);
 await advance(page,4000);expect(await position(page)).toBe(paused);
 await expect(page.locator('#visual-play')).toHaveText('Play');
 await page.getByRole('button',{name:'Play explanatory sequence',exact:true}).click();
 await advance(page,400);expect(await position(page)).toBeGreaterThan(paused+300);
});

test('visual atlas playback manual stepping and scrubbing win over the running clock',async({page})=>{
 await open(page);await page.locator('#visual-play').click();await advance(page,300);
 await page.getByRole('button',{name:'Next step',exact:true}).click();
 expect(await position(page)).toBe(2600);await advance(page,3500);expect(await position(page)).toBe(2600);
 await page.locator('#visual-play').click();await advance(page,200);
 expect(await position(page)).toBeGreaterThan(2700);expect(await position(page)).toBeLessThan(3400);
 await setRange(page,'Playback position',650);expect(await position(page)).toBe(6760);
 await expect(lab(page)).toHaveAttribute('data-step','2');await advance(page,1000);expect(await position(page)).toBe(6760);
 await page.locator('[data-step="1"]').click();expect(await position(page)).toBe(2600);
});

test('visual atlas playback stops at the end, supports Replay, and loops only when requested',async({page})=>{
 await open(page);await setRange(page,'Playback position',950);
 await page.locator('#visual-play').click();await advance(page,1000);
 await expect(lab(page)).toHaveAttribute('data-playback','completed');expect(await position(page)).toBe(10400);
 await expect(page.getByRole('button',{name:'Replay explanatory sequence',exact:true})).toBeVisible();
 await expect(page.locator('#visual-elapsed')).toHaveText('100%');
 await page.locator('#visual-play').click();await advance(page,150);expect(await position(page)).toBeLessThan(1500);
 await page.locator('#visual-play').click();await page.getByLabel('Loop',{exact:true}).check();
 await setRange(page,'Playback position',950);await page.locator('#visual-play').click();await advance(page,1000);
 await expect(lab(page)).toHaveAttribute('data-playback','playing');expect(await position(page)).toBeLessThan(2200);
});

for(const [id,label,max,phaseTitle] of [['easing','Elapsed progress',100,'Interpolate'],['race','Timeline position',2800,'Complete']])
 test(`visual atlas playback synchronizes the ${id} inspector, scrubbing and narration`,async({page})=>{
  await open(page,id);await setRange(page,'Playback position',500);
  await expect(page.getByRole('slider',{name:label,exact:true})).toHaveValue(String(max/2));
  await expect(page.locator('#stage-title')).toHaveText(phaseTitle);
  await setRange(page,label,max*.25);await expect(lab(page)).toHaveAttribute('data-step','1');
  await expect(page.getByRole('slider',{name:'Playback position',exact:true})).toHaveValue('250');
  await page.getByRole('button',{name:'Next step',exact:true}).click();
  await expect(page.getByRole('slider',{name:label,exact:true})).toHaveValue(String(max/2));
  await page.locator('#visual-play').click();await advance(page,350);
  expect(Number(await page.getByRole('slider',{name:label,exact:true}).inputValue())).toBeGreaterThan(max/2);
  await page.locator('#visual-play').click();const paused=await position(page);
  await advance(page,800);expect(await position(page)).toBe(paused);
 });

test('visual atlas playback input edits pause automatic updates and Restart retains the experiment',async({page})=>{
 await open(page);await page.locator('#visual-play').click();await advance(page,500);
 await setRange(page,'Container width',600);await expect(lab(page)).toHaveAttribute('data-playback','paused');
 const paused=await position(page);await advance(page,4000);expect(await position(page)).toBe(paused);
 await page.getByRole('button',{name:'Restart steps',exact:true}).click();
 await expect(page.getByRole('slider',{name:'Container width',exact:true})).toHaveValue('600');expect(await position(page)).toBe(0);
 await page.getByRole('button',{name:'Reset experiment',exact:true}).click();
 await expect(page.getByRole('slider',{name:'Container width',exact:true})).toHaveValue('800');
});

test('visual atlas playback next step and speed controls remain accessible on mobile with reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await open(page);
 await expect(page.locator('#visual-play')).toBeDisabled();await advance(page,1000);
 expect(await position(page)).toBe(0);await expect(page.locator('#visual-play')).toHaveAttribute('aria-disabled','true');
 await page.getByRole('button',{name:'Next step',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(lab(page)).toHaveAttribute('data-step','1');await expect(page.locator('#visual-step')).toBeFocused();
 await expect(page.getByRole('combobox',{name:'Playback speed',exact:true})).toBeVisible();
 await page.getByRole('combobox',{name:'Playback speed',exact:true}).selectOption('0.5');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('.atlas-step-player').screenshot({path:'artifacts/evidence/playback-mobile-controls.png'});
});

test('visual atlas playback does not keep rewriting static scenes or GPU inputs while the timer advances',async({page})=>{
 await open(page,'damage');
 await page.evaluate(()=>{
  window.sceneMutationCount=0;
  window.sceneObserver=new MutationObserver(list=>window.sceneMutationCount+=list.length);
  window.sceneObserver.observe(document.querySelector('.v-scene > svg'),{childList:true});
 });
 await page.locator('#visual-play').click();await advance(page,500);
 expect(await page.evaluate(()=>window.sceneMutationCount)).toBe(0);
 await page.locator('#visual-play').click();
});

test('visual atlas playback responds to motion preference changes and cleans up on navigation',async({page})=>{
 await open(page,'easing');await page.locator('#visual-play').click();await advance(page,400);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(lab(page)).toHaveAttribute('data-playback','paused');
 const paused=await position(page);await advance(page,800);expect(await position(page)).toBe(paused);
 await page.emulateMedia({reducedMotion:'no-preference'});await expect(lab(page)).toHaveAttribute('data-playback','paused');
 await page.locator('#visual-play').click();await advance(page,200);
 await page.evaluate(()=>window.oldLab=document.querySelector('.visual-lab'));
 await page.goto('./#/atlas/layout');
 const old=await page.evaluate(()=>window.oldLab.dataset.position);await advance(page,4000);
 expect(await page.evaluate(()=>window.oldLab.dataset.position)).toBe(old);
 await expect(lab(page)).toHaveAttribute('data-playback','paused');
});
