import {test,expect} from '@playwright/test';
import {lessons} from '../../site/src/course.mjs';
import {unoControls} from './uno-controls.mjs';

test('app-building popup inspection observes real controls without choosing a decision',async({page})=>{
 const lesson=lessons.find(l=>l.id==='dialog-decisions');
 await page.goto('./#/playground/dialog-decisions');
 await page.evaluate(()=>window.learnUnoLab.start());
 const run=await page.evaluate(code=>window.learnUnoLab.request({method:'run',language:'csharp',code}),lesson.code);
 expect(run.rendered).toBe(true);
 const frame=page.frameLocator('iframe[title="Real Uno WebAssembly preview"]');
 const controls=unoControls(page,frame);
 const inspect=()=>page.evaluate(()=>window.learnUnoLab.request({method:'inspect',code:''}));
 await controls.button('Review delete decision').click();
 await expect(frame.getByText('Delete this draft?',{exact:true})).toBeVisible();
 await expect.poll(async()=> (await inspect()).openPopupCount).toBeGreaterThan(0);
 await controls.button('Keep draft').expectEnabled(true);
 const first=await inspect(),second=await inspect();
 expect(first.truncated).toBe(false);expect(second.truncated).toBe(false);
 expect(new Set(second.controls.map(c=>c.handle)).size).toBe(second.controls.length);
 // Reading the tree must not close the modal or execute either action.
 await expect(frame.getByText('Delete this draft?',{exact:true})).toBeVisible();
 await controls.button('Keep draft').click();
 await expect(frame.getByText('Draft kept',{exact:true})).toBeVisible();
 await expect.poll(async()=> (await inspect()).controls.filter(c=>c.isButton&&c.text==='Keep draft'&&c.isVisible).length).toBe(0);
 await controls.button('Review delete decision').expectEnabled(true);
 await page.screenshot({path:'artifacts/evidence/uno-dialog-decision.png',fullPage:true});
});
