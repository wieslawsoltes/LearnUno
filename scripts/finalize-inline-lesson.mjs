import {readFile,writeFile} from 'node:fs/promises';

// One-time source edit for the reviewed runner boundary. Never runs in the website.
const file='site/src/learning/interface-patterns/common-controls.mjs';
let source=await readFile(file,'utf8');
function once(text,before,after){if(text.split(before).length!==2)throw new Error('Unexpected source anchor: '+before.slice(0,90));return text.replace(before,after);}
source=once(source,'change,quiz,tips,references})','change,quiz,tips,references,runtimeNote,projectCode,projectNote})');
source=once(source,'sourceBacked:true,id,title,summary,features,prerequisites,scenario,steps,code,solution:','sourceBacked:true,id,title,summary,features,prerequisites,scenario,steps,runtimeNote,projectCode,projectNote,code,solution:');
const start=source.indexOf("define({id:'richtext-reading'"),end=source.indexOf("define({id:'gridview-identity'",start);
if(start<0||end<start)throw new Error('Missing rich-text lesson boundaries.');
let block=source.slice(start,end);
const csStart=block.indexOf('code:prefix+`')+'code:prefix+`'.length,csEnd=block.indexOf('`,change:',csStart);
if(csStart<12||csEnd<csStart)throw new Error('Missing original code example.');
const original=block.slice(csStart,csEnd);
if(!original.includes('new RichTextBlock'))throw new Error('Original block example changed.');
const replacement=`public static class Lesson
{
    public static UIElement Build()
    {
        // Uno 6.7 NativeRenderer does not implement RichTextBlock.Blocks rendering.
        // Use a real TextBlock per paragraph here; do not disguise a placeholder.
        var runtimeNote = new TextBlock
        {
            Text = "Browser exercise: TextBlock.Inlines; RichTextBlock project example is in the chapter.",
            TextWrapping = TextWrapping.Wrap
        };
        var help = new TextBlock { Text = "Help topic: none", TextWrapping = TextWrapping.Wrap };
        var paragraph = new TextBlock { FontSize = 18, TextWrapping = TextWrapping.Wrap };
        paragraph.Inlines.Add(new Run { Text = "Release review: " });
        paragraph.Inlines.Add(new Run { Text = "keep the whole instruction readable. ", FontWeight = Microsoft.UI.Text.FontWeights.SemiBold });
        var link = new Hyperlink();
        link.Inlines.Add(new Run { Text = "Read keyboard guidance" });
        link.Click += (_, _) => help.Text = "Help topic: keyboard navigation and visible focus";
        paragraph.Inlines.Add(link);
        paragraph.Inlines.Add(new Run { Text = " before publishing." });
        var reminder = new TextBlock
        {
            FontSize = paragraph.FontSize,
            TextWrapping = TextWrapping.Wrap,
            Text = "A second paragraph separates the next idea without hard-coded line positions."
        };
        var root = new StackPanel { Padding = new Thickness(24), Spacing = 16 };
        root.Children.Add(runtimeNote); root.Children.Add(paragraph);
        root.Children.Add(reminder); root.Children.Add(help);
        return root;
    }
}
`;
const runtimeNote='The installed Uno 6.7.135 NativeRenderer declares RichTextBlock as unimplemented. This browser exercise therefore uses real TextBlock.Inlines controls, one per paragraph. The source card and the separately labelled RichTextBlock example teach the block API without claiming that the browser runner renders it.';
const projectNote="Project-only RichTextBlock example: use a Windows App SDK host, or verify a newer Uno target that implements Blocks. Add the using directives and return Lesson.Build() from the host's content. It is not executed by this course's Uno 6.7 NativeRenderer. The runnable browser version above uses TextBlock.Inlines explicitly.";
block=block.slice(0,csStart)+replacement+block.slice(csEnd);
block=once(block,'code:prefix+`',`runtimeNote:${JSON.stringify(runtimeNote)},projectNote:${JSON.stringify(projectNote)},projectCode:prefix+\``+original+'`,\ncode:prefix+`');
block=once(block,"features:['RichTextBlock','Paragraph','Run','LineBreak','Hyperlink']","features:['RichTextBlock','TextBlock','Paragraph','Run','LineBreak','Hyperlink']");
block=once(block,'A formatted read-only paragraph is not an editable rich-text document, and visual emphasis alone does not create every accessibility role a document might need.','A formatted read-only paragraph is not an editable rich-text document, and visual emphasis alone does not create every accessibility role a document might need. Check the implementation as well as the type name: the installed Uno 6.7.135 RichTextBlock is marked unimplemented. Its constructor can succeed without drawing Blocks. The runnable example deliberately uses TextBlock.Inlines for each paragraph; the full RichTextBlock example remains separately labelled as project-only.');
block=once(block,'The online exercise uses a local Hyperlink click handler to show a deterministic help topic;','The online TextBlock.Inlines exercise uses a real Hyperlink click handler to show a deterministic local help topic;');
block=once(block,'Compare the complete C# paragraph in the real renderer.','Compare the complete C# inline flow in the real renderer. The two TextBlocks expose the browser fallback explicitly rather than pretending that RichTextBlock.Blocks works in this host.');
block=once(block,'Increase the paragraph size to 24 logical units and verify the complete instruction still wraps.','Increase both paragraph sizes to 24 logical units through the shared size assignment and verify that the complete instruction still wraps.');
block=once(block,'Test long content and 200 percent text without fixed-height clipping.','Test long content and 200 percent text without fixed-height clipping; verify the target control implementation before publishing.');
block=once(block,"'https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/hyperlinks']","'https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/hyperlinks','https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/RichTextBlock/RichTextBlock.cs','https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/TextBlock/TextBlock.wasm.cs']");
await writeFile(file,source.slice(0,start)+block+source.slice(end));

const app='site/src/learning/interface-patterns/app.mjs';
let view=await readFile(app,'utf8');
view=once(view,'<h2>Run the actual control.</h2><p>The fixture below creates real Uno objects. The mockup is a separate way to inspect design choices.</p>','<h2>Run the actual control.</h2><p>The fixture below creates real Uno objects. The mockup is a separate way to inspect design choices.</p>${lesson.runtimeNote?`<aside class="ip-runtime-note"><strong>Installed runner boundary</strong><p>${h(lesson.runtimeNote)}</p></aside>`:\'\'}');
view=once(view,'<section class="ip-source"><h2>','${lesson.projectCode?`<section class="ip-project-example"><h2>Full project example — RichTextBlock</h2><p>${h(lesson.projectNote)}</p><pre><code data-language="csharp">${h(lesson.projectCode)}</code></pre></section>`:\'\'}<section class="ip-source"><h2>');
await writeFile(app,view);
const css='site/design/common-controls.css';
await writeFile(css,(await readFile(css,'utf8'))+'\n/* Version boundaries belong beside the runnable code. */\n.ip-runtime-note{border-left:3px solid var(--coral);background:var(--surface-2);padding:18px 21px;margin:18px 0}.ip-runtime-note strong{font-size:13px}.ip-runtime-note p{font-size:13px;line-height:1.85;margin:10px 0 0}.ip-project-example{border-top:1px solid var(--line);padding-top:28px;margin-top:30px}.ip-project-example p{font-size:13px;line-height:1.85}.ip-project-example pre{max-height:480px;overflow:auto}\n');
const {commonControlLessons}=await import('../site/src/learning/interface-patterns/common-controls.mjs');
const lesson=commonControlLessons.find(l=>l.id==='richtext-reading');
if(lesson.code.includes('new RichTextBlock')||!lesson.projectCode.includes('new RichTextBlock')||!lesson.solution.includes('FontSize = 24'))throw new Error('Incorrect code/example separation.');
console.log('Updated inline exercise, retained complete project example and labelled runner boundary.');
