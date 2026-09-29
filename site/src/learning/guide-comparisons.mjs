import {escapeHtml as h} from '../helpers.mjs';
const box=(x,y,w,he,kind='')=>`<rect x="${x}" y="${y}" width="${w}" height="${he}" rx="6" class="${kind}"/>`;
const label=(x,y,text)=>`<text x="${x}" y="${y}">${h(text)}</text>`;
const edge=(x,y,a,b)=>`<path d="M ${x} ${y} L ${a} ${b}" class="gc-edge"/>`;
/** Six distinct structural illustrations; the table is the accessible equivalent. */
export function comparisonGeometry(id,alternate=false){
 const on='gc-active',off='gc-muted';
 let geometry='';
 switch(id){
  case 'notification-boundaries':
   geometry=box(25,28,172,65,alternate?on:off)+label(40,55,'Items owner')+label(40,77,alternate?'Items replaced':'Same collection')+box(235,28,172,65,off)+label(250,55,'Collection')+label(250,77,'Membership')+box(425,118,172,65,alternate?off:on)+label(440,145,'Task 42')+label(440,167,'Title changed')+edge(197,61,235,61)+edge(320,93,425,150);
   break;
  case 'focus-is-state':
   geometry=box(30,24,248,159,off)+label(46,48,'Project form')+box(46,64,215,36,alternate?off:on)+label(56,88,'Title: x')+box(46,119,93,35,off)+label(56,142,'Save')+box(337,24,265,159,off)+label(353,48,'Notes editor')+box(353,64,230,90,alternate?on:off)+label(366,95,'Current keyboard target');
   break;
  case 'culture-at-the-boundary':
   geometry=box(25,63,163,90,on)+label(40,96,alternate?'Stored 12.345m':'Typed 12.50m')+label(40,123,'Canonical value')+edge(188,108,247,108)+box(247,63,163,90,off)+label(261,96,alternate?'Format to N2':'Culture: pl-PL')+label(261,123,'Presentation rule')+edge(410,108,461,108)+box(461,63,151,90,alternate?'gc-warning':on)+label(475,96,alternate?'Digit discarded':'Accepted input')+label(475,123,alternate?'Not reversible':'Store typed data');
   break;
  case 'command-observation':
   geometry=box(25,30,230,67,on)+label(40,59,'Current predicate: true')+label(40,81,'Title is now valid')+box(25,125,230,53,alternate?on:'gc-warning')+label(40,158,alternate?'NotifyCanExecuteChanged':'Notification missing')+edge(255,152,374,152)+box(374,70,230,95,alternate?on:off)+label(393,106,'Save button')+label(393,137,alternate?'Availability reevaluated':'Old disabled observation');
   break;
  case 'resource-template-boundaries':
   geometry=box(25,25,265,160,off)+label(43,53,alternate?'ControlTemplate':'Shared style')+`<text x="43" y="103" style="font-size:28px">${alternate?'Button':'28 pt'}</text>`+label(43,152,alternate?'Focus cue required':'No local override')+box(337,25,265,160,on)+label(355,53,alternate?'Keyboard state':'Local override')+`<text x="355" y="107" style="font-size:32px">${alternate?'Focused':'32 pt'}</text>`+label(355,152,alternate?'Still part of the contract':'Local value wins');
   break;
  case 'async-initialization':
   geometry=label(25,51,alternate?'Attempt 1':'Request A')+box(125,26,441,38,off)+label(140,51,alternate?'Failed task completed':'Old request finishes last')+label(25,127,alternate?'Retry':'Request B')+box(215,101,alternate?351:177,38,on)+label(230,127,alternate?'New attempt':'Accepted result')+edge(alternate?565:392,139,alternate?565:392,176)+label(234,199,alternate?'Do not reuse the failed Task':'Accept by ownership, not finish order');
   break;
 }
 return `<svg viewBox="0 0 640 216" aria-hidden="true" focusable="false">${geometry}</svg>`;
}
export function renderGuideComparison(guide,index=0){
 const current=guide.cases[index];
 if(!current)throw new RangeError('Unknown guide comparison scenario.');
 return `<div class="gc-figure">${comparisonGeometry(guide.id,index===1)}</div><p class="gc-context">${h(current.context)}</p><table><caption>${h(current.label)} — inspect the contract</caption><thead><tr><th scope="col">Boundary</th><th scope="col">Observation or decision</th></tr></thead><tbody>${current.rows.map(([a,b])=>`<tr><th scope="row">${h(a)}</th><td>${h(b)}</td></tr>`).join('')}</tbody></table>`;
}
export function mountGuideComparison(root,guide){
 root.className='guide-comparison';
 root.innerHTML=`<span class="eyebrow">WORK THROUGH TWO SITUATIONS</span><h2>Predict which boundary changes.</h2><p>Choose a scenario, then explain the result before consulting the table. These are authored reasoning examples, not a trace from the Uno runtime.</p><div class="gc-choices" role="group" aria-label="Comparison scenarios">${guide.cases.map((item,i)=>`<button type="button" data-guide-case="${i}" aria-pressed="${i===0}">${h(item.label)}</button>`).join('')}</div><div class="gc-result"></div>`;
 const result=root.querySelector('.gc-result');
 const listener=event=>{const button=event.target.closest('[data-guide-case]');if(!button||!root.contains(button))return;const index=Number(button.dataset.guideCase);result.innerHTML=renderGuideComparison(guide,index);root.querySelectorAll('[data-guide-case]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));};
 root.addEventListener('click',listener);result.innerHTML=renderGuideComparison(guide);
 return()=>root.removeEventListener('click',listener);
}
