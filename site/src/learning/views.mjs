import {mountFundamentals as mountCore} from './views-core.mjs';
import {guides,guideMap} from './guides.mjs';
import {mountGuideComparison} from './guide-comparisons.mjs';
export {renderLessonDepth} from './views-core.mjs';

/** Compose new chapter scenarios without duplicating the established reader. */
export function mountFundamentals(root,id){
 const disposeCore=mountCore(root,id);
 let disposeComparison=()=>{};
 if(!id){
  const heading=root.querySelector('.page-heading .eyebrow');
  if(heading)heading.textContent=`THE FUNDAMENTALS FIELD GUIDE / ${guides.length} CHAPTERS`;
 }
 const guide=guideMap.get(id);
 if(guide?.cases){
  const prose=root.querySelector('.guide-prose');
  const anchor=prose?.querySelector(':scope > h2');
  if(prose&&anchor){const section=document.createElement('section');prose.insertBefore(section,anchor);disposeComparison=mountGuideComparison(section,guide);}
 }
 return()=>{disposeComparison();disposeCore?.();};
}
