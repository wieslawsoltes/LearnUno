import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {commonControlLessons} from '../../site/src/learning/interface-patterns/common-controls.mjs';
import {runWorkspaceCode} from '../browser/workspace-driver.mjs';

const original=commonControlLessons.find(l=>l.id==='richtext-reading').code;
const adapter=`link.IsTabStop = true;
        // This pinned NativeRenderer exposes inlines as UIElement at runtime.
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
const variants=[
 ['native-tab-index',original.replace('link.IsTabStop = true;','link.IsTabStop = true;\n        ((UIElement)(object)link).SetHtmlAttribute("tabindex", "0");')],
 ['native-key-adapter',original.replace('link.IsTabStop = true;',adapter)]
];
// A broken anchor can navigate its frame. Each hypothesis has a fresh browser
// context, so that one failure cannot poison the remaining measurements.
for(const [name,code]of variants)test(name,async({page})=>{
 const result={name};
 try{
  await page.goto('./#/design-labs/richtext-reading/playground');
  await runWorkspaceCode(page,code);
  const iframe=page.locator('iframe[title="Real Uno WebAssembly preview"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame=page.frameLocator('iframe[title="Real Uno WebAssembly preview"]');
  const link=frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
  result.before=await link.evaluate(e=>({html:e.outerHTML,tabIndex:e.tabIndex,url:location.href}));
  await link.focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');
  result.focused=await link.evaluate(e=>document.activeElement===e);
  await expect(link).toBeFocused();await page.keyboard.press('Enter');
  await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible({timeout:10000});
  result.activated=true;result.after=await link.evaluate(()=>location.href);
  await runWorkspaceCode(page,code);result.rerun=true;
 }catch(error){result.error=error.message;throw error;}
 finally{await mkdir('artifacts/inline',{recursive:true});await writeFile('artifacts/inline/'+name+'.json',JSON.stringify(result,null,2));}
});

test('mobile preview reveal permits normal pointer activation',async({page})=>{
 const result={name:'mobile-preview'};
 try{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./#/design-labs/richtext-reading/playground');
  const frame=await runWorkspaceCode(page,original);
  result.preview=await page.locator('iframe[title="Real Uno WebAssembly preview"]').boundingBox();
  const link=frame.getByRole('link',{name:'Read keyboard guidance',exact:true});
  await link.click({timeout:15000});
  await expect(frame.getByText('Help topic: keyboard navigation and visible focus',{exact:true})).toBeVisible();
  result.activated=true;
 }catch(error){result.error=error.message;throw error;}
 finally{await mkdir('artifacts/inline',{recursive:true});await writeFile('artifacts/inline/mobile.json',JSON.stringify(result,null,2));}
});
