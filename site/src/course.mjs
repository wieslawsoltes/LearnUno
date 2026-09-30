import csharpApps from './course/csharp-apps.mjs';
import everydayControls from './course/everyday-controls.mjs';
import mvvmPatterns from './course/mvvm-patterns.mjs';
import navigationPatterns from './course/navigation-patterns.mjs';
import appComposition from './course/app-composition.mjs';
import foundations from './course/foundations.mjs';
import layout from './course/layout.mjs';
import binding from './course/binding.mjs';
import architecture from './course/architecture.mjs';
import services from './course/services.mjs';
import controls from './course/controls.mjs';
import performance from './course/performance.mjs';
import platforms from './course/platforms.mjs';
import quality from './course/quality.mjs';
import internals from './course/internals.mjs';
const definitions=[
['foundations','First principles','Beginner','Start with the mental model. Build your first real controls and learn a reliable debugging loop.','bolt',foundations],
['layout','Layout & visual language','Beginner','Turn an object tree into a thoughtful, responsive interface.','grid',layout],
['binding','Data, binding & state','Intermediate','Connect state to the view without losing track of who owns each change.','layers',binding],
['architecture','Application architecture','Intermediate','Build maintainable flows with MVVM, MVUX, dependencies, and asynchronous work.','tree',architecture],
['services','Connected applications','Intermediate','Bring data, configuration, localization, and service boundaries into your app.','monitor',services],
['controls','Crafting custom UI','Advanced','Create reusable controls with real property, input, accessibility, and animation contracts.','code',controls],
['performance','Performance engineering','Advanced','Understand layout and rendering costs. Measure, optimize, and verify.','bolt',performance],
['platforms','Every platform, deliberately','Advanced','Work with renderers, interop, capabilities, assets, and deployment lifecycles.','monitor',platforms],
['quality','Quality & production','Advanced','Build evidence with tests, resilience, reproducible delivery, and a complete project.','target',quality],
['internals','Framework internals','Expert','Read the implementation, write a panel, reason about invalidation, and contribute a tested change.','code',internals],
["csharp-apps","C# for app builders","Beginner","Validate input, preserve identity, own asynchronous work and make application boundaries explicit.","code",csharpApps],
["everyday-controls","Everyday Uno controls","Beginner","Build editable forms, keyed selections, navigation shells, dialogs and searchable pickers.","grid",everydayControls],
["mvvm-patterns","MVVM patterns in practice","Intermediate","Use actual CommunityToolkit observable objects, commands, validation, messaging and edit transactions.","layers",mvvmPatterns],
["navigation-patterns","Navigation and user flows","Intermediate","Pass typed data, inspect journals, validate links, guard exits and return explicit results.","arrow",navigationPatterns],
["app-composition","DI and service composition","Advanced","Compose real service graphs, document scopes, validate lifetimes and own factories, decorators and settings.","tree",appComposition]
];
const prerequisiteOverrides={
 'csharp-apps':['foundations'], 'everyday-controls':['foundations','layout'],
 'mvvm-patterns':['binding','csharp-apps'], 'navigation-patterns':['architecture','everyday-controls'],
 'app-composition':['architecture','mvvm-patterns']
};
let nextNumber=1;
export const tracks=definitions.map(([id,title,level,summary,icon,items],index)=>({
 id,title,level,summary,icon,index,
 prerequisites:prerequisiteOverrides[id]??(index?[definitions[index-1][0]]:[]),
 lessons:items.map((lesson,order)=>({...lesson,track:id,level,order,number:nextNumber++})),
 minutes:items.reduce((sum,l)=>sum+l.minutes,0)
}));
export const appBuildingTrackIds=Object.freeze(['csharp-apps','everyday-controls','mvvm-patterns','navigation-patterns','app-composition']);
export const lessons=tracks.flatMap(track=>track.lessons);
export const lessonMap=new Map(lessons.map(lesson=>[lesson.id,lesson]));
export const trackMap=new Map(tracks.map(track=>[track.id,track]));
export const glossary=[['XAML','A declarative way to construct and configure a UI object graph.'],['Dependency property','A property managed by the framework’s value, binding, styling, and animation system.'],['DataContext','The default source context used by many runtime bindings.'],['x:Bind','Build-time generated binding code; not a feature of runtime XamlReader parsing.'],['Renderer','The implementation that turns UI state into platform output.'],['Measure / arrange','The layout phases that calculate desired sizes and assign final rectangles.'],['Virtualization','Creating only the visual containers needed for a viewport rather than all data items.'],['MVVM','Separation of domain model, presentation state/actions, and view.'],['MVUX','Uno’s reactive application approach based on immutable models, feeds, states, and generated adapters.'],['AOT','Ahead-of-time compilation, with execution, payload, and build tradeoffs.'],['Trimming','Removing code judged unused; reflection and generated contracts need special care.'],['Interop','An explicit boundary between .NET and JavaScript or native platform capabilities.']];
