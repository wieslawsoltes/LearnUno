import {test,expect} from '@playwright/test';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';
import {runWorkspaceCode} from '../browser/workspace-driver.mjs';

// Short-lived investigation: never a release gate and never a substitute for
// actual keyboard/pointer regression tests. No DOM input properties are changed.
test('inspect managed inline focus and offscreen iframe actionability',async({page})=>{
 const results=[];
 await page.goto('./#/design-labs/richtext-reading/playground');
 const frame=page.frameLocator('iframe[title="Real Uno WebAssembly preview"]');
 const original=commonControlLessons.find(l=>l.id==='richtext-reading').code;
 const variants=[
  ['explicit-tab-index',original.replace('link.IsTabStop = true;','link.IsTabStop = true;\n        link.TabIndex = 0;')],
  ['paragraph-tab-stop',original.replace('link.IsTabStop = true;','link.IsTabStop = true;\n        link.TabIndex = 0;\n        paragraph.IsTabStop = true;')],
  ['loaded-tab-index',original.replace('return root;','root.Loaded += (_, _) => { link.IsTabStop = false; link.TabIndex = 0; link.IsTabStop = true; };\n        return root;')]
 ];
 for(const [name,code]of variants){
  await runWorkspaceCode(page,code);
  const iframe=page.locator('iframe[title="Real Uno WebAssembly preview"]');
  await iframe.scrollIntoViewIfNeeded();
  const link=frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
  const before=await link.evaluate(e=>({html:e.outerHTML,tabIndex:e.tabIndex,rects:[...e.getClientRects()].map(r=>r.toJSON())}));
  await link.focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');
  const focused=await link.evaluate(e=>document.activeElement===e);
  await link.focus();await page.keyboard.press('Enter');
  const help=await frame.getByText('Help topic:',{exact:false}).allTextContents();
  results.push({name,before,focused,help});
 }
 await page.setViewportSize({width:390,height:844});
 await runWorkspaceCode(page,original);
 const iframe=page.locator('iframe[title="Real Uno WebAssembly preview"]');
 const beforeScroll=await iframe.boundingBox();
 await iframe.scrollIntoViewIfNeeded();
 const link=frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
 let clicked=false,error=null;
 try{await link.click({timeout:10000});clicked=true;}catch(e){error=e.message;}
 results.push({name:'mobile-scrolled-preview',beforeScroll,clicked,error,help:await frame.getByText('Help topic:',{exact:false}).allTextContents()});
 await test.info().attach('inline-behavior',{body:JSON.stringify(results,null,2),contentType:'application/json'});
 console.log('INLINE_BEHAVIOR '+JSON.stringify(results));
 await expect(page.locator('#run-output')).toHaveClass(/success/);
});
