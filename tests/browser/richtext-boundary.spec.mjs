import {test,expect} from '@playwright/test';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';

test('common controls distinguish the installed inline renderer from the project block API',async({page})=>{
 await page.goto('./#/design-labs/richtext-reading/read');
 await expect(page.locator('.ip-runtime-note')).toContainText('unimplemented');
 await expect(page.locator('.ip-code code')).toContainText('new TextBlock');
 const project=page.locator('.ip-project-example code');
 await project.scrollIntoViewIfNeeded();
 await expect(project).toHaveAttribute('data-colored','csharp');
 await expect(project).toHaveText(commonControlLessons.find(l=>l.id==='richtext-reading').projectCode,{useInnerText:false});
 await expect(page.locator('.ip-project-example')).toContainText('not executed');
});

test('common controls actual Uno inline content remains visible after repeated link activation',async({page})=>{
 const lesson=commonControlLessons.find(l=>l.id==='richtext-reading');
 await page.goto('./#/design-labs/richtext-reading/playground');
 await page.waitForFunction(()=>!!window.learnUnoLab);
 const result=await page.evaluate(code=>window.learnUnoLab.request({method:'run',language:'csharp',code}),lesson.solution);
 expect(result.rendered).toBe(true);
 const frame=page.frameLocator('iframe[title="Real Uno WebAssembly preview"]');
 await expect(frame.getByText('Browser exercise: TextBlock.Inlines; RichTextBlock project example is in the chapter.',{exact:true})).toBeVisible();
 const link=frame.getByText('Read keyboard guidance',{exact:true});
 await expect(link).toBeVisible({timeout:15000});
 for(let i=0;i<2;i++){
  await link.click({timeout:15000});
  await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible();
 }
 await expect(frame.getByText('A second paragraph separates the next idea without hard-coded line positions.',{exact:true})).toBeVisible();
 await expect(frame.locator('[xamltype="Microsoft.UI.Xaml.Controls.RichTextBlock"]')).toHaveCount(0);
 await page.screenshot({path:'artifacts/evidence/common-richtext-actual-uno.png',fullPage:true});
});
