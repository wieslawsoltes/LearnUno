import {expectRichTextContent} from './rich-text-contract.mjs';
import {test,expect} from '@playwright/test';
import {interfaceLessons} from '../../site/src/learning/interface-patterns/lessons.mjs';
for(const l of interfaceLessons)test('design lesson reading, mockup and recall: '+l.id,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('./#/design-labs/'+l.id+'/read');await expect(page.locator('.ip-step')).toHaveCount(4);await expect(page.locator('.ip-code code')).toHaveText(l.code,{useInnerText:false});await page.locator('[data-jump="2"]').click();await expect(page.locator('#ip-step-2')).toBeFocused();
 await page.goto('./#/design-labs/'+l.id+'/mockup');await expect(page.locator('.ip-mock-heading')).toContainText('HTML design mockup');await page.getByRole('button',{name:'Next step',exact:true}).click();await expect(page.locator('.ip-phase-reading h2')).toHaveText(l.steps[1].title);await page.locator('#ip-width').selectOption('360');await page.locator('#ip-scale').selectOption('150');await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.goto('./#/design-labs/'+l.id+'/check');await page.getByRole('radio').nth(l.quiz.answer).check();await page.getByRole('button',{name:'Check my reasoning',exact:true}).click();await expect(page.locator('#ip-feedback')).toContainText('matches the contract');expect(errors).toEqual([]);
});
test('design mockups preserve form drafts and document identity',async({page})=>{
 await page.goto('./#/design-labs/keyboard-first-forms/mockup');await page.locator('#ip-title').fill('x');await page.getByRole('button',{name:'Save project',exact:true}).click();await expect(page.locator('#ip-title')).toBeFocused();await expect(page.locator('#ip-title')).toHaveValue('x');await page.locator('#ip-title').fill('Design review');await page.getByRole('button',{name:'Save project',exact:true}).click();await expect(page.locator('#ip-form-result')).toHaveText('Saved: Design review');
 await page.goto('./#/design-labs/adaptive-detail/mockup');await page.getByRole('button',{name:'Usability notes',exact:true}).click();await page.getByLabel('Document draft note').fill('Preserve this draft');await page.locator('#ip-width').selectOption('360');await expect(page.locator('#ip-selected')).toHaveText('notes');await expect(page.getByLabel('Document draft note')).toHaveValue('Preserve this draft');
 await page.screenshot({path:'artifacts/evidence/design-adaptive-detail.png',fullPage:true});
});
test('design source map exposes pinned evidence and honest lesson gaps',async({page})=>{
 await page.goto('./#/feature-map');
 await expect(page.locator('.ip-survey-summary')).toContainText('discovered public UI types');
 await page.locator('#ip-feature-search').fill('ScrollViewer');
 const exact=page.locator('.ip-feature').filter({has:page.getByRole('heading',{name:'ScrollViewer',exact:true})});
 await expect(exact).toHaveCount(1);
 await expect(exact).toContainText('Connected learning material');
 // Search is substring-based: associated types must remain discoverable.
 const headings=await page.locator('.ip-feature h2').allTextContents();
 expect(headings.every(name=>name.toLowerCase().includes('scrollviewer'))).toBe(true);
 expect(headings).toContain('ScrollViewerExtensions');
 await page.locator('#ip-feature-search').fill('');
 await page.locator('#ip-gaps').check();
 await expect(page.locator('.ip-feature').first()).toContainText('Reference-only');
 await expect(page.locator('.ip-coverage.guided')).toHaveCount(0);
 await page.screenshot({path:'artifacts/evidence/feature-coverage.png',fullPage:true});
});
test('design all C# examples execute in actual Uno',async({page})=>{
 test.skip(!!process.env.PUBLIC_URL,'All design C# variants are exercised before deployment.');test.setTimeout(300000);await page.goto('./#/design-labs/bounded-scrolling/playground');await page.waitForFunction(()=>!!window.learnUnoLab);await page.evaluate(()=>window.learnUnoLab.start());const evidence=[];
 for(const lesson of interfaceLessons)for(const variant of ['code','solution']){const result=await page.evaluate(p=>window.learnUnoLab.request(p),{method:'run',language:'csharp',code:lesson[variant]});evidence.push({id:lesson.id,variant,...result});expect.soft(result.rendered,lesson.id+': '+JSON.stringify(result.diagnostics||result)).toBe(true);if(lesson.id==='richtext-reading'&&result.rendered)await expectRichTextContent(page.frameLocator('iframe[title="Real Uno WebAssembly preview"]'));}
 await test.info().attach('design-runtime-results',{body:JSON.stringify(evidence,null,2),contentType:'application/json'});
});
