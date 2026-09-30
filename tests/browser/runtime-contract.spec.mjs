import {test,expect} from '@playwright/test';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';
const lesson=commonControlLessons.find(l=>l.id==='richtext-reading');

test('common controls reader keeps supported live code separate from the project-only equivalent',async({page})=>{
  await page.goto('./#/design-labs/richtext-reading/read');
  const boundary=page.getByRole('note',{name:'Runtime implementation boundary'});
  await expect(boundary).toBeVisible();
  await expect(boundary).toContainText(lesson.runtimeBoundary.runner);
  await expect(boundary).toContainText(lesson.runtimeBoundary.live);
  await expect(page.locator('.ip-code code')).toHaveText(lesson.code,{useInnerText:false});
  const project=page.locator('.ip-project-example code[data-language="csharp"]');
  await project.scrollIntoViewIfNeeded();await expect(project).toBeVisible();
  await expect(project).toHaveText(lesson.projectCode,{useInnerText:false});
  await expect(project).toHaveAttribute('data-colored','csharp');
  await expect(page.locator('.ip-project-example')).toContainText('not executed');
  await boundary.scrollIntoViewIfNeeded();
  await boundary.getByText('Why the two examples are different',{exact:true}).click();
  await expect(boundary.getByRole('link',{name:'Inspect the runner-version RichTextBlock implementation ↗'}))
    .toHaveAttribute('href',lesson.runtimeBoundary.sourceUrl);
  await expect(boundary).toContainText('Uno.NotImplemented');
});

test('common controls preserve saved drafts and show the implementation boundary on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./#/design-labs/richtext-reading/read');
  await page.getByRole('button',{name:'Switch color theme'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.evaluate(code=>localStorage.setItem('learnuno.interface-pattern-drafts.v1',JSON.stringify({
    'richtext-reading':code,'usercontrol-contracts':'// Keep this separate user draft.'
  })),lesson.projectCode);
  await page.goto('./#/design-labs/richtext-reading/playground');
  await page.waitForFunction(()=>!!window.learnUnoLab);
  expect(await page.evaluate(()=>window.learnUnoLab.getValue())).toBe(lesson.projectCode);
  await expect(page.getByRole('note',{name:'Runtime implementation boundary'})).toContainText('does not replace your edits');
  await page.getByRole('button',{name:'Reset code',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Reset code',exact:true}).click();
  expect(await page.evaluate(()=>window.learnUnoLab.getValue())).toBe(lesson.code);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('learnuno.interface-pattern-drafts.v1')));
  expect(saved['usercontrol-contracts']).toBe('// Keep this separate user draft.');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
