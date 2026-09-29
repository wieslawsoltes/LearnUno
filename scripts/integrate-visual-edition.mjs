import {readFile,writeFile} from 'node:fs/promises';

// One-time, exact-source integration. The resulting source is committed, never patched at runtime.
function replaceOnce(source,before,after,path){
 if(source.split(before).length!==2)throw new Error(`Unexpected integration anchor in ${path}: ${before.slice(0,90)}`);
 return source.replace(before,after);
}
async function edit(path,edits){
 let source=await readFile(path,'utf8');
 for(const [before,after]of edits)source=replaceOnce(source,before,after,path);
 await writeFile(path,source);
}
const app='site/src/app.mjs';
let source=await readFile(app,'utf8');
const start=source.indexOf('function home(root)'),end=source.indexOf('function paths(root)',start);
if(start<0||end<start)throw new Error('Unexpected homepage integration boundaries.');
source=source.slice(0,start)+'function home(root){cleanup=mountHome(root,state,tracks,lessons);}\n'+source.slice(end);
await writeFile(app,source);
await edit(app,[
 ["import {mountVisual} from './visuals.mjs';","import {mountVisual} from './visuals.mjs';\nimport {mountAtlas,mountLab} from './atlas/lab.mjs';\nimport {mountHome} from './atlas/home.mjs';"],
 ["['paths','layers','Learning paths'],['playground'","['paths','layers','Learning paths'],['atlas','grid','Visual atlas'],['playground'"],
 ["mountVisual(content,l.diagram,state.preferences.motion!==false)","mountVisual(content,l.diagram,state.preferences.motion!==false,l)"],
 ["parts=decodeURIComponent(location.hash.slice(1)).split('/').filter(Boolean);","parts=location.hash.slice(1).split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);"],
 ["const names={paths:","const names={atlas:'The visual atlas',paths:"],
 ["else if(page==='paths')paths(root);","else if(page==='paths')paths(root);else if(page==='atlas')cleanup=id?mountLab(root,id,{motion:state.preferences.motion!==false,query:location.hash.split('?').slice(1).join('?')}):mountAtlas(root,state.preferences.motion!==false);"],
 ["Its diagrams use WebGPU compute and rendering when available, with Canvas 2D and accessible HTML alternatives.","Its visual atlas contains eleven interactive SVG/HTML experiments. The dirty-tile lab also executes a WebGPU compute-and-render pass and checks every tile against a CPU reference. SVG and text remain available without a GPU."]
]);
await edit('site/index.html',[
 ['<link rel="stylesheet" href="./styles.css">','<link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./visual.css">'],
 ['content="#151426"','content="#173d47"']
]);
await edit('scripts/build.mjs',[
 ["['index.html', 'styles.css', 'favicon.svg']","['index.html', 'styles.css', 'visual.css', 'favicon.svg']"],
 ["await writeFile('dist/.nojekyll', '');","await cp('site/design', 'dist/design', {recursive: true});\nawait writeFile('dist/.nojekyll', '');"]
]);
await edit('site/src/atlas/lab.mjs',[
 ['data-control="${c.key}" type="range"','data-control="${c.key}" aria-label="${h(c.label)}" type="range"']
]);
const studio='tests/browser/studio.spec.mjs';source=await readFile(studio,'utf8');
const a=source.indexOf("test('interactive model"),b=source.indexOf("test('pinned documentation",a);
if(a<0||b<a)throw new Error('Unexpected model-test integration boundaries.');
source=source.slice(0,a)+`test('interactive model has working controls and an explicit renderer boundary',async({page})=>{await page.goto('./#/lesson/binding-flow/visualize');await expect(page.locator('#visual-backend')).toContainText('SVG + HTML');await page.getByLabel('Source · Title').fill('New source');await expect(page.getByLabel('Target · Text')).toHaveValue('New source');await page.getByLabel('Raise PropertyChanged').uncheck();await page.getByLabel('Source · Title').fill('Not notified');await expect(page.getByLabel('Target · Text')).toHaveValue('New source');await page.getByRole('button',{name:'Next stage',exact:true}).click();await expect(page.locator('#stage-title')).toHaveText('Notify');await page.screenshot({path:'artifacts/evidence/visual-model.png',fullPage:true});});\n`+source.slice(b);
await writeFile(studio,source);
await edit('tests/browser/webgpu.spec.mjs',[
 ["./#/lesson/binding-flow/visualize","./#/atlas/damage"],
 ['gpuEvidence.submissions >= 2','gpuEvidence.submissions >= 1'],
 ["await page.locator('#visual-play').click();",`await expect(page.locator('#gpu-result')).toContainText('exact CPU match');
    await page.getByLabel('Tile size').selectOption('16');
    await page.waitForFunction(() => {const e=JSON.parse(document.querySelector('.visual-lab').dataset.gpuEvidence || '{}');return e.tiles===800 && e.mismatches===0;});
    const previousRevision = await page.locator('.visual-lab').evaluate(e => JSON.parse(e.dataset.gpuEvidence).revision);
    await page.getByRole('button',{name:'Separated',exact:true}).click();
    await page.waitForFunction(previous => {const e=JSON.parse(document.querySelector('.visual-lab').dataset.gpuEvidence || '{}');return e.revision>previous && e.tiles===800 && e.mismatches===0;}, previousRevision);
    await expect(page.locator('#gpu-result')).toContainText('exact CPU match');`]
]);
await edit('.github/workflows/studio.yml',[["pinned documentation|WebGPU compute'","pinned documentation|WebGPU compute|visual atlas'"]]);
await edit('README.md',[
 ['## Learn by making something happen','## The visual edition\n\nExplore the [visual atlas](https://wieslawsoltes.github.io/LearnUno/#/atlas): eleven inspectable labs for layout, binding, visual trees, spacing, state machines, async races, virtualization, invalidation, dirty tiles, easing and value precedence. The redesigned studio connects each experiment to a real Uno playground. See [design and model documentation](docs/visual-edition.md).\n\n## Learn by making something happen'],
 ['**Interactive explanations.** Step through eight visual-model families. Explore notification flow, star sizing, and virtualized ranges. WebGPU uses actual compute and render passes when available; Canvas 2D and accessible HTML preserve the explanation without a GPU.','**Interactive explanations.** Explore eleven different labs with direct manipulation, scenario presets, equation readouts, event traces, linked code, shared inputs and explicit model boundaries. The dirty-tile lab runs actual WebGPU compute and rendering, then checks every output against a CPU reference. SVG and accessible HTML keep the explanations usable without a GPU.'],
 ['site/src/visuals.mjs   WebGPU/Canvas visual models and HTML experiments','site/src/atlas/        Eleven SVG/HTML labs, pure models and GPU tile classification\nsite/design/          Editorial shell, lab styling and responsive layouts\nsite/src/visuals.mjs   Lesson-to-atlas integration']
]);
console.log('Integrated the visual edition into the existing source, build, documentation and regression suites.');
