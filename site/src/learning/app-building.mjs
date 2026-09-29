import {$,$$,escapeHtml as h,icon} from '../helpers.mjs';
import {appBuildingTrackIds,trackMap,lessonMap} from '../course.mjs';
/** A task-oriented entry point. Progress remains keyed by the existing lesson IDs. */
export function mountAppBuilding(root,state){
 const tracks=appBuildingTrackIds.map(id=>trackMap.get(id));
 const goals=[
  ['Make a dependable form',['input-contracts','textbox-editing','toolkit-validation','mvvm-drafts']],
  ['Build a searchable workspace',['debounced-input','autosuggest-search','toolkit-async-command','listview-selection']],
  ['Open and close documents safely',['navigationview-shell','frame-parameters','navigation-guards','scope-ownership']],
  ['Compose a testable application',['composition-root','captive-dependencies','service-factories','options-validation']]
 ];
 root.innerHTML=`<div class="page-heading app-building-heading"><span class="eyebrow">APP-BUILDING EDITION / 30 NEW LESSONS</span><h1>Turn the concepts<br>into an application.</h1><p>Five focused paths connect C# boundaries, everyday controls, MVVM, navigation and real dependency injection. Start with your task, then follow the prerequisites at your own pace.</p></div>
 <section class="app-goal-section"><div class="section-heading"><div><span class="eyebrow">START FROM THE WORK YOU NEED TO DO</span><h2>Choose a practical goal.</h2></div></div><div class="app-goals">${goals.map(([title,ids],index)=>`<article><span class="eyebrow">WORKFLOW 0${index+1}</span><h3>${h(title)}</h3><ol>${ids.map(id=>`<li><a href="#/lesson/${id}/learn">${h(lessonMap.get(id).title)} ${icon('arrow',14)}</a></li>`).join('')}</ol></article>`).join('')}</div></section>
 <div class="section-heading"><div><span class="eyebrow">SIX LESSONS PER PATH</span><h2>Build a foundation that composes.</h2></div></div>
 <div class="app-paths">${tracks.map((t,index)=>{const done=t.lessons.filter(l=>state.lessons[l.id]?.completed).length;return `<section data-app-track="${t.id}"><header><span class="app-path-number">${String(index+1).padStart(2,'0')}</span><div><span class="eyebrow">${h(t.level)} / ${done} OF ${t.lessons.length} COMPLETE</span><h2><a href="#/path/${t.id}">${h(t.title)}</a></h2><p>${h(t.summary)}</p></div></header><div class="app-prerequisites">Recommended first: ${t.prerequisites.map(id=>`<a href="#/path/${id}">${h(trackMap.get(id).title)}</a>`).join(' · ')}</div><div class="app-path-lessons">${t.lessons.map(l=>`<a href="#/lesson/${l.id}/learn" data-app-lesson="${l.id}"><span>${state.lessons[l.id]?.completed?icon('check',16):String(l.order+1).padStart(2,'0')}</span><div><h3>${h(l.title)}</h3><p>${h(l.summary)}</p></div>${icon('arrow',16)}</a>`).join('')}</div></section>`;}).join('')}</div>
 <aside class="app-building-boundary"><strong>Learn the contract, then verify the target.</strong><p>All new examples are C# lesson documents. Toolkit and DI lessons declare the actual packages included in the updated runner and project exports; they are not homegrown replacements. Generator-based variants and Uno.Extensions project integrations are explicitly labelled project-only. Visual experiments are deterministic teaching models, not runtime traces.</p><p>Use the knowledge check and real code exercise to record completion. Reading this roadmap does not mark lessons complete or overwrite any saved draft.</p></aside>`;
 return()=>{};
}
export function appBuildingPromo(){return `<section class="app-building-promo"><div><span class="eyebrow">30 NEW APP-BUILDING LESSONS</span><h2>From knowing a control<br>to designing a whole feature.</h2><p>Practical forms, real Toolkit MVVM, typed navigation and explicit service ownership.</p></div><a class="primary" href="#/app-building">Explore the new paths ${icon('arrow',17)}</a></section>`;}
