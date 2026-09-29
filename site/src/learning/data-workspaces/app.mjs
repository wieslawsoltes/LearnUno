import {dataWorkspaces} from './lessons.mjs';
import {definitions,initialHistory,historyTransition} from './models.mjs';
import {controlledComparison} from './comparisons.mjs';
import {drawScene,escape as h} from './scenes.mjs';
import {mountWorkspace} from '../../workspace.mjs';
import {lessonMap} from '../../course.mjs';
const key='learnuno.data-workspace-drafts.v1';
const q=(selector,root)=>root.querySelector(selector);
const qa=(selector,root)=>[...root.querySelectorAll(selector)];
function storageState() {
 const result={version:1,drafts:{},lessons:{},notes:{},bookmarks:[],preferences:{}};
 try {
  const saved=JSON.parse(localStorage.getItem(key)||'null');
  if(saved?.version===1)for(const lesson of dataWorkspaces){const text=saved.drafts?.[lesson.id];if(typeof text==='string'&&text.length<=100000)result.drafts[lesson.id]=text;}
 } catch {}
 return result;
}
const link=(id,tab='read')=>`#/workshops/${id}/${tab}`;
function controls(definition,state) {
 return definition.controls.map(([id,label,type,a,b,c])=>{
  if(type==='check')return `<label class="dw-toggle"><input type="checkbox" data-input="${id}" ${state[id]?'checked':''}> ${h(label)}</label>`;
  if(type==='select')return `<label>${h(label)}<select data-input="${id}" aria-label="${h(label)}">${a.map(value=>`<option ${state[id]===value?'selected':''}>${h(value)}</option>`).join('')}</select></label>`;
  if(type==='text')return `<label>${h(label)}<input data-input="${id}" type="text" maxlength="60" aria-label="${h(label)}" value="${h(state[id])}"></label>`;
  return `<label>${h(label)} <output data-readout="${id}">${h(state[id])}</output><input data-input="${id}" aria-label="${h(label)}" type="range" min="${a}" max="${b}" step="${c}" value="${state[id]}"></label>`;
 }).join('');
}
export function mountDataWorkspaces(root,id,tab='read') {
 let disposed=false,disposeLab=()=>{};
 const lesson=dataWorkspaces.find(l=>l.id===id);
 if(!id){root.innerHTML=`<section class="dw-index"><span class="eyebrow">APP-BUILDING WORKSHOPS / DATA WORKSPACES</span><h1>Build screens that keep their promises.</h1><p>Six connected workshops on typed presentation, loaded data, request outcomes, conflicting edits, notifications, and history. These are additional workshops, separate from the core course completion count.</p><div class="dw-cards">${dataWorkspaces.map((l,i)=>`<a href="${link(l.id)}"><span>0${i+1}</span><h2>${h(l.title)}</h2><p>${h(l.summary)}</p><small>Four detailed steps · interactive model · Uno exercise →</small></a>`).join('')}</div><p class="dw-boundary">Visual calculations are explicit teaching models. The Playground section invokes the installed Uno/Roslyn runner; a source snippet is not labelled verified until the release pipeline compiles and executes it.</p></section>`;return()=>{};}
 if(!lesson){root.innerHTML='<h1>Workshop not found</h1><a href="#/workshops">Return to data workspaces</a>';return()=>{};}
 if(!['read','explore','playground','check'].includes(tab))tab='read';
 root.innerHTML=`<article class="dw-workshop"><a href="#/workshops">← Data workspaces</a><header><span class="eyebrow">PRACTICAL APPLICATION ENGINEERING</span><h1>${h(lesson.title)}</h1><p>${h(lesson.summary)}</p><div class="dw-prerequisites">Build on: ${lesson.prerequisiteLessons.filter(i=>lessonMap.has(i)).map(i=>`<a href="#/lesson/${i}/learn">${h(lessonMap.get(i).title)}</a>`).join(' · ')||'the core binding and state lessons'}</div></header><nav aria-label="Workshop sections">${[['read','Read & reason'],['explore','Explore the model'],['playground','Real Uno exercise'],['check','Recall & transfer']].map(([t,label])=>`<a href="${link(id,t)}" ${t===tab?'aria-current="page"':''}>${label}</a>`).join('')}</nav><div class="dw-body"></div><footer class="dw-footer"><strong>Execution and model boundaries</strong><p>${h(lesson.pitfall)}</p><p>Reading and model interactions do not alter core lesson completion. Workshop editor drafts use a separate, bounded browser-local store.</p></footer></article>`;
 const body=q('.dw-body',root);
 if(tab==='read') {
  body.innerHTML=`<section class="dw-predict"><span class="eyebrow">PREDICT BEFORE RUNNING</span><p>${h(lesson.predict)}</p></section><div class="dw-reading"><div><figure class="dw-inline-model"><div class="dw-inline-heading"><span class="eyebrow">INSPECT THE IDEA WHILE YOU READ</span><button class="secondary small" id="dw-compare">Show the controlled variation</button></div><div class="dw-scroll"><svg viewBox="0 0 800 400" role="img" aria-label="${h(lesson.title)} inline model"></svg></div><figcaption></figcaption><a href="${link(id,'explore')}">Manipulate all model inputs →</a></figure>${lesson.steps.map((s,i)=>`<section id="dw-step-${i}" class="dw-step" tabindex="-1"><span class="eyebrow">STEP ${i+1} / 4</span><h2>${h(s.title)}</h2><p>${h(s.explanation)}</p><aside class="dw-worked"><strong>Work through a situation</strong><p>${h(s.worked)}</p></aside><details><summary>${h(s.prompt)}</summary><p>${h(s.answer)}</p></details></section>`).join('')}<section class="dw-practice-cases"><span class="eyebrow">CONTROLLED PRACTICE</span><h2>Change one assumption at a time</h2>${lesson.practiceCases.map(item=>`<article><h3>${h(item.title)}</h3><p><strong>Change:</strong> ${h(item.change)}</p><details><summary>Compare your predicted result</summary><p><strong>Expected:</strong> ${h(item.expected)}</p><p>${h(item.reason)}</p></details></article>`).join('')}</section><section><h2>Connect the reasoning to code</h2><p>The following is the authored starter for the real Uno exercise. It uses core .NET and Uno APIs rather than pretending to run a project source generator.</p><pre><code data-language="csharp">${h(lesson.code)}</code></pre><a class="primary" href="${link(id,'playground')}">Edit and run in Uno →</a></section><section class="dw-sources"><h2>Read the API contract</h2><p>Use the original API documentation together with the pinned Uno reference library. API presence is not a substitute for target-specific behavior tests.</p>${lesson.references.map((url,i)=>`<a href="${h(url)}" target="_blank" rel="noopener noreferrer">Primary documentation ${i+1} ↗</a>`).join('')}<a href="#/reference/${encodeURIComponent(lesson.source)}">Search the pinned Uno corpus →</a></section></div><aside class="dw-outline"><span class="eyebrow">CHAPTER OUTLINE</span>${lesson.steps.map((s,i)=>`<button data-jump="${i}"><span>0${i+1}</span> ${h(s.title)}</button>`).join('')}<a href="${link(id,'explore')}">Explore this lesson’s model →</a></aside></div>`;
  const comparison=controlledComparison(lesson.visual);let alternate=false;
  function renderComparison(){
    const current=alternate?comparison.changed:comparison.baseline;
    const result=drawScene(lesson.visual,current);
    q('.dw-inline-model svg',root).innerHTML=result.svg;
    q('.dw-inline-model figcaption',root).textContent=(alternate?'Variation. ':'Baseline. ')+comparison.caption+' '+result.metrics.map(([label,value])=>label+': '+value).join(' · ');
    q('#dw-compare',root).textContent=alternate?'Return to the baseline':'Show the controlled variation';
  }
  q('#dw-compare',root).onclick=()=>{alternate=!alternate;renderComparison();};renderComparison();
  qa('[data-jump]',root).forEach(button=>button.onclick=()=>{const section=q('#dw-step-'+button.dataset.jump,root);section.focus({preventScroll:true});section.scrollIntoView({block:'start',behavior:'instant'});});
 } else if(tab==='explore') {
  const definition=definitions[lesson.visual];let state=structuredClone(definition.defaults),phase=0;
  body.innerHTML=`<section class="dw-model"><header><span class="eyebrow">${h(lesson.visual.toUpperCase())}</span><p>Change an input, inspect the result, then test the corresponding behavior in real Uno. This is not a runtime trace or benchmark.</p></header><div class="dw-model-grid"><div><div class="dw-scroll"><svg viewBox="0 0 800 400" role="img" aria-label="${h(lesson.title)} interactive teaching diagram"></svg></div><div class="dw-metrics" aria-label="Calculated model results"></div><p class="dw-result" role="status"></p></div><aside class="dw-controls">${controls(definition,state)}${lesson.visual==='history-branch'?'<label>Next title<input id="dw-next-title" value="A" maxlength="60" aria-label="Next history title"></label><button data-history="commit">Commit title</button><button data-history="undo">Undo</button><button data-history="redo">Redo</button><button data-history="branch">Reproduce A → B → C → Undo → D</button>':''}<button class="secondary" id="dw-reset">Reset inputs</button></aside></div><div class="dw-phase-nav"><button class="secondary" id="dw-previous">Previous step</button><span id="dw-phase-count"></span><button class="primary" id="dw-next">Next step</button></div><section class="dw-phase-reading"><h2></h2><p class="dw-phase-explanation"></p><p class="dw-phase-example"></p><details><summary></summary><p></p></details></section><details><summary>View exact calculated model data</summary><pre><code id="dw-model-json" data-language="json"></code></pre></details></section>`;
  const render=()=>{
   if(disposed)return;
   const result=drawScene(lesson.visual,state,phase);
   q('.dw-scroll svg',root).innerHTML=result.svg;
   q('.dw-metrics',root).innerHTML=result.metrics.map(([name,value])=>`<div><span>${h(name)}</span><output>${h(value)}</output></div>`).join('');
   q('.dw-result',root).textContent=result.explain;
   q('#dw-model-json',root).textContent=JSON.stringify(result.model,null,2);
   q('#dw-phase-count',root).textContent=`Step ${phase+1} of 4`;
   q('#dw-previous',root).disabled=phase===0;q('#dw-next',root).disabled=phase===3;
   const part=lesson.steps[phase],reading=q('.dw-phase-reading',root);
   q('h2',reading).textContent=part.title;q('.dw-phase-explanation',reading).textContent=part.explanation;q('.dw-phase-example',reading).textContent=part.worked;
   q('summary',reading).textContent=part.prompt;q('details p',reading).textContent=part.answer;q('details',reading).open=false;
   qa('[data-readout]',root).forEach(o=>o.textContent=state[o.dataset.readout]);
   if(lesson.visual==='history-branch'){q('[data-history="undo"]',root).disabled=!state.past.length;q('[data-history="redo"]',root).disabled=!state.future.length;}
  };
  qa('[data-input]',root).forEach(input=>input.addEventListener(input.type==='checkbox'||input.tagName==='SELECT'?'change':'input',()=>{state={...state,[input.dataset.input]:input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value};render();}));
  q('#dw-previous',root).onclick=()=>{phase=Math.max(0,phase-1);render();};q('#dw-next',root).onclick=()=>{phase=Math.min(3,phase+1);render();};
  qa('[data-history]',root).forEach(b=>b.onclick=()=>{if(b.dataset.history==='branch'){state=initialHistory(3);for(const title of ['A','B','C'])state=historyTransition(state,'commit',title);state=historyTransition(state,'undo');state=historyTransition(state,'commit','D');}else state=historyTransition(state,b.dataset.history,q('#dw-next-title',root).value);render();});
  q('#dw-reset',root).onclick=()=>{state=structuredClone(definition.defaults);phase=0;qa('[data-input]',root).forEach(input=>{if(input.type==='checkbox')input.checked=state[input.dataset.input];else input.value=state[input.dataset.input];});render();};
  render();
 } else if(tab==='playground') {
  const localState=storageState();
  const save=()=>{try{localStorage.setItem(key,JSON.stringify({version:1,drafts:localState.drafts}));}catch{q('.dw-footer',root).dataset.storage='unavailable';}};
  disposeLab=mountWorkspace(body,lesson,localState,save);
 } else {
  body.innerHTML=`<section class="dw-quiz"><span class="eyebrow">RECALL THE CONTRACT</span><h2>${h(lesson.quiz.question)}</h2><form><fieldset><legend>Choose one answer</legend>${lesson.quiz.options.map((option,i)=>`<label><input type="radio" name="answer" value="${i}" required>${h(option)}</label>`).join('')}</fieldset><button class="primary">Check my reasoning</button></form><div class="dw-feedback" aria-live="polite"></div><section class="dw-transfer"><h2>Apply it to your own app</h2><p>${h(lesson.transfer)}</p><a href="${link(id,'playground')}">Return to the real Uno exercise →</a></section></section>`;
  q('form',root).onsubmit=e=>{e.preventDefault();const answer=Number(new FormData(e.target).get('answer'));q('.dw-feedback',root).innerHTML=`<strong>${answer===lesson.quiz.answer?'That reasoning matches the contract.':'Revisit the distinction.'}</strong><p>${h(lesson.quiz.explanation)}</p>`;};
 }
 return()=>{if(disposed)return;disposed=true;disposeLab();};
}
