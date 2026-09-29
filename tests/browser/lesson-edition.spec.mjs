import {test,expect} from '@playwright/test';
import {lessons} from '../../site/src/course.mjs';
import {labs,labForLesson} from '../../site/src/atlas/catalog.mjs';
import {guides} from '../../site/src/learning/guides.mjs';

test('lesson edition maps every lesson to a different authored visualization',async({page})=>{
 const observed=[];
 for(const lesson of lessons){await page.goto('./#/lesson/'+lesson.id+'/visualize');await expect(page.locator('.visual-lab')).toHaveAttribute('data-lab',labForLesson(lesson));observed.push(await page.locator('.visual-lab').getAttribute('data-lab'));}
 expect(new Set(observed).size).toBe(90);
});
test('lesson edition exposes deeper reading and twelve foundation chapters',async({page})=>{
 await page.goto('./#/lesson/events/learn');await expect(page.locator('.lesson-depth')).toContainText('Who retains the event subscriber');await expect(page.locator('.lesson-depth .depth-steps article')).toHaveCount(4);
 await page.goto('./#/fundamentals');await expect(page.locator('.guide-card')).toHaveCount(12);await page.getByRole('button',{name:'C#',exact:true}).click();await expect(page.locator('.guide-card')).toHaveCount(5);
 for(const guide of guides){await page.goto('./#/fundamentals/'+guide.id);await expect(page.getByRole('heading',{name:guide.title,exact:true})).toBeVisible();await expect(page.locator('.guide-prose pre code')).toHaveAttribute('data-colored',guide.language,{timeout:20000});await page.getByRole('textbox',{name:'Your explanation'}).fill('My prediction');await page.getByText('Compare the reasoning',{exact:true}).click();await expect(page.locator('.guide-recall details p')).toHaveText(guide.answer);}
});
test('lesson edition code coloring covers dynamic models, inline code, dialogs and reference fences',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./#/atlas/lesson-csharp-essentials');await expect(page.locator('#visual-code')).toHaveAttribute('data-colored','csharp');await expect(page.locator('#visual-code .hljs-keyword').first()).toBeVisible();
 await page.getByRole('combobox',{name:'Assignment semantics'}).selectOption('Value struct');await expect(page.locator('#visual-code')).toContainText('struct');await expect(page.locator('#visual-code .hljs-keyword').filter({hasText:'struct'})).toBeVisible();
 await page.goto('./#/lesson/xaml-first/playground');await page.getByRole('button',{name:'Compare solution',exact:true}).click();await expect(page.locator('#modal code')).toHaveAttribute('data-colored','xml');await expect(page.locator('#modal .hljs-name').first()).toBeVisible();await page.keyboard.press('Escape');
 await page.goto('./#/fundamentals/nullable-contracts');await expect(page.locator('.guide-prose pre .hljs-keyword').first()).toBeVisible();const before=await page.locator('.guide-prose pre code').textContent();await page.getByRole('button',{name:'Switch color theme'}).click();expect(await page.locator('.guide-prose pre code').textContent()).toBe(before);
 await page.evaluate(()=>{const pre=document.createElement('pre'),code=document.createElement('code');code.dataset.language='xml';code.textContent='<img src=x onerror="window.injected=true"><script>window.injected=true</script>';pre.append(code);document.querySelector('#main').append(pre);});await expect(page.locator('#main pre').last().locator('code')).toHaveAttribute('data-colored','xml');expect(await page.evaluate(()=>!!window.injected)).toBe(false);expect(await page.locator('#main pre').last().locator('img,script').count()).toBe(0);
 expect(errors).toEqual([]);
});
test('lesson edition new models expose actual distinct outcomes',async({page})=>{
 await page.goto('./#/atlas/lesson-events');await page.getByLabel('View has closed', {exact:true}).check();await expect(page.locator('#visual-metrics')).toContainText('Yes');await page.getByLabel('Handler remains subscribed',{exact:true}).uncheck();await expect(page.locator('#visual-metrics output').last()).toHaveText('No');
 await page.goto('./#/atlas/lesson-xaml-pipeline');await page.getByLabel('Give each template its own namescope',{exact:true}).uncheck();await expect(page.locator('#visual-metrics output').last()).toHaveText('Yes');
 await page.goto('./#/atlas/lesson-http-data');await page.getByRole('combobox',{name:'Fixture response status',exact:true}).selectOption('204');await expect(page.locator('#visual-metrics output').last()).toHaveText('Empty');
 await page.goto('./#/atlas/lesson-allocation-budget');await expect(page.locator('#visual-metrics output').first()).toHaveText('0');await page.getByRole('slider',{name:'Cache capacity',exact:true}).evaluate(el=>{el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));});await expect(page.locator('#visual-metrics output').first()).toHaveText('15');
});
test('lesson edition colors code without downloading Monaco or starting Uno',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('./#/fundamentals/values-and-identity');await expect(page.locator('.guide-prose pre code')).toHaveAttribute('data-colored','csharp');expect(requests.some(u=>u.includes('/runner/')||/\/editor\.js/.test(u))).toBe(false);expect(requests.some(u=>u.endsWith('/coloring.worker.js'))).toBe(true);
 await page.screenshot({path:'artifacts/evidence/fundamentals-code-coloring.png',fullPage:true});
});
test('lesson edition mobile lesson diagrams and controls stay within the page',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('./#/atlas/lesson-csharp-essentials');await expect(page.locator('#visual-code')).toHaveAttribute('data-colored','csharp');await page.getByRole('button',{name:'Next step',exact:true}).click();await expect(page.locator('#stage-title')).toHaveText('Assign');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.screenshot({path:'artifacts/evidence/lesson-specific-mobile.png',fullPage:true});
 await page.goto('./#/fundamentals/values-and-identity');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('lesson edition captures distinct scene compositions',async({page})=>{
 for(const id of ['lesson-csharp-essentials','lesson-data-templates','lesson-pointer-input','lesson-profiling','lesson-visual-regression']){await page.goto('./#/atlas/'+id);await expect(page.locator('#visual-code')).toHaveAttribute('data-colored',/\w+/);await page.screenshot({path:'artifacts/evidence/'+id+'.png',fullPage:true});}
});
