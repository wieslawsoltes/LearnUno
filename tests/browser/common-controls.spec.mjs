import {runWorkspaceCode} from './workspace-driver.mjs';
import {expectRichTextContent} from './rich-text-contract.mjs';
import {test,expect} from '@playwright/test';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';
import {unoControls} from './uno-controls.mjs';
for(const lesson of commonControlLessons)test('common controls source-backed reading and specimen: '+lesson.id,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./#/design-labs/'+lesson.id+'/read');
 await expect(page.locator('.ip-step')).toHaveCount(4);
 const source=page.locator('.cc-evidence code');await expect(source).not.toBeEmpty();await source.scrollIntoViewIfNeeded();await expect(source).toHaveAttribute('data-colored',/xml|csharp/);
 const index=await (await page.request.get('./control-study/index.json')).json();expect(await source.textContent()).toBe(index.lessons[lesson.id].code);expect(await page.locator('.cc-evidence a').getAttribute('href')).toBe(index.lessons[lesson.id].url);
 await page.goto('./#/design-labs/'+lesson.id+'/mockup');await expect(page.locator('.ip-mock-heading')).toContainText('not Uno');await expect(page.locator('.ip-device .ip-mock-content')).not.toBeEmpty();
 await page.getByRole('button',{name:'Next step',exact:true}).click();await expect(page.locator('.ip-phase-reading h2')).toHaveText(lesson.steps[1].title);
 await page.locator('#ip-width').selectOption('360');await page.locator('#ip-scale').selectOption('200');await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('button',{name:'Switch color theme'}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`artifacts/evidence/common-${lesson.id}-mobile.png`,fullPage:true});expect(errors).toEqual([]);
});
test('common controls binding specimen preserves instance ownership and resets cleanly',async({page})=>{
 await page.goto('./#/design-labs/usercontrol-contracts/mockup');await page.getByLabel('Host Title',{exact:true}).fill('A new host title');await expect(page.locator('#cc-caption')).toHaveText('A new host title');await page.locator('#cc-break').check();await expect(page.locator('#cc-caption')).toHaveText('(Title could not be resolved)');await page.locator('#cc-break').uncheck();await expect(page.locator('#cc-caption')).toHaveText('A new host title');await page.getByRole('button',{name:'Reset mockup',exact:true}).click();await expect(page.locator('#cc-host')).toHaveValue('Research queue');await page.locator('#cc-host').fill('After reset');await expect(page.locator('#cc-caption')).toHaveText('After reset');
});
test('common controls text and collection specimens preserve purpose and identity',async({page})=>{
 await page.goto('./#/design-labs/richtext-reading/mockup');const url=page.url();await page.getByRole('link',{name:'Read keyboard guidance',exact:true}).click();expect(page.url()).toBe(url);await expect(page.locator('#cc-help')).toContainText('keyboard navigation');await page.locator('#cc-vague').check();await expect(page.getByRole('link',{name:'Here',exact:true})).toBeVisible();
 await page.goto('./#/design-labs/gridview-identity/mockup');await page.getByRole('button',{name:'Select Checklist',exact:true}).click();await expect(page.getByRole('button',{name:'Select Checklist',exact:true})).toBeFocused();await page.getByRole('button',{name:'Reverse card order',exact:true}).click();await expect(page.locator('#cc-selected')).toHaveText('doc-1');await expect(page.locator('#cc-opened')).toHaveText('none');await page.getByRole('button',{name:'Open Research notes',exact:true}).click();await expect(page.locator('#cc-opened')).toHaveText('doc-2');await expect(page.locator('#cc-selected')).toHaveText('doc-1');await page.getByRole('button',{name:'Select Research notes',exact:true}).click();await page.locator('#cc-hide').check();await expect(page.locator('#cc-selected')).toHaveText('none');
});
test('common controls quantity specimen does not commit missing or fractional edits',async({page})=>{
 await page.goto('./#/design-labs/numberbox-boundaries/mockup');await page.getByRole('button',{name:'Clear input',exact:true}).click();await page.getByRole('button',{name:'Apply quantity',exact:true}).click();await expect(page.locator('#cc-accepted')).toHaveText('3');await expect(page.locator('#cc-number-result')).toContainText('Not applied');await expect(page.locator('#cc-number')).toBeFocused();await page.getByRole('button',{name:'Try fraction (2.5)',exact:true}).click();await expect(page.locator('#cc-kind')).toHaveText('fraction');await page.locator('#cc-number').fill('12');await page.getByRole('button',{name:'Apply quantity',exact:true}).click();await expect(page.locator('#cc-accepted')).toHaveText('12');await page.screenshot({path:'artifacts/evidence/common-numeric-contract.png',fullPage:true});
});
async function run(page,id,variant='code') {
 const lesson=commonControlLessons.find(item=>item.id===id);
 await page.goto('./#/design-labs/'+id+'/playground');
 await page.waitForFunction(()=>!!window.learnUnoLab);
 await runCurrentCode(page,lesson[variant]);
 return page.frameLocator('iframe[title="Real Uno WebAssembly preview"]');
}
async function runCurrentCode(page,code) {
 return runWorkspaceCode(page,code);
}
test('common controls actual Uno UserControl follows host changes without sharing instance values',async({page})=>{
 const frame=await run(page,'usercontrol-contracts');await expect(frame.getByText('Research queue',{exact:true})).toBeVisible();await expect(frame.getByText('Archive',{exact:true})).toBeVisible();await unoControls(page,frame).button('Rename host').click();await expect(frame.getByText('Release queue',{exact:true})).toBeVisible();await expect(frame.getByText('Archive',{exact:true})).toBeVisible();
});
test('common controls actual Uno inline text preserves content and activates local help',async({page})=>{
 const frame=await run(page,'richtext-reading');
 const route=page.url(),link=await expectRichTextContent(frame);
 await expect(frame.getByText('Help topic: none',{exact:true})).toBeVisible();
 await link.click();
 await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible();
 await expectRichTextContent(frame);
 expect(page.url()).toBe(route);
 // Reset through the public runner so the previous click cannot satisfy the
 // keyboard assertion without a second event actually firing.
 const starter=commonControlLessons.find(l=>l.id==='richtext-reading').code;
 await runCurrentCode(page,starter);
 await expect(frame.getByText('Help topic: none',{exact:true})).toBeVisible();
 const keyboardLink=await expectRichTextContent(frame);
 // Start before the inline link, then reach it using genuine keyboard navigation.
 await keyboardLink.focus();await keyboardLink.press('Shift+Tab');
 await page.keyboard.press('Tab');await expect(keyboardLink).toBeFocused();
 await keyboardLink.press('Enter');
 await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible();
 await expectRichTextContent(frame);
 await page.screenshot({path:'artifacts/evidence/common-richtext-live-contract.png',fullPage:true});
});
for(const variant of ['code','solution'])test(`common controls actual Uno text remains complete at narrow width: ${variant}`,async({page})=>{
 const lesson=commonControlLessons.find(l=>l.id==='richtext-reading');
 await page.setViewportSize({width:390,height:844});
 const frame=await run(page,'richtext-reading',variant);
 const link=await expectRichTextContent(frame);
 await link.click();await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible();
 await expectRichTextContent(frame);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('common controls actual Uno GridView retains keyed selection after reversing',async({page})=>{
 const frame=await run(page,'gridview-identity');await unoControls(page,frame).button('Reverse card order').click();await expect(frame.getByText('Selected key: doc-1',{exact:true})).toBeVisible();await expect(frame.getByText('Opened key: none',{exact:true})).toBeVisible();
});
test('common controls actual Uno NumberBox rejects missing and fractional input',async({page})=>{
 const frame=await run(page,'numberbox-boundaries'),controls=unoControls(page,frame);
 await controls.button('Clear input').click();await controls.button('Apply quantity').click();await expect(frame.getByText('Accepted quantity: 3',{exact:true})).toBeVisible();await expect(frame.getByText('Enter a whole quantity from 1 to 100; the accepted value is unchanged.',{exact:true})).toBeVisible();await controls.button('Try fraction (2.5)').click();await controls.button('Apply quantity').click();await expect(frame.getByText('Accepted quantity: 3',{exact:true})).toBeVisible();
});
