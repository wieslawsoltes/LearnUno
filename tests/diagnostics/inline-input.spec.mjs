import {test} from '@playwright/test';
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
const variants=[['original',original],['native-key-adapter',original.replace('link.IsTabStop = true;',adapter)]];
// Observe actual focus traversal, including the iframe's own focus stops.
// These diagnostics are removed before release; input properties are never
// changed from Playwright to manufacture a passing accessibility assertion.
for(const [name,code]of variants)test(name,async({page})=>{
 const result={name,focus:[]};
 try{
  await page.goto('./#/design-labs/richtext-reading/playground');
  const frame=await runWorkspaceCode(page,code);
  const iframe=page.locator('iframe[title="Real Uno WebAssembly preview"]');
  await iframe.scrollIntoViewIfNeeded();
  const link=frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
  async function snapshot(label){
   result.focus.push({label,outer:await page.evaluate(()=>document.activeElement?.outerHTML.slice(0,600)),inner:await link.evaluate(e=>({focused:document.activeElement===e,active:document.activeElement?.outerHTML.slice(0,600),url:location.href}))});
  }
  await link.focus();await snapshot('programmatic focus');
  await page.keyboard.press('Shift+Tab');await snapshot('previous Tab');
  for(let i=0;i<8;i++){
   await page.keyboard.press('Tab');await snapshot('forward Tab '+(i+1));
   if(await link.evaluate(e=>document.activeElement===e))break;
  }
  result.reachable=await link.evaluate(e=>document.activeElement===e);
  if(!result.reachable)await link.focus();
  await page.keyboard.press('Enter');
  try{
   const help=frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true});
   await help.waitFor({state:'visible',timeout:5000});result.activated=true;
   result.after=await link.evaluate(()=>location.href);
   await runWorkspaceCode(page,code);result.rerun=true;
  }catch(e){result.activationError=e.message;}
 }catch(error){result.error=error.message;throw error;}
 finally{await mkdir('artifacts/inline',{recursive:true});await writeFile('artifacts/inline/'+name+'.json',JSON.stringify(result,null,2));}
});
