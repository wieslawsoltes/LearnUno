import {richTextRuntimeBoundary} from './rich-text-contract.mjs';
/** Original, source-connected common-control lessons. No project generator is simulated. */
const step=(title,explanation,worked,prompt,answer)=>({title,explanation,worked,prompt,answer});
function define({id,title,summary,features,prerequisites,scenario,steps,code,change,quiz,tips,references,runtimeNote,projectCode,projectNote,runtimeBoundary}) {
 const [before,after,challenge]=change;
 if(code.split(before).length!==2)throw new Error('Ambiguous exercise anchor: '+id);
 return {sourceBacked:true,runtimeBoundary,id,title,summary,features,prerequisites,scenario,steps,runtimeNote,projectCode,projectNote,code,solution:code.replace(before,after),language:'csharp',anchor:before,challenge,rules:[{contains:after,label:challenge}],hints:['Locate '+before+'.','Try '+after+' and test the named boundary.'],quiz,concepts:steps.slice(0,3).map(s=>[s.title,s.explanation]),tips,references,minutes:30,transfer:scenario,pitfall:'The HTML specimen explains the design contract. The separate Uno exercise creates real controls. Source excerpts belong to a pinned checkout, not necessarily the installed runner; test native input and assistive technology independently.'};
}
const prefix=`using System;
using System.Linq;
using System.ComponentModel;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Documents;
using Microsoft.UI.Xaml.Markup;

`;
export const commonControlLessons=[
define({id:'usercontrol-contracts',title:'Compose a control without stealing its context',summary:'Expose a small public contract, preserve the host DataContext, and bind internal visuals explicitly.',features:['UserControl','ContentControl','DependencyProperty','Binding'],prerequisites:['xaml-first','change-notification','dependency-properties'],scenario:'Extract a reusable summary card from a dashboard. Bind the first instance to the host title, give the second an independent title, and prove that an internal implementation detail cannot replace the caller’s binding source.',steps:[
step('Choose composition before inventing a framework','A UserControl packages a particular visual composition and its small public contract. That is useful when several screens repeat a summary card, labeled value, or empty-state panel. A templated Control serves a different requirement: consumers can replace its visual structure while preserving behavior. Do not add dependency properties for every internal pixel. Start with the values the caller owns, the actions the component exposes, and the resources it may inherit. Keep a page-specific repository or navigation service out of a generic display card unless that capability is explicitly part of its contract.','A dashboard owns its project title. SummaryCard exposes Caption, while its inner TextBlock and Border remain private implementation details. Another card can display Archive without sharing the first card’s state.','Does a UserControl need a view model or container resolution in its constructor?','No. A display component can consume explicit properties and inherited resources. Introduce dependencies only for behavior the component actually owns.'),
step('Keep the caller’s binding context intact','DataContext is an input to ordinary runtime Binding. Assigning DataContext = this on the reusable control changes what an external binding on that control will read. A host binding such as Caption = Binding Title can then search the card instead of the dashboard model. Internal visuals need a different source relationship: bind them explicitly to the control instance, an appropriate named root, or another declared source. The exercise uses Source = this on the private TextBlock binding and leaves the UserControl DataContext untouched. Explicit internal ownership and inherited external context can therefore coexist.','Edit the host title in the specimen. In the healthy configuration, the external Title binding feeds the card’s Caption and the inner visual reads Caption from the card. Enable the deliberately broken context replacement and observe the missing lookup.','Why is setting the inner binding Source different from replacing DataContext on the root?','Source changes one binding’s source. Replacing the root DataContext changes the context available to other bindings, including the caller’s Caption binding.'),
step('Make property updates observable by construction','A public dependency property participates in the framework property system. Its CLR wrapper delegates to GetValue and SetValue; internal bindings subscribe to its effective value. A host model still needs its own notification contract when Title changes. Those are two separate observation edges. Neither a constructor assignment nor a successful first render proves future updates work. Avoid storing a second unsynchronized copy of Caption inside the card. Use an equality guard in the host setter, and test changes made after the card is attached as well as its initial value.','The real Uno action renames the host from Research queue to Release queue. The bound first card updates; the independently configured Archive card should not change. Run the exercise twice to ensure instance state is not shared accidentally.','If the first card changes but the second remains Archive, is the second card broken?','No. Its Caption is deliberately independent. Reuse of a control class does not imply that its instances share mutable state.'),
step('Test the boundary rather than only the screenshot','Test two simultaneous instances, host changes after loading, an empty caption, a long translation, and removal from the visual tree. A reusable component must not retain a page through long-lived event subscriptions. Named elements inside compiled XAML also belong to namescopes; a name is not a global service locator. In a full project, use a compiled UserControl when generated fields are useful, but do not paste x:Class into the runtime XAML loader and expect generated members. Keep keyboard behavior and automation semantics inherited from the controls you compose.','Change the independent caption to a long sentence and inspect it at narrow width and larger text scale. Then update the host again and explain which instance should change and why.','What is the strongest check for the context contract?','Bind through a real host model, change that model after construction, and verify two instances independently. A static screenshot cannot prove the binding edges.')],
code:prefix+`public static class Lesson
{
    public static UIElement Build()
    {
        var model = new DashboardState();
        var first = new SummaryCard();
        first.SetBinding(SummaryCard.CaptionProperty, new Binding
        { Path = new PropertyPath(nameof(DashboardState.Title)), Mode = BindingMode.OneWay });
        var second = new SummaryCard { Caption = "Archive" };
        var rename = new Button { Content = "Rename host" };
        rename.Click += (_, _) => model.Title = "Release queue";
        var root = new StackPanel { Padding = new Thickness(24), Spacing = 16, DataContext = model };
        root.Children.Add(first); root.Children.Add(second); root.Children.Add(rename);
        return root;
    }
}
public sealed class SummaryCard : UserControl
{
    public static readonly DependencyProperty CaptionProperty = DependencyProperty.Register(
        nameof(Caption), typeof(string), typeof(SummaryCard), new PropertyMetadata(""));
    public string Caption { get => (string)GetValue(CaptionProperty); set => SetValue(CaptionProperty, value); }
    public SummaryCard()
    {
        var text = new TextBlock { FontSize = 24, TextWrapping = TextWrapping.Wrap };
        text.SetBinding(TextBlock.TextProperty, new Binding
        { Source = this, Path = new PropertyPath(nameof(Caption)), Mode = BindingMode.OneWay });
        Content = new Border { Padding = new Thickness(16), Child = text };
        // Do not set DataContext = this: the caller owns that context.
    }
}
public sealed class DashboardState : INotifyPropertyChanged
{
    private string _title = "Research queue";
    public string Title
    {
        get => _title;
        set { if (_title == value) return; _title = value; PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Title))); }
    }
    public event PropertyChangedEventHandler? PropertyChanged;
}
`,change:['Caption = "Archive"','Caption = "Saved reports"','Rename only the independent card to Saved reports; the host-bound card must still update.'],quiz:{question:'How should the private TextBlock read Caption without changing the caller’s context?',options:['Set DataContext = this on the entire reusable control.','Keep the root context and set the private binding’s Source to the control.','Copy Caption once in the constructor and never bind it.'],answer:1,explanation:'An explicit source limits the change to the internal binding. The external binding can still inherit the dashboard context and its notifications.'},tips:['Expose meaning such as Caption, not every private child.','Do not override the caller’s DataContext to make an inner binding work.','Test two instances and a host update after attachment.'],references:['https://learn.microsoft.com/en-us/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.controls.usercontrol','https://learn.microsoft.com/en-us/windows/apps/develop/data-binding/data-binding-in-depth']}),
define({id:'richtext-reading',runtimeBoundary:richTextRuntimeBoundary,title:'Make text structure carry the meaning',summary:'Use paragraphs, inline runs and descriptive links while preserving reading flow at narrow widths.',features:['RichTextBlock','TextBlock','Paragraph','Run','LineBreak','Hyperlink'],prerequisites:['assets-fonts','accessibility'],scenario:'Build a release note with normal text, emphasis, a meaningful inline help link, and a local help response. Test the reading order and link purpose at narrow width and increased text scale.',steps:[
step('Choose a text model that fits the content','TextBlock is a good default for short labels and simple text. RichTextBlock introduces block structure such as Paragraph containing inline elements such as Run and Hyperlink. A paragraph expresses a text boundary; a LineBreak only forces a break inside that flow. Neither should become a substitute for layout panels or arbitrary spacing characters. Choose the smallest control that represents the content honestly. A formatted read-only paragraph is not an editable rich-text document, and visual emphasis alone does not create every accessibility role a document might need. Check the implementation as well as the type name: the installed Uno 6.7.135 RichTextBlock is marked unimplemented. Its constructor can succeed without drawing Blocks. The runnable example deliberately uses TextBlock.Inlines for each paragraph; the full RichTextBlock example remains separately labelled as project-only.','The first paragraph combines normal text, emphasis and an inline help link; the second introduces a separate reminder. The live example uses one wrapping TextBlock per paragraph, not one absolutely positioned control per word. Compare that deliberate composition with the project-only Blocks/Paragraph example before assuming they have identical selection or overflow behavior.','Does adding LineBreak create a new Paragraph?','No. It changes the line within the existing inline flow. Use distinct paragraphs when the content has distinct block structure.'),
step('Give a link a destination-shaped name','A link should communicate its purpose without requiring the surrounding paragraph. Several links labeled here or read more become ambiguous when reviewed in a link list. Prefer a phrase such as Read keyboard guidance. Keep keyboard focus visible and distinguish navigational links from commands that mutate data. The online TextBlock.Inlines exercise uses a real Hyperlink click handler to show a deterministic local help topic; it does not open an external site or imply network access. The pinned sample demonstrates both NavigateUri and handler-based links, which are different activation contracts.','Switch the mockup between Here and Read keyboard guidance. The target stays the same, but the link’s useful accessible name changes. Inspect the explanation without relying only on its underline.','Does a blue underline guarantee a useful link name?','No. The accessible text must convey purpose, and keyboard operation must work. Color and decoration alone do not establish those contracts.'),
step('Let layout wrap text instead of cutting meaning','Text runs participate in the paragraph’s layout and inherit applicable text properties. Keeping one semantic flow lets the renderer wrap at appropriate boundaries when width or font size changes. Fixed heights can cut off content even while the individual strings remain correct. Trimming can be appropriate for a preview, but essential instructions need an accessible way to reveal the full text. Avoid treating line positions observed in one screenshot as durable identifiers: font metrics, scale, language and available width all affect line breaking.','At 200 percent text size the same release note occupies more lines. The HTML specimen measures its actual preview box; it does not claim to report Uno line metrics. Compare the complete C# inline flow in the real renderer. The two TextBlocks expose the browser fallback explicitly rather than pretending that RichTextBlock.Blocks works in this host.','Should a paragraph be assigned a fixed height just to keep two screenshots identical?','Not without a deliberate truncation contract. Preserve content and allow the surrounding layout to adapt before optimizing a screenshot.'),
step('Observe activation and retained content separately','A text-link activation may navigate, display local help, or request a supported host operation. Test that specific behavior, including repeated activation, without rebuilding unrelated input. Do not infer assistive-technology support from an HTML preview: Uno and native renderers have their own automation implementations. Review selection behavior, tab access, focus indication and the spoken link purpose on the targets you support. Keep a meaningful textual fallback when additional media cannot load, and never use a tooltip as the only source of essential instructions.','Activate the link in the real Uno preview. The help label changes while the release text remains intact. Change the emphasis to a different Run and explain why this does not change the action’s destination.','What should the link test verify beyond presence of its text?','Activation must produce the intended outcome while preserving surrounding content; keyboard and assistive-technology behavior require their own target checks.')],
runtimeNote:"The installed Uno 6.7.135 NativeRenderer declares RichTextBlock as unimplemented. This browser exercise therefore uses real TextBlock.Inlines controls, one per paragraph. The source card and the separately labelled RichTextBlock example teach the block API without claiming that the browser runner renders it.",projectNote:"Project-only RichTextBlock example: use a Windows App SDK host, or verify a newer Uno target that implements Blocks. Add the using directives and return Lesson.Build() from the host's content. It is not executed by this course's Uno 6.7 NativeRenderer. The runnable browser version above uses TextBlock.Inlines explicitly.",projectCode:prefix+`public static class Lesson
{
    public static UIElement Build()
    {
        var help = new TextBlock { Text = "Help topic: none", TextWrapping = TextWrapping.Wrap };
        var rich = new RichTextBlock { FontSize = 18, TextWrapping = TextWrapping.Wrap };
        var paragraph = new Paragraph();
        paragraph.Inlines.Add(new Run { Text = "Release review: " });
        paragraph.Inlines.Add(new Run { Text = "keep the whole instruction readable. ", FontWeight = Microsoft.UI.Text.FontWeights.SemiBold });
        var link = new Hyperlink();
        link.Inlines.Add(new Run { Text = "Read keyboard guidance" });
        link.Click += (_, _) => help.Text = "Help topic: keyboard navigation and visible focus";
        paragraph.Inlines.Add(link);
        paragraph.Inlines.Add(new Run { Text = " before publishing." });
        rich.Blocks.Add(paragraph);
        var reminder = new Paragraph();
        reminder.Inlines.Add(new Run { Text = "A second paragraph separates the next idea without hard-coded line positions." });
        rich.Blocks.Add(reminder);
        var root = new StackPanel { Padding = new Thickness(24), Spacing = 16 };
        root.Children.Add(rich); root.Children.Add(help);
        return root;
    }
}
`,
code:prefix+`public static class Lesson
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
        link.IsTabStop = true;
        link.Inlines.Add(new Run { Text = "Read keyboard guidance" });
        void ShowHelp() => help.Text = "Help topic: keyboard navigation and visible focus";
        link.Click += (_, _) => ShowHelp();
        // Compatibility adapter for this pinned browser NativeRenderer only.
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
        }
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
`,change:['FontSize = 18','FontSize = 24','Increase both paragraph sizes to 24 logical units through the shared size assignment and verify that the complete instruction still wraps.'],quiz:{question:'Which change most directly improves an ambiguous inline link?',options:['Give it a destination-specific label and preserve keyboard activation.','Replace its underline with a decorative icon only.','Break the sentence into fixed-position labels.'],answer:0,explanation:'A descriptive label identifies purpose; keyboard activation and visible focus make the link usable beyond pointer input. Decoration alone is not sufficient.'},tips:['Prefer a descriptive link phrase over here or more.','Use paragraphs for structure, not blank lines as a layout engine.','Test long content and 200 percent text without fixed-height clipping; verify the target control implementation before publishing.'],references:['https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/rich-text-block','https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/hyperlinks','https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/RichTextBlock/RichTextBlock.cs','https://github.com/unoplatform/uno/blob/6.7.135/src/Uno.UI/UI/Xaml/Controls/TextBlock/TextBlock.wasm.cs']}),
define({id:'gridview-identity',title:'A card collection is still a data collection',summary:'Separate selection, activation, order and stable keys while laying out a bounded GridView.',features:['GridView','GridViewItem','ItemsWrapGrid','ItemsPanelTemplate'],prerequisites:['data-templates','listview-selection','virtualization'],scenario:'Build a three-card document collection. Reverse the display order without losing the selected document, and expose activation separately from selection. Compare narrow and wide layouts without rebuilding the domain state.',steps:[
step('Choose a collection view, not a hand-built wall of controls','GridView presents a collection with item containers, templates and selection behavior. It is not the Grid layout panel. A panel of hand-created buttons can look similar but requires you to own selection, focus and collection updates yourself. Prefer data items and a template for a ordinary document or media collection. Give the control a finite viewport and measure the actual container behavior before claiming virtualization. A single tiny example establishes a functional contract, not how efficiently thousands of complex cards render on every target.','The real exercise uses three ReportCard records and a DataTemplate. Their title is presentation; Id identifies the document. Reversing the array changes order without changing the documents.','Is GridView interchangeable with a Grid that contains one Button per document?','No. They can resemble each other visually, but GridView owns collection/container semantics that a bare layout panel does not provide.'),
step('Keep selection distinct from opening an item','Selection describes which items the user has chosen. Activation asks the application to perform an operation on an item, such as opening it. The policies may coexist, but they must not be accidentally inferred from the same visual color. GridView exposes SelectionChanged and ItemClick for these distinct purposes when configured accordingly. Decide whether the task is picking, multi-selecting, or opening. Do not use a selection-change handler to trigger destructive work or network mutation merely because it also fires during programmatic restoration.','The specimen has Select and Open as separate controls. The Uno sample reports selection and activation in separate labels. The reorder operation restores selection without pretending that the user reopened the document.','Should restoring the selected item after sorting automatically open it?','Not unless the product explicitly defines that behavior. Restoring selection is state reconciliation, not a new activation intent.'),
step('Reconcile through identity after reordering','A selected index describes a position in the current view. After sorting, the same index can refer to a different document. Preserve a stable key before replacing the displayed collection, then resolve that key in the new view. Decide what happens when filtering removes the key: clear selection, keep a separate hidden selection, or choose a documented fallback. Do not silently switch to the first unrelated item. Equality of titles is insufficient because titles can change or repeat. A key’s lifetime belongs to the domain, not the visual container.','Select doc-1, reverse the three items, and inspect the selected key: its position moves from first to last. Select doc-2 in the mockup and hide it; view-level selection becomes empty rather than selecting a different card by position.','Can display text serve as a reliable document key?','Only when the domain explicitly guarantees its uniqueness and stability. Ordinary editable titles provide neither guarantee.'),
step('Design the card for several input modes','Avoid packing each card with many nested actions that compete with item activation. Keep the visible title and selected indication clear. Check focus movement, long labels, pointer activation, text scaling and scroll reachability. Item-template state can be recycled, so do not cache a document’s selection in a template-local Boolean that outlives the item. The HTML specimen’s responsive CSS is a design comparison, not a reproduction of ItemsWrapGrid measurement. The real Uno exercise and target-specific tests establish the control behavior.','Use the narrow and 200 percent text settings, select a card and reverse the order again. The selected key must remain meaningful even when the number of visible columns changes.','What should survive a change from three columns to one?','The chosen document and draft state should survive; only their arrangement changes. View geometry must not become the owner of document identity.')],
code:prefix+`public static class Lesson
{
    public static UIElement Build()
    {
        var cards = new[] { new ReportCard("doc-1", "Checklist"), new ReportCard("doc-2", "Research notes"), new ReportCard("doc-3", "Release plan") };
        var selection = new TextBlock { Text = "Selected key: doc-1" };
        var opened = new TextBlock { Text = "Opened key: none" };
        var view = new GridView { ItemsSource = cards, Height = 230, SelectionMode = ListViewSelectionMode.Single, IsItemClickEnabled = true };
        view.ItemTemplate = (DataTemplate)XamlReader.Load("<DataTemplate xmlns='http://schemas.microsoft.com/winfx/2006/xaml/presentation'><Border Padding='16' MinWidth='130'><TextBlock Text='{Binding Title}' TextWrapping='Wrap'/></Border></DataTemplate>");
        view.SelectedItem = cards[0];
        view.SelectionChanged += (_, _) => selection.Text = "Selected key: " + ((view.SelectedItem as ReportCard)?.Id ?? "none");
        view.ItemClick += (_, e) => opened.Text = "Opened key: " + ((ReportCard)e.ClickedItem).Id;
        var reverse = new Button { Content = "Reverse card order" };
        reverse.Click += (_, _) => {
            var key = (view.SelectedItem as ReportCard)?.Id;
            cards = cards.Reverse().ToArray();
            view.ItemsSource = cards;
            view.SelectedItem = cards.FirstOrDefault(card => card.Id == key);
        };
        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };
        root.Children.Add(selection); root.Children.Add(opened); root.Children.Add(reverse); root.Children.Add(view);
        return root;
    }
}
public sealed record ReportCard(string Id, string Title);
`,change:['Height = 230','Height = 300','Increase the bounded viewport to 300 and verify reordering still preserves doc-1.'],quiz:{question:'Which value should reconcile selection after sorting or replacing a view?',options:['The previous selected index, regardless of the new order.','The visible title, even when titles can repeat.','A stable document key resolved against the new view.'],answer:2,explanation:'The key identifies the document across ordering changes. Missing keys need an explicit policy; reusing the old index can silently select another item.'},tips:['Make selection and activation separate contracts.','Reconcile by key after sort, filter or refresh.','Keep a finite viewport and avoid nested interactive clutter in cards.'],references:['https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/listview-and-gridview','https://platform.uno/docs/articles/controls/ListViewBase.html']}),
define({id:'numberbox-boundaries',title:'A missing number is not zero',summary:'Handle NumberBox values, empty input, whole-unit rules and commit boundaries without discarding the last accepted state.',features:['NumberBox','NumberBoxValueChangedEventArgs'],prerequisites:['input-contracts','commands-validation'],scenario:'Capture a quantity of whole items. Clear the input, try a fraction, and apply a valid quantity. Invalid edits must not replace the last accepted quantity or masquerade as zero.',steps:[
step('Keep text, numeric value and accepted state separate','NumberBox supplies numeric editing, spin behavior and a Value property of type double. A cleared field can have Value equal to NaN: there is no numeric value, not an accepted zero. Text is the editing representation, while your domain may require a bounded integer, money value or unit-bearing quantity. Keep the last accepted value separate from the current edit. Use IsNaN or an explicit finite-value check instead of value == double.NaN; NaN is not equal to itself. The exercise labels quantity in whole items so the unit contract remains visible.','Start at quantity 3, then press Clear input. The field becomes missing. Apply must explain the missing value while leaving the earlier accepted quantity unchanged.','Should an empty NumberBox be persisted as integer zero?','No. Empty and zero are distinct states. Translate an empty value only under an explicit domain policy, not as an accidental parsing fallback.'),
step('Distinguish control validation from domain validation','Minimum, Maximum and NumberBox validation behavior guide editing, but they do not replace the application’s business contract. A double within bounds can still be fractional when only whole items are valid. An operation might be called without clicking the control, and values can originate from imports or services. Validate finiteness, range and integrality before converting to int. Perform the cast only after those checks. Number formatting and accepted localized syntax are separate concerns; the HTML specimen intentionally accepts a small invariant decimal subset rather than claiming to duplicate every NumberBox parser feature.','Try 2.5. It is a number and lies in the 0–100 editor range, but it violates the whole-item domain. The feedback must identify that distinction instead of saying all numeric input is invalid.','Does setting SmallChange to 1 prevent a user from typing a fraction?','No. The step increment is an interaction setting. Enforce a whole-number domain rule explicitly before committing.'),
step('Validate first, then commit atomically','A failed Apply should retain both the editable draft and the accepted value. Report what needs correcting, keep the field identifiable and preserve the user’s ability to recover. Do not update the accepted model before validating and then attempt an implicit rollback through another event. Successful acceptance is a clear state transition: record the typed quantity, update feedback and notify dependent totals if present. In a view model, expose validation and command availability consistently, but still enforce the invariant in the operation that owns the mutation.','Apply 3, clear the field, and apply again. The accepted label remains 3 while the input error changes. Restore the sample and apply it under the solution’s stricter minimum.','Which state may change after a rejected Apply?','Validation feedback may change, but the accepted domain value should not. The editable draft should remain available for correction.'),
step('Test boundary values and recovery paths','Test missing input, zero, a negative value, a fraction, the exact minimum and maximum, and a value outside the domain. Where the editor clamps values, observe its final Value rather than assuming the typed representation survived unchanged. Test keyboard commit and focus changes on the actual target, since the HTML specimen is not the Uno editor. A useful numeric form explains its unit and constraints near a persistent label. Avoid repeatedly moving focus while the person is typing or hiding errors behind a disabled button with no explanation.','The starter accepts whole quantities from 1 through 100. The solution changes the minimum to 2. Predict which of missing, 1, 2, 2.5 and 100 should now be accepted, then verify using the real control.','What changes when the minimum moves from 1 to 2?','Only the boundary policy changes: 1 is rejected, 2 and 100 remain valid, while missing and fractional values remain invalid for their original reasons.')],
code:prefix+`public static class Lesson
{
    public static UIElement Build()
    {
        const int MinimumQuantity = 1;
        int accepted = 3;
        var number = new NumberBox { Header = "Quantity (whole items)", Value = 3, Minimum = 0, Maximum = 100, SmallChange = 1, SpinButtonPlacementMode = NumberBoxSpinButtonPlacementMode.Inline };
        var report = new TextBlock { Text = "Accepted quantity: 3", TextWrapping = TextWrapping.Wrap };
        var feedback = new TextBlock { Text = "Ready", TextWrapping = TextWrapping.Wrap };
        var apply = new Button { Content = "Apply quantity" };
        apply.Click += (_, _) => {
            var value = number.Value;
            if (!double.IsFinite(value) || value != Math.Truncate(value) || value < MinimumQuantity || value > 100)
            { feedback.Text = $"Enter a whole quantity from {MinimumQuantity} to 100; the accepted value is unchanged."; return; }
            accepted = (int)value;
            report.Text = $"Accepted quantity: {accepted}";
            feedback.Text = "Quantity applied";
        };
        var clear = new Button { Content = "Clear input" };
        clear.Click += (_, _) => number.Value = double.NaN;
        var fraction = new Button { Content = "Try fraction (2.5)" };
        fraction.Click += (_, _) => number.Value = 2.5;
        var root = new StackPanel { Padding = new Thickness(24), Spacing = 12 };
        root.Children.Add(number); root.Children.Add(apply); root.Children.Add(clear); root.Children.Add(fraction); root.Children.Add(report); root.Children.Add(feedback);
        return root;
    }
}
`,change:['MinimumQuantity = 1','MinimumQuantity = 2','Require at least two whole items without overwriting the accepted state on rejected input.'],quiz:{question:'Which check belongs before converting a NumberBox value into a whole-item quantity?',options:['Only compare the displayed text with the previous label.','Check that it is finite, integral, and inside the domain bounds.','Assume SmallChange = 1 guarantees a whole numeric value.'],answer:1,explanation:'A missing or fractional value is not a valid whole-item quantity. Validate the Value and the domain boundaries before casting or mutating accepted state.'},tips:['Show the unit and bounds next to a persistent label.','Treat NaN as missing, not zero; never compare NaN by equality.','Preserve the accepted value when Apply rejects the draft.'],references:['https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/number-box','https://platform.uno/docs/articles/implemented/microsoft-ui-xaml-controls-numberbox.html']})
];
