import {$,$$,escapeHtml as h,icon,toast,download} from '../helpers.mjs';
import {labs,labMap,normalizeSettings,labForLesson} from './catalog.mjs';
import {scene,cover} from './scenes.mjs';
import {bindingTransition,rebind,stateTransition,damageTiles,clamp} from './models.mjs';
import {DamageGpu} from './gpu.mjs';

export function visualCard(lab){return `<a class="atlas-card lab-${lab.color}" href="#/atlas/${lab.id}"><div class="atlas-cover">${cover(lab.id)}<span class="cover-label">LAB ${String(lab.index+1).padStart(2,'0')}</span><span class="cover-arrow">${icon('arrow',18)}</span></div><div class="atlas-card-body"><span class="eyebrow">${lab.id==='damage'?'WEBGPU + GEOMETRY':h(lab.category)+' / INTERACTIVE MODEL'}</span><h3>${h(lab.title)}</h3><p>${h(lab.summary)}</p><span class="atlas-card-footer">Change · inspect · understand ${icon('arrow',15)}</span></div></a>`;}
export function mountAtlas(root,motion=true){
 root.innerHTML=`<div class="atlas-page-heading"><div><span class="eyebrow">THE VISUAL ATLAS / 11 EXPLORABLE SYSTEMS</span><h1>Get your hands<br>on <em>the idea.</em></h1><p>Don't memorize the diagram. Change the inputs, break an assumption, and see what follows.</p></div><div class="atlas-heading-note"><span>01 → 11</span><p>From the space inside a button<br>to the work inside a frame.</p></div></div><div class="atlas-filter-row"><div class="filter-bar" aria-label="Filter visual labs">${['All labs','Structure','State','Performance','Motion'].map((c,i)=>`<button class="filter-chip ${i===0?'active':''}" data-category="${c}">${c}</button>`).join('')}</div><label class="atlas-search">${icon('search',16)}<input aria-label="Search visual labs" placeholder="Find a concept…" /></label></div><div class="atlas-grid" id="atlas-results"></div><div class="atlas-footnote">Every scene is an explicit teaching model. Follow “Test in real Uno” to compare it with the actual framework.</div>`;
 let category='All labs',query='';
 const render=()=>{const matching=labs.filter(l=>(category==='All labs'||l.category===category)&&(l.title+' '+l.short+' '+l.summary).toLowerCase().includes(query));$('#atlas-results',root).innerHTML=matching.map(visualCard).join('')||'<div class="empty-state"><h2>No matching experiments.</h2><p>Try “layout”, “state”, or clear the category filter.</p></div>';};
 $$('[data-category]',root).forEach(b=>b.onclick=()=>{category=b.dataset.category;$$('[data-category]',root).forEach(x=>x.classList.toggle('active',x===b));render();});
 $('input',root).oninput=e=>{query=e.target.value.toLowerCase().trim();render();};render();return()=>{};
}
function control(c,s){
 const value=s[c.key],id='visual-'+c.key;
 if(c.type==='toggle')return `<label class="v-toggle" for="${id}"><input id="${id}" data-control="${c.key}" type="checkbox" ${value?'checked':''} /><span>${h(c.label)}</span></label>`;
 if(c.type==='select')return `<label class="v-control" for="${id}"><span>${h(c.label)}</span><select id="${id}" data-control="${c.key}">${c.options.map(v=>`<option ${String(value)===v?'selected':''}>${h(v)}</option>`).join('')}</select></label>`;
 if(c.type==='text')return `<label class="v-control" for="${id}"><span>${h(c.label)}</span><input id="${id}" data-control="${c.key}" type="text" maxlength="80" value="${h(value)}" autocomplete="off" spellcheck="false" /></label>`;
 return `<label class="v-control v-range" for="${id}"><span>${h(c.label)}<output data-value="${c.key}" for="${id}">${h(value)} ${c.unit}</output></span><input id="${id}" data-control="${c.key}" aria-label="${h(c.label)}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${value}" /></label>`;
}
const initialState=lab=>({...lab.defaults,revision:0,trace:[],status:'idle',sequence:0});
export function mountLab(root,id,{motion=true,lesson=null,query=''}={}){
 const lab=labMap.get(id)||labs[0];let s=initialState(lab),step=0,playing=false,dead=false,raf=0,lastPaint=0,clock=0,previousNow=null,visible=true,gpu=null;
 try{const p=new URLSearchParams(query);const encoded=p.get('s');if(encoded&&encoded.length<=4096)s={...s,...normalizeSettings(lab,JSON.parse(encoded))};}catch{toast('That shared state was invalid. The default experiment is open.');}
 if(lab.id==='binding')s=rebind(s);
 const heading=lesson?'h2':'h1';
 root.innerHTML=`<section class="visual-lab lab-${lab.color}" data-lab="${lab.id}"><div class="atlas-breadcrumb"><a href="#/atlas">← Visual atlas</a><div><span>LAB ${String(lab.index+1).padStart(2,'0')} / 11</span><a href="#/lesson/${lesson?.id||lab.lesson}/learn">Read the connected lesson ↗</a></div></div><div class="visual-title"><div><span class="eyebrow">VISUAL LAB / ${h(lab.category.toUpperCase())}</span><${heading}>${h(lab.title)}</${heading}><p>${h(lab.summary)}</p></div><span class="backend-badge" id="visual-backend">${lab.id==='damage'?'Preparing GPU comparison…':'SVG + HTML · interactive model'}</span></div><div class="v-workbench"><div class="v-toolbar"><nav aria-label="Explanation stages" class="v-stages">${lab.steps.map(([title],i)=>`<button data-step="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><span>0${i+1}</span> ${h(title)}</button>`).join('')}</nav><div class="v-playback"><button id="visual-play" class="icon-button" title="Play explanatory sequence" aria-label="Play explanatory sequence">${icon('play',17)}</button><button id="visual-step" class="icon-button" aria-label="Next stage" title="Next stage">${icon('arrow',17)}</button><button id="visual-reset" class="icon-button" aria-label="Reset experiment" title="Reset experiment">${icon('refresh',17)}</button><button id="visual-expand" class="icon-button" aria-label="Expand experiment" title="Expand experiment">${icon('monitor',17)}</button></div></div><div class="v-work-area"><div class="v-main"><div class="v-scene-heading"><span><i></i>${h(lab.short.toUpperCase())}</span><span>Inspect the geometry · model, not a runtime trace</span></div><div class="v-canvas-scroll"><div class="v-scene" tabindex="0" aria-label="Interactive ${h(lab.short)} diagram. Equivalent values follow below."><svg viewBox="0 0 800 400" role="img" aria-label="${h(lab.title)}"></svg></div></div><div class="v-actions" id="visual-actions">${lab.id==='binding'?'<button class="secondary small" data-action="rebind">Rebind · read source again</button>':lab.id==='state'?[['load','Start load'],['success','Complete'],['fail','Fail'],['cancel','Cancel'],['retry','Retry']].map(([key,title])=>`<button class="secondary small" data-action="${key}">${title}</button>`).join(''):''}<span class="v-interaction-note">${lab.id==='layout'?'↔ Drag the right edge, or use the width slider.':lab.id==='damage'?'↔ Drag the current rectangle, or use X/Y sliders.':lab.id==='tree'?'Select a tree row to inspect its matching visual.':'Use the controls to test a different assumption.'}</span></div><div id="visual-ledger"></div><div class="v-metrics" id="visual-metrics" aria-label="Calculated results"></div></div><aside class="v-inspector"><div class="v-inspector-title">${icon('settings',15)} Experiment controls</div><div class="v-inspector-body">${lab.controls.map(c=>control(c,s)).join('')}<div class="v-presets"><span class="eyebrow">TRY A SCENARIO</span>${lab.presets.map(([label],i)=>`<button class="v-preset" data-preset="${i}">${h(label)} ${icon('arrow',13)}</button>`).join('')}</div><div class="v-readout"><strong>Read the result.</strong><p id="visual-readout"></p></div></div></aside></div></div><div id="visual-gpu"></div><div class="v-evidence"><section class="v-code"><div class="v-panel-title">${icon('code',15)} CONNECT THE MODEL TO CODE <button class="text-button" id="visual-copy-code">Copy</button></div><pre><code id="visual-code"></code></pre></section><section class="v-trace"><div class="v-panel-title">${icon('layers',15)} ${lab.id==='binding'||lab.id==='state'?'EVENT TRACE':'OBSERVATION LOG'}</div><ol id="visual-trace"></ol></section></div><div class="stage-explanation"><span id="stage-number">01 / 04</span><div><h3 id="stage-title"></h3><p id="stage-description"></p></div><input id="visual-speed" type="range" min="0.5" max="2" step="0.5" value="1" aria-label="Playback speed" title="Playback speed" /></div><div class="visual-transfer"><div><span class="eyebrow">CHANGE ONE ASSUMPTION</span><h2>Now make a prediction.</h2><p>${h(lab.challenge)}</p></div><a class="secondary" href="#/lesson/${lesson?.id||lab.lesson}/playground">Test in real Uno ${icon('arrow',17)}</a></div><details class="visual-scope"><summary>What this model shows—and what it does not</summary><p>${h(lab.scope)}</p><a href="#/lesson/${lab.lesson}/learn">Read the explanation and source references →</a></details><div class="visual-bottom"><div><button class="text-button" id="visual-share">${icon('code',15)} Copy experiment link</button><button class="text-button" id="visual-download">${icon('download',15)} Save inputs</button></div><span>Links include the inputs you enter. They never execute code.</span></div><div class="related-labs"><span class="eyebrow">KEEP EXPLORING</span>${labs.filter(l=>l.id!==lab.id&&(l.category===lab.category)).slice(0,3).map(l=>`<a href="#/atlas/${l.id}">${h(l.short)} ${icon('arrow',15)}</a>`).join('')}</div></section>`;
 const element=$('.visual-lab',root),surface=$('.v-scene',root);let observation=[];
 const mq=matchMedia('(prefers-reduced-motion: reduce)');
 let speed=1;
 function render(reason='Initial model'){
  if(dead)return;
  const focused=document.activeElement?.closest?.('[data-node],[data-drag]');const focusNode=focused?.dataset.node;const focusDrag=focused?.dataset.drag;
  const result=scene(lab,s,step);$('svg',surface).innerHTML=result.svg;
  if(focusNode)$(`[data-node="${focusNode}"]`,surface)?.focus({preventScroll:true});else if(focusDrag)$(`[data-drag="${focusDrag}"]`,surface)?.focus({preventScroll:true});
  $('#visual-metrics',root).innerHTML=result.metrics.map(m=>`<div><span>${h(m.label)}</span><output>${h(m.value)} <small>${h(m.unit)}</small></output></div>`).join('');
  $('#visual-ledger',root).innerHTML=result.segments.length?`<div class="v-ledger">${result.segments.map(m=>`<div><i class="ledger-tone-${m.tone}"></i><strong>${h(m.label)}</strong><span>${h(m.value)}</span></div>`).join('')}</div>`:'';
  $('#visual-code',root).textContent=result.code;$('#visual-readout',root).textContent=result.readout;
  if(reason!=='Playback')observation=[...observation.slice(-3),[reason,result.metrics.map(m=>`${m.label}: ${m.value}${m.unit?' '+m.unit:''}`).join(' · ')]];
  const traces=result.trace?.length?result.trace:observation;
  $('#visual-trace',root).innerHTML=traces.slice(-4).map(([title,body],i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><strong>${h(title)}</strong><p>${h(body)}</p></div></li>`).join('');
  $$('[data-step]',root).forEach(b=>{const active=+b.dataset.step===step;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  $('#stage-number',root).textContent=`0${step+1} / 04`;$('#stage-title',root).textContent=lab.steps[step][0];$('#stage-description',root).textContent=lab.steps[step][1];element.dataset.step=step;
  for(const c of lab.controls){const input=$(`[data-control="${c.key}"]`,root);if(c.type==='toggle')input.checked=s[c.key];else if(document.activeElement!==input)input.value=s[c.key];const out=$(`[data-value="${c.key}"]`,root);if(out)out.textContent=s[c.key]+' '+c.unit;}
  if(lab.id==='state')$$('[data-action]',root).forEach(b=>b.disabled=stateTransition(s,b.dataset.action)===s);
  if(lab.id==='virtualization'){const max=Math.max(0,s.count*s.rowHeight-s.viewport);const control=$('[data-control="offset"]',root);control.max=max;if(s.offset>max){s.offset=max;control.value=max;}}
  if(lab.id==='damage')gpu?.update(damageTiles({...s,tile:+s.tile}));
 }
 function update(key,value){
  if(lab.id==='binding'&&(key==='source'||key==='target'))s=bindingTransition(s,key,value);
  else if(lab.id==='binding'&&key==='mode')s=rebind({...s,mode:value});
  else s={...s,[key]:value};
  if(lab.id==='virtualization')s.offset=clamp(s.offset,0,Math.max(0,s.count*s.rowHeight-s.viewport));
  render('Changed '+(lab.controls.find(c=>c.key===key)?.label||key));
 }
 $$('[data-control]',root).forEach(input=>input.addEventListener(input.tagName==='SELECT'||input.type==='checkbox'?'change':'input',()=>{const c=lab.controls.find(c=>c.key===input.dataset.control);update(c.key,c.type==='toggle'?input.checked:c.type==='range'?Number(input.value):input.value);}));
 $$('[data-preset]',root).forEach(b=>b.onclick=()=>{const [label,patch]=lab.presets[+b.dataset.preset];s={...s,...patch};if(lab.id==='binding')s=rebind(s);if(lab.id==='state')s={...s,sequence:0,trace:[]};render('Scenario: '+label);});
 $$('[data-action]',root).forEach(b=>b.onclick=()=>{s=b.dataset.action==='rebind'?rebind(s):stateTransition(s,b.dataset.action);render('Action: '+b.textContent);});
 function setStep(n){step=n%4;render('Stage: '+lab.steps[step][0]);}
 $$('[data-step]',root).forEach(b=>b.onclick=()=>setStep(+b.dataset.step));$('#visual-step',root).onclick=()=>setStep(step+1);
 const stop=()=>{playing=false;cancelAnimationFrame(raf);$('#visual-play',root)?.setAttribute('aria-label','Play explanatory sequence');$('#visual-play',root)?.classList.remove('playing');};
 function animate(now){
  if(dead||!playing||!visible||document.hidden)return;
  const delta=previousNow===null?0:Math.min(now-previousNow,100);previousNow=now;clock+=delta*speed;
  if(now-lastPaint>50){
   if(lab.id==='easing'){s.t=Math.round((clock%4000)/40);render('Playback');}
   else if(lab.id==='race'){s.time=Math.round((clock%5600)/2);render('Playback');}
   else {const next=Math.floor(clock/2600)%4;if(next!==step)setStep(next);}
   lastPaint=now;
  }
  raf=requestAnimationFrame(animate);
 }
 $('#visual-play',root).onclick=()=>{if(playing){stop();return;}if(mq.matches||document.documentElement.dataset.motion==='off'||!motion){toast('Motion is disabled. Use Next stage or the sliders.');return;}playing=true;previousNow=null;clock=lab.id==='easing'?s.t*40:lab.id==='race'?s.time*2:step*2600;$('#visual-play',root).setAttribute('aria-label','Pause explanatory sequence');$('#visual-play',root).classList.add('playing');raf=requestAnimationFrame(animate);};
 $('#visual-speed',root).oninput=e=>speed=Number(e.target.value);
 $('#visual-reset',root).onclick=()=>{stop();s=initialState(lab);if(lab.id==='binding')s=rebind(s);step=0;observation=[];render('Experiment reset');};
 $('#visual-expand',root).onclick=()=>{const expanded=element.classList.toggle('expanded');document.body.classList.toggle('visual-is-expanded',expanded);$('#visual-expand',root).setAttribute('aria-label',expanded?'Close expanded experiment':'Expand experiment');};
 const escape=e=>{if(e.key==='Escape'){element.classList.remove('expanded');document.body.classList.remove('visual-is-expanded');}};window.addEventListener('keydown',escape);
 const visibility=()=>{cancelAnimationFrame(raf);if(playing&&!document.hidden&&visible){previousNow=null;raf=requestAnimationFrame(animate);}};document.addEventListener('visibilitychange',visibility);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visibility();});intersection.observe(element);
 const preference=()=>{if(mq.matches||document.documentElement.dataset.motion==='off')stop();};mq.addEventListener('change',preference);const preferences=new MutationObserver(preference);preferences.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 let drag=null;
 function point(e){const r=$('svg',surface).getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*800,y:(e.clientY-r.top)/r.height*400};}
 surface.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-drag]');if(!target||e.button!==0)return;const p=point(e);drag={type:target.dataset.drag,x:p.x-80-s.x,y:p.y-46-s.y,pointer:e.pointerId};surface.setPointerCapture(e.pointerId);e.preventDefault();});
 surface.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const p=point(e);if(drag.type==='width')s.width=Math.round(clamp((p.x-42)/.54,320,1280));else {s.x=Math.round(clamp(p.x-80-drag.x,0,500));s.y=Math.round(clamp(p.y-46-drag.y,0,240));}render('Direct manipulation');});
 const endDrag=()=>{drag=null;};surface.addEventListener('pointerup',endDrag);surface.addEventListener('pointercancel',endDrag);surface.addEventListener('lostpointercapture',endDrag);
 const pick=e=>{const node=e.target.closest('[data-node]');if(node)update('selected',node.dataset.node);};surface.addEventListener('click',pick);
 surface.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){if(e.target.closest('[data-node]')){e.preventDefault();pick(e);}}if(e.target.closest('[data-drag="width"]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();update('width',clamp(s.width+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?20:4),320,1280));}});
 async function copy(value){try{await navigator.clipboard.writeText(value);toast('Copied to clipboard.');}catch{download('LearnUno-experiment.txt',value,'text/plain');toast('Clipboard unavailable; downloaded a text copy.');}}
 $('#visual-copy-code',root).onclick=()=>copy(scene(lab,s,step).code);
 $('#visual-share',root).onclick=()=>{const url=new URL(location.href);url.hash='/atlas/'+lab.id+'?'+new URLSearchParams({s:JSON.stringify(normalizeSettings(lab,s))});copy(url.href);};
 $('#visual-download',root).onclick=()=>download('LearnUno-'+lab.id+'-inputs.json',JSON.stringify({version:1,lab:lab.id,settings:normalizeSettings(lab,s),scope:lab.scope},null,2));
 if(lab.id==='damage'){
  $('#visual-gpu',root).innerHTML=`<section class="gpu-comparison"><div><span class="eyebrow">ACTUAL GPU OUTPUT</span><h3>The same tiles. Independently computed.</h3><p>The main diagram is the inspectable CPU reference. This canvas renders GPU-computed flags, then reads them back to check every tile.</p><output id="gpu-result" role="status">Starting an adapter…</output></div><canvas width="640" height="320" aria-label="WebGPU-computed dirty tiles; equivalent classification is in the main diagram and result text"></canvas></section>`;
  gpu=new DamageGpu($('canvas',root),(kind,message,evidence)=>{if(dead)return;$('#visual-backend',root).textContent=kind==='verified'?'WebGPU · compute + render':message;$('#gpu-result',root).textContent=message;element.dataset.gpu=kind;if(evidence){element.dataset.gpuEvidence=JSON.stringify(evidence);}if(kind==='fallback')$('.gpu-comparison canvas',root).hidden=true;});gpu.initialize();
 }
 render();
 return()=>{dead=true;stop();gpu?.dispose();intersection.disconnect();preferences.disconnect();mq.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('keydown',escape);document.body.classList.remove('visual-is-expanded');};
}
export function mountLessonVisual(root,lesson,motion){return mountLab(root,labForLesson(lesson),{lesson,motion});}
