import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// One-time guarded application of the implementation exercised by the real
// browser probe. The normal full suite will validate the committed result.
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
source=source.replace(before,after);
await writeFile(path,source);
console.log('Applied the observed browser inline keyboard adapter.');
