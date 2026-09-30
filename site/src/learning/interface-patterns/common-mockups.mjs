import {escapeHtml as h} from '../../helpers.mjs';
import {captionBinding,collectionView,quantityDraft} from './common-models.mjs';
const field=(label,value,id)=>`<label for="${id}">${h(label)}</label><input id="${id}" value="${h(value)}" maxlength="80">`;
const readout=(label,id,value)=>`<div><small>${h(label)}</small><output id="${id}">${h(value)}</output></div>`;
export function commonMockup(lesson) {
 switch(lesson.id){
 case 'usercontrol-contracts':return `<div class="ip-mock-content cc-composition"><header><small>COMPONENT CONTRACT / TWO INSTANCES</small><h3>The host supplies data. The card owns presentation.</h3></header>${field('Host Title','Research queue','cc-host')}<label class="cc-toggle"><input id="cc-break" type="checkbox"> Deliberately replace the control DataContext</label><div class="cc-context-strip"><strong>External Caption binding</strong><output id="cc-context">DashboardState</output><span>↓ Title resolves here</span></div><div class="cc-pair"><section class="ip-content-card"><small>INSTANCE A · BOUND</small><h4 id="cc-caption">Research queue</h4><p>Inner TextBlock uses explicit Source = this, Path = Caption.</p></section><section class="ip-content-card"><small>INSTANCE B · INDEPENDENT</small><h4>Archive</h4><p>No shared mutable instance state.</p></section></div><output class="ip-inline-status" id="cc-binding-status" role="status">Both contracts remain intact.</output></div>`;
 case 'richtext-reading':return `<div class="ip-mock-content cc-rich"><header><small>STRUCTURE / READING FLOW</small><h3>One paragraph, several inline roles.</h3></header><label class="cc-toggle"><input id="cc-vague" type="checkbox"> Compare an ambiguous link label</label><div class="cc-rich-split"><aside aria-label="Text object structure"><ol><li>RichTextBlock<ol><li>Paragraph<ol><li>Run · normal text</li><li>Run · emphasis</li><li>Hyperlink · purpose</li><li>Run · continuation</li></ol></li></ol></li></ol></aside><article class="ip-content-card"><h4>Release review</h4><p>Keep <strong>the whole instruction readable.</strong> <a href="#cc-help" id="cc-help-link">Read keyboard guidance</a> before publishing. This sentence remains one wrapping flow at every preview width.</p><p>A second paragraph expresses another thought rather than a guessed number of line breaks.</p></article></div><output id="cc-help" class="ip-inline-status" role="status">Help topic: none</output><p class="cc-model-note">Link activation opens local help only. Inspect accessible purpose and actual Uno behavior separately.</p></div>`;
 case 'gridview-identity':return `<div class="ip-mock-content cc-grid"><header><small>COLLECTION / KEYS NOT POSITIONS</small><h3>Selection and opening are different actions.</h3></header><div class="cc-tools"><button type="button" id="cc-reverse">Reverse card order</button><label class="cc-toggle"><input id="cc-hide" type="checkbox"> Hide Research notes</label></div><div id="cc-cards" class="cc-card-grid"></div><div class="cc-results">${readout('Selected key','cc-selected','doc-2')}${readout('Opened key','cc-opened','none')}</div><p class="cc-model-note">This specimen uses explicit HTML Select/Open actions, not an imitation of GridView input routing.</p></div>`;
 case 'numberbox-boundaries':return `<div class="ip-mock-content cc-number"><header><small>EDIT / VALIDATE / COMMIT</small><h3>A missing value is a real state.</h3></header>${field('Quantity draft · whole items, 1–100','3','cc-number')}<div class="cc-tools"><button type="button" data-quantity="">Clear input</button><button type="button" data-quantity="2.5">Try fraction (2.5)</button><button type="button" data-quantity="3">Restore valid draft</button></div><div class="cc-number-flow">${readout('1 / draft state','cc-kind','valid')}${readout('2 / interpreted value','cc-value','3')}${readout('3 / accepted quantity','cc-accepted','3')}</div><p id="cc-number-help">The draft satisfies the quantity contract.</p><button class="ip-primary" id="cc-apply" type="button">Apply quantity</button><output class="ip-inline-status" id="cc-number-result" role="status">Nothing new has been applied.</output><p class="cc-model-note">This HTML model accepts an explicit decimal subset. The actual NumberBox has its own localized editing and validation behavior.</p></div>`;
 default:return null;
 }
}
export function attachCommonMockup(lesson,device) {
 const controller=new AbortController(),options={signal:controller.signal};
 const on=(selector,event,action)=>device.querySelector(selector)?.addEventListener(event,action,options);
 const set=(id,value)=>{device.querySelector('#'+id).textContent=value;};
 if(lesson.id==='usercontrol-contracts'){
  const update=()=>{const r=captionBinding(device.querySelector('#cc-host').value,device.querySelector('#cc-break').checked);set('cc-context',r.externalContext);set('cc-caption',r.caption||'(Title could not be resolved)');set('cc-binding-status',r.bound?'The bound card follows the host; Archive stays independent.':'Broken external lookup. The private Source binding does not repair the caller’s source.');};
  on('#cc-host','input',update);on('#cc-break','change',update);update();
 }else if(lesson.id==='richtext-reading'){
  on('#cc-vague','change',e=>set('cc-help-link',e.target.checked?'Here':'Read keyboard guidance'));
  on('#cc-help-link','click',e=>{e.preventDefault();set('cc-help','Help topic: keyboard navigation and visible focus');});
 }else if(lesson.id==='gridview-identity'){
  let reversed=false,selected='doc-2',opened=null;
  const render=()=>{const view=collectionView(reversed,device.querySelector('#cc-hide').checked?'doc-2':null,selected);selected=view.selectedKey;const focused=device.ownerDocument.activeElement;const key=focused?.dataset.selectKey||focused?.dataset.openKey,action=focused?.dataset.selectKey?'select-key':'open-key';device.querySelector('#cc-cards').innerHTML=view.items.map((c,i)=>`<article class="cc-report" data-selected="${selected===c.id}"><small>POSITION ${i+1} · ${c.id}</small><h4>${h(c.title)}</h4><div><button type="button" data-select-key="${c.id}" aria-pressed="${selected===c.id}" aria-label="Select ${h(c.title)}">Select</button><button type="button" data-open-key="${c.id}" aria-label="Open ${h(c.title)}">Open</button></div></article>`).join('');set('cc-selected',selected||'none');set('cc-opened',opened||'none');if(key)device.querySelector(`[data-${action}="${key}"]`)?.focus({preventScroll:true});};
  device.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.selectKey){selected=b.dataset.selectKey;render();}else if(b?.dataset.openKey){opened=b.dataset.openKey;render();}},options);
  on('#cc-reverse','click',()=>{reversed=!reversed;render();});on('#cc-hide','change',render);render();
 }else if(lesson.id==='numberbox-boundaries'){
  let accepted=3;
  const input=device.querySelector('#cc-number');input.setAttribute('inputmode','decimal');input.setAttribute('aria-describedby','cc-number-help');
  const show=()=>{const r=quantityDraft(input.value);set('cc-kind',r.kind);set('cc-value',r.value===null?'no value':String(r.value));set('cc-number-help',r.reason);return r;};
  on('#cc-number','input',show);
  device.addEventListener('click',e=>{const b=e.target.closest('[data-quantity]');if(b){input.value=b.dataset.quantity;show();input.focus();}},options);
  on('#cc-apply','click',()=>{const r=show();input.setAttribute('aria-invalid',String(!r.accepted));if(r.accepted){accepted=r.value;set('cc-accepted',String(accepted));set('cc-number-result','Quantity applied');}else{set('cc-number-result','Not applied: '+r.reason+' Accepted quantity remains '+accepted+'.');input.focus();}});show();
 }
 return()=>controller.abort();
}
/** Source excerpts are lazily loaded and escaped; no sample markup is evaluated. */
export function mountControlEvidence(root,id) {
 const controller=new AbortController();
 const host=document.createElement('section');host.className='cc-evidence';host.setAttribute('aria-label','Reviewed Uno sample excerpts');root.append(host);
 host.textContent='Loading reviewed sample excerpts…';
 fetch('./control-study/index.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Sample excerpts unavailable');return r.json();}).then(index=>{
  if(controller.signal.aborted)return;
  const evidence=index.lessons[id];if(!evidence)throw new Error('No reviewed excerpt for this lesson');
  host.innerHTML=`<h3>Read the exact upstream example.</h3><p>${h(evidence.caption)}</p><a href="${h(evidence.url)}" target="_blank" rel="noopener noreferrer">${h(evidence.path)} · lines ${evidence.start}–${evidence.end} ↗</a><pre><code data-language="${h(evidence.language)}">${h(evidence.code)}</code></pre><small>Uno source revision ${h(index.revision)} · excerpt SHA-256 ${h(evidence.sha256)}</small><p>${h(evidence.boundary)}</p>`;
 }).catch(e=>{if(!controller.signal.aborted)host.textContent=e.message+'; use the pinned source links above.';});
 return()=>controller.abort();
}
