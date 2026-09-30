import {test,expect} from '@playwright/test';
import {applicationGuides} from '../../site/src/learning/application-guides.mjs';
for(const guide of applicationGuides)test('lesson edition application fundamentals: '+guide.id,async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./#/fundamentals/'+guide.id);
 await expect(page.getByRole('heading',{name:guide.title,exact:true})).toBeVisible();
 await expect(page.locator('.guide-prose .concept')).toHaveCount(4);
 await expect(page.locator('.guide-comparison tbody tr')).toHaveCount(4);
 await page.getByRole('button',{name:guide.cases[1].label,exact:true}).click();
 await expect(page.locator('.guide-comparison caption')).toContainText(guide.cases[1].label);
 await expect(page.getByRole('button',{name:guide.cases[1].label,exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.guide-prose pre code')).toHaveAttribute('data-colored',guide.language);
 expect(await page.locator('.guide-prose pre code').textContent()).toBe(guide.code);
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('button',{name:'Switch color theme'}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 expect(errors).toEqual([]);
});
test('lesson edition new guide screenshots and correct dynamic count',async({page})=>{
 await page.goto('./#/fundamentals');await expect(page.locator('.guide-card')).toHaveCount(18);await expect(page.locator('.page-heading .eyebrow')).toContainText('18 CHAPTERS');
 await page.goto('./#/fundamentals/notification-boundaries');await page.screenshot({path:'artifacts/evidence/fundamentals-notification-boundaries.png',fullPage:true});
 await page.goto('./#/fundamentals/command-observation');await page.getByRole('button',{name:'Observation invalidated',exact:true}).click();await page.screenshot({path:'artifacts/evidence/fundamentals-command-observation.png',fullPage:true});
});
