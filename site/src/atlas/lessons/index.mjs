import appBuilding from '../app-building/index.mjs';
import foundations from './foundations.mjs';
import layout from './layout.mjs';
import binding from './binding.mjs';
import architecture from './architecture.mjs';
import services from './services.mjs';
import controls from './controls.mjs';
import performance from './performance.mjs';
import platforms from './platforms.mjs';
import quality from './quality.mjs';
import internals from './internals.mjs';
export const lessonLabs=[...foundations,...layout,...binding,...architecture,...services,...controls,...performance,...platforms,...quality,...internals,...appBuilding];
export const lessonLabMap=new Map(lessonLabs.map(lab=>[lab.id,lab]));
export function lessonScene(lab,state,step=0){
 const out=lab.run(state,step);
 const valid=out.focus?.[step];
 // Authored focus bounds follow the same geometry as the corresponding model.
 return {...out,overlay:valid?`<g class="atlas-phase-focus" aria-hidden="true" pointer-events="none" data-phase-focus="${step}"><rect x="${valid[0]-3}" y="${valid[1]-3}" width="${valid[2]+6}" height="${valid[3]+6}" rx="9"/></g>`:''};
}
