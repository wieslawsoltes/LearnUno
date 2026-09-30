import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Apply only the source adaptation that the actual browser probe just verified.
const result=JSON.parse(await readFile('artifacts/inline/native-key-adapter.json','utf8'));
if(!result.reachable||!result.activated||!result.rerun||result.error)throw new Error('Inline keyboard contract was not proven.');
const path='site/src/learning/interface-patterns/common-controls.mjs';
let source=await readFile(path,'utf8');
if(createHash('sha256').update(source).digest('hex')!=='7e24b84cdbb20e03e6a8996c2ba66aacdece29a61e4e89d4396df8d26d9ab11a')throw new Error('The reviewed source has changed.');
const before=`        // Pinned-browser adapter: Hyperlink has no KeyDown in the reference API.
        // Observe routed input on its owning TextBlock, only for the focused link.
        // Keep this workaround in the browser example, not the project comparison.
        paragraph.KeyDown += (_, args) =>
        {
            if (args.Key != Windows.System.VirtualKey.Enter ||
                link.FocusState == FocusState.Unfocused) return;
            args.Handled = true;
            ShowHelp();
        };`;
const after=`        // Compatibility adapter for this pinned browser NativeRenderer only.
        // Its inline object is a UIElement at runtime, unlike the portable API.
        // Keep this implementation detail out of the project-only comparison.
        if (OperatingSystem.IsBrowser() && (object)link is UIElement browserLink)
        {
            browserLink.SetHtmlAttribute("tabindex", "0");
            browserLink.KeyDown += (_, args) =>
            {
                if (args.Key != Windows.System.VirtualKey.Enter) return;
                args.Handled = true; // Suppress the anchor's default navigation.
                ShowHelp();
            };
        }`;
if(source.split(before).length!==2)throw new Error('Ambiguous inline adapter source.');
await writeFile(path,source.replace(before,after));

const testPath='tests/browser/common-controls.spec.mjs';
let test=await readFile(testPath,'utf8');
const oldTest=` // Start before the inline link, then reach it using genuine keyboard navigation.
 await keyboardLink.focus();await keyboardLink.press('Shift+Tab');
 await page.keyboard.press('Tab');await expect(keyboardLink).toBeFocused();
 await keyboardLink.press('Enter');`;
const newTest=` // Enter from the preceding toolbar with real Tab events. The Uno root
 // has an intermediate stop; Shift+Tab from a programmatically focused inline
 // is not an inverse traversal guarantee. Never patch or directly focus the link.
 await page.locator('iframe[title="Real Uno WebAssembly preview"]').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Fluid preview',exact:true}).focus();
 for(let attempt=0;attempt<8;attempt++){
  await page.keyboard.press('Tab');
  if(await keyboardLink.evaluate(node=>document.activeElement===node))break;
 }
 await expect(keyboardLink).toBeFocused();
 const frameUrl=await keyboardLink.evaluate(()=>location.href);
 await page.keyboard.press('Enter');
 expect(await keyboardLink.evaluate(()=>location.href)).toBe(frameUrl);`;
if(test.split(oldTest).length!==2)throw new Error('Ambiguous keyboard regression anchor.');
await writeFile(testPath,test.replace(oldTest,newTest));
console.log('Applied the proven inline adapter and genuine forward-Tab regression.');
