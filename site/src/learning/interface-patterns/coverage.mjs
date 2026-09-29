import {interfaceLessons} from './lessons.mjs';
const entries=[
 ['TextBlock','xaml-first','XAML object construction'],['Grid','grid-sizing','Grid allocation'],['StackPanel','layout-panels','Panel policy'],['Border','spacing-alignment','Spacing and alignment'],
 ['Button','events','Events and ownership'],['TextBox','textbox-editing','Editing and commit rules'],['ListView','listview-selection','Stable selection'],['ComboBox','combobox-keys','Keyed options'],['ContentDialog','dialog-decisions','Explicit dialog decisions'],['NavigationView','navigationview-shell','Navigation shells'],['AutoSuggestBox','autosuggest-search','Search and submission'],
 ['Frame','frame-history','Navigation history'],['Page','frame-parameters','Typed navigation parameters'],['DependencyObject','dependency-properties','Property-system contracts'],['DependencyProperty','value-precedence','Effective-value precedence'],['Control','control-templates','Templated-control contracts'],['Panel','custom-panel','Implement a layout panel'],['DataTemplate','data-templates','Data contexts per item'],['ContentControl','data-templates','Content and templates'],
 ['Style','resources','Resources and styling'],['ResourceDictionary','resources','Resource scope'],['Storyboard','animation','Animation ownership'],['DoubleAnimation','animation','Timed interpolation'],['Path','vector-graphics','Vector geometry'],['Transform','vector-graphics','Coordinate transforms'],['UIElement','pointer-input','Pointer coordinate spaces'],['FocusManager','accessibility','Keyboard and automation'],
 ['VisualState','responsive-layout','Adaptive state design'],['VisualStateGroup','responsive-layout','State groups'],['AdaptiveTrigger','responsive-layout','Available-space decisions'],['VisualStateManager','responsive-layout','Visual state transitions']
];
const map={};
for(const [type,id,title]of entries)(map[type]??=[]).push({title,href:`#/lesson/${id}/learn`});
for(const lesson of interfaceLessons)for(const type of lesson.features)(map[type]??=[]).push({title:lesson.title,href:`#/design-labs/${lesson.id}/read`});
export const featureLinks=Object.freeze(Object.fromEntries(Object.entries(map).map(([name,rows])=>[name,Object.freeze(rows)])));
