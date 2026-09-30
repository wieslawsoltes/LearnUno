import {test,expect} from '@playwright/test';

// The shell theme and specimen theme are distinct scopes. Check actual computed
// colors rather than accepting a screenshot with unreadable numbers or titles.
for(const shell of ['light','dark'])test(`common controls keep readable text across independent themes: ${shell}`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./#/design-labs/gridview-identity/mockup');
  if(shell==='dark')await page.getByRole('button',{name:'Switch color theme'}).click();
  for(const [id,selectors] of [
    ['gridview-identity',['.cc-report[data-selected="true"]','.cc-results>div']],
    ['numberbox-boundaries',['.cc-number-flow>div']],
    ['usercontrol-contracts',['.cc-context-strip']]
  ]){
    await page.goto('./#/design-labs/'+id+'/mockup');
    await expect(page.locator('.ip-device')).toBeVisible();
    for(const specimen of ['light','dark']){
      // Exercise the existing specimen CSS theme contract independently; no user
      // UI is bypassed to manufacture a functional outcome.
      await page.locator('.ip-device').evaluate((node,theme)=>node.dataset.demoTheme=theme,specimen);
      for(const selector of selectors){
        const ratios=await page.locator(selector).evaluateAll(nodes=>{
          const channel=n=>{n/=255;return n<=0.04045?n/12.92:Math.pow((n+0.055)/1.055,2.4);};
          const luminance=color=>{const values=color.match(/[\d.]+/g).slice(0,3).map(Number).map(channel);return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
          return nodes.map(node=>{const style=getComputedStyle(node),a=luminance(style.color),b=luminance(style.backgroundColor);return {foreground:style.color,background:style.backgroundColor,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
        });
        expect(ratios.length).toBeGreaterThan(0);
        for(const result of ratios)expect(result.ratio,`${shell} shell / ${specimen} specimen / ${selector}: ${JSON.stringify(result)}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});
