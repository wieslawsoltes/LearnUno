import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';
import {runWorkspaceCode} from '../browser/workspace-driver.mjs';

const original=commonControlLessons.find(l=>l.id==='richtext-reading').code;
const adapter=`link.IsTabStop = true;
        if (OperatingSystem.IsBrowser() && (object)link is UIElement browserLink)
        {
            browserLink.SetHtmlAttribute("tabindex", "0");
            browserLink.KeyDown += (_, args) =>
            {
                if (args.Key != Windows.System.VirtualKey.Enter) return;
                args.Handled = true;
                ShowHelp();
            };
        }`;

test('native-key-adapter',async({page})=>{
 const result={name:'native-key-adapter',focus:[]};
 try{
  await page.goto('./#/design-labs/richtext-reading/playground');
  const frame=await runWorkspaceCode(page,original.replace('link.IsTabStop = true;',adapter));
  const iframe=page.locator('iframe[title="Real Uno WebAssembly preview"]');
  await iframe.scrollIntoViewIfNeeded();
  const link=frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
  // Begin outside the frame, before the preview in DOM order. Shift+Tab from
  // the only inline is not a portable inverse: the Uno root has its own stops.
  await page.getByRole('button',{name:'Fluid preview',exact:true}).focus();
  for(let i=0;i<8;i++){
   await page.keyboard.press('Tab');
   const focused=await link.evaluate(e=>document.activeElement===e);
   result.focus.push({step:i+1,focused,outer:await page.evaluate(()=>document.activeElement?.outerHTML.slice(0,300)),inner:await link.evaluate(()=>document.activeElement?.outerHTML.slice(0,300))});
   if(focused)break;
  }
  result.reachable=await link.evaluate(e=>document.activeElement===e);
  await expect(link).toBeFocused();
  const url=await link.evaluate(()=>location.href);
  await page.keyboard.press('Enter');
  await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible({timeout:10000});
  result.activated=true;expect(await link.evaluate(()=>location.href)).toBe(url);
  await runWorkspaceCode(page,original.replace('link.IsTabStop = true;',adapter));result.rerun=true;
 }catch(error){result.error=error.message;throw error;}
 finally{await mkdir('artifacts/inline',{recursive:true});await writeFile('artifacts/inline/native-key-adapter.json',JSON.stringify(result,null,2));}
});
