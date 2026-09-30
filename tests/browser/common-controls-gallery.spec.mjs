import {test,expect} from '@playwright/test';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';

test('common controls desktop reading and mockup evidence preserves all four structures',async({page})=>{
  await page.setViewportSize({width:1440,height:1040});
  for(const lesson of commonControlLessons){
    await page.goto('./#/design-labs/'+lesson.id+'/read');
    await expect(page.locator('.ip-step')).toHaveCount(4);
    await expect(page.locator('.cc-evidence code')).not.toBeEmpty();
    await expect(page.locator('.ip-code code')).toHaveText(lesson.code,{useInnerText:false});
    await page.screenshot({path:`artifacts/evidence/common-${lesson.id}-chapter.png`,fullPage:true});
    await page.goto('./#/design-labs/'+lesson.id+'/mockup');
    await expect(page.locator('.ip-device .ip-mock-content')).not.toBeEmpty();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.screenshot({path:`artifacts/evidence/common-${lesson.id}-desktop.png`,fullPage:true});
  }
});
