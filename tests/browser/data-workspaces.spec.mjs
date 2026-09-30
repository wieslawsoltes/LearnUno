import {test,expect} from '@playwright/test';
import {dataWorkspaces} from '../../site/src/learning/data-workspaces/lessons.mjs';
for(const lesson of dataWorkspaces)test('data workspace workshop: '+lesson.id,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./#/workshops/'+lesson.id+'/read');
 await expect(page.getByRole('heading',{name:lesson.title,exact:true})).toBeVisible();
 await expect(page.locator('.dw-step')).toHaveCount(4);
 const code=page.locator('.dw-reading pre code').first();await expect(code).toHaveText(lesson.code,{useInnerText:false});
 await page.locator('[data-jump="2"]').click();await expect(page.locator('#dw-step-2')).toBeFocused();
 await page.goto('./#/workshops/'+lesson.id+'/explore');await expect(page.locator('.dw-metrics output')).toHaveCount(3);
 await page.getByRole('button',{name:'Next step',exact:true}).click();await expect(page.locator('#dw-phase-count')).toHaveText('Step 2 of 4');
 await expect(page.locator('.dw-phase-reading h2')).toHaveText(lesson.steps[1].title);
 await page.getByRole('button',{name:'Previous step',exact:true}).click();await expect(page.locator('#dw-phase-count')).toHaveText('Step 1 of 4');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.goto('./#/workshops/'+lesson.id+'/check');await page.getByRole('radio').nth(lesson.quiz.answer).check();await page.getByRole('button',{name:'Check my reasoning'}).click();await expect(page.locator('.dw-feedback')).toContainText('matches the contract');
 expect(errors).toEqual([]);
});
test('data workspace history preserves the intended branch',async({page})=>{
 await page.goto('./#/workshops/undo-redo/explore');await page.getByRole('button',{name:'Reproduce A → B → C → Undo → D',exact:true}).click();
 await expect(page.locator('.dw-metrics output').nth(1)).toHaveText('D');await expect(page.locator('.dw-metrics output').nth(2)).toHaveText('0');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.dw-metrics output').nth(1)).toHaveText('B');
 await page.getByRole('button',{name:'Redo',exact:true}).click();await expect(page.locator('.dw-metrics output').nth(1)).toHaveText('D');
});
test('data workspace all C# variants execute in the installed real Uno runner',async({page})=>{
 test.skip(!!process.env.PUBLIC_URL,'All variants are executed before deployment; public journeys check workshop rendering.');
 test.setTimeout(300000);await page.goto('./#/workshops/value-converters/playground');
 await page.waitForFunction(()=>!!window.learnUnoLab);await page.evaluate(()=>window.learnUnoLab.start());
 const results=[];
 for(const lesson of dataWorkspaces)for(const variant of ['code','solution']){
  const result=await page.evaluate(payload=>window.learnUnoLab.request(payload),{method:'run',language:'csharp',code:lesson[variant]});
  results.push({id:lesson.id,variant,...result});expect.soft(result.rendered,lesson.id+' '+variant+': '+JSON.stringify(result.diagnostics||result)).toBe(true);
 }
 await test.info().attach('data-workspace-runtime-variants',{body:JSON.stringify(results,null,2),contentType:'application/json'});
});
