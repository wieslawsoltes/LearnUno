import {escapeHtml as h} from '../helpers.mjs';
import {lessonLabMap,lessonScene} from './lessons/index.mjs';
import {gridLayout,boxGeometry,visibleRange,effectiveValue,easing,raceState,damageTiles,round} from './models.mjs';
const text=(x,y,value,cls='',extra='')=>`<text x="${x}" y="${y}" class="${cls}" ${extra}>${h(value)}</text>`;
const rect=(x,y,w,he,cls='',extra='')=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,he)}" rx="7" class="${cls}" ${extra}/>`;
const line=(x1,y1,x2,y2,cls='edge',extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${extra}/>`;
const metric=(label,value,unit='')=>({label,value,unit});
const card=(x,y,w,he,title,caption,cls='tone-1')=>rect(x,y,w,he,cls)+text(x+16,y+29,title,'node-title')+text(x+16,y+51,caption,'muted tiny');
const pill=(x,y,w,label,cls='tone-1')=>rect(x,y,w,28,cls)+text(x+w/2,y+19,label,'tiny','text-anchor="middle"');
const arrow=(x1,y1,x2,y2,cls='edge')=>line(x1,y1,x2,y2,cls)+`<path d="M ${x2-6} ${y2-5} L ${x2} ${y2} L ${x2-6} ${y2+5}" class="${cls}" fill="none"/>`;
export const treeNodes=['Page','Grid','Border','StackPanel','TextBlock','Button'];
export function scene(lab,s,step=0) {
 if(lessonLabMap.has(lab.id))return lessonScene(lessonLabMap.get(lab.id),s,step);
 let svg='',metrics=[],code='',readout='',trace=[],segments=[];
 if(lab.id==='layout') {
  const m=gridLayout(s),scale=.54,left=42,top=92,height=156;
  svg=text(42,30,'MEASURE → ARRANGE','eyebrow-svg')+text(756,30,`${s.width} × 238 logical units`,'muted tiny','text-anchor="end"');
  for(let i=0;i<=1280;i+=160) svg+=line(left+i*scale,60,left+i*scale,67)+text(left+i*scale,51,i,'muted tiny','text-anchor="middle"');
  svg+=rect(left,top,s.width*scale,height,'surface-stroke');
  m.tracks.forEach((t,i)=>{
   const x=left+t.x*scale,w=t.width*scale;
   svg+=rect(x,top+17,w,height-34,`tone-${i+1} ${step===1&&i<2 || step>=2&&i>=2 ?'is-highlight':''}`);
   if(w>33)svg+=text(x+8,top+42,t.label,'node-title')+(w>62?text(x+8,top+65,['Reserved','DesiredSize','Flexible','Flexible'][i],'tiny muted'):'');
   svg+=line(x,top+height+15,x+w,top+height+15,'dimension');
   if(w>23)svg+=text(x+w/2,top+height+35,round(t.width),'mono','text-anchor="middle"');
  });
  const hx=left+s.width*scale;
  svg+=line(hx,top-8,hx,top+height+8,'accent-line')+`<g data-drag="width" role="slider" tabindex="0" aria-label="Drag container width" aria-valuemin="320" aria-valuemax="1280" aria-valuenow="${s.width}"><rect x="${hx-17}" y="${top}" width="34" height="${height}" fill="transparent"/><circle cx="${hx}" cy="${top+height/2}" r="12" class="drag-handle"/>${text(hx,top+height/2+5,'↔','tiny','text-anchor="middle"')}</g>`;
  svg+=text(left,318,`REMAINDER ${round(m.remainder)} ÷ WEIGHT ${s.weight+2} = ${round(m.unit)} PER STAR`,'mono muted');
  if(m.overflow)svg+=text(left,353,`Overflow: ${round(m.overflow)} u. Reserved tracks exceed the available width.`,'warning tiny');
  else svg+=pill(left,336,174,'Fixed + Auto + gaps','tone-2')+pill(229,336,196,'Star allocation','tone-3')+text(754,355,'Drag the right edge →','tiny muted','text-anchor="end"');
  segments=m.tracks.map((t,i)=>({label:t.label,value:round(t.width)+' u',share:t.width/s.width*100,tone:i+1}));
  metrics=[metric('Available content',round(m.available),'u'),metric('Reserved + gaps',round(m.reserved),'u'),metric('Star remainder',round(m.remainder),'u')];
  code=`<Grid Padding="${s.padding}" ColumnSpacing="${s.gap}">\n  <Grid.ColumnDefinitions>\n    <ColumnDefinition Width="${s.fixed}" />\n    <ColumnDefinition Width="Auto" />  <!-- assumed DesiredSize: ${s.auto} -->\n    <ColumnDefinition Width="${s.weight}*" />\n    <ColumnDefinition Width="2*" />\n  </Grid.ColumnDefinitions>\n</Grid>`;
  readout=m.overflow?'The fixed and Auto tracks do not shrink in this simplified model; the star remainder is clamped to zero.':'The first two tracks keep their requested widths. Stars share only what remains.';
 }
 if(lab.id==='binding') {
  const stale=s.source!==s.target;
  svg=text(36,30,'SOURCE / SIGNAL / TARGET','eyebrow-svg')+text(764,30,`revision ${s.revision}`,'mono muted','text-anchor="end"');
  svg+=card(36,105,240,124,'View model','Title : string','tone-3')+card(524,105,240,124,'TextBox','Text : string','tone-1');
  svg+=text(52,200,s.source.length>22?s.source.slice(0,21)+'…':s.source,'mono')+text(540,200,s.target.length>22?s.target.slice(0,21)+'…':s.target,'mono');
  const live=s.notify&&s.mode!=='OneTime';
  svg+=arrow(278,148,519,148,live?'accent-line':'edge dashed')+pill(328,105,145,live?'PropertyChanged':'No signal',live?'tone-3':'tone-2');
  svg+=`<circle cx="397" cy="148" r="13" class="${live?'signal-node':'surface-stroke'}"/>`+text(397,153,live?'✓':'×','tiny','text-anchor="middle"');
  if(s.mode==='TwoWay')svg+=line(521,191,279,191,'accent-line')+`<path d="M 285 186 L 278 191 L 285 196" class="accent-line" fill="none"/>`+text(399,217,'write back','tiny muted','text-anchor="middle"');
  svg+=pill(54,261,180,s.mode,'tone-4')+pill(544,261,194,stale?'Target is stale':'Values synchronized',stale?'tone-2':'tone-3');
  svg+=text(36,337,stale?'A value changed without a complete update path.':'Edit either field. Inspect the direction and the notification contract.','tiny muted');
  segments=[{label:'Source',value:'Owns the value',tone:3},{label:'Notification',value:s.notify?'Enabled':'Missing',tone:2},{label:'Target',value:stale?'Stale':'Synchronized',tone:1}];
  metrics=[metric('Binding mode',s.mode),metric('Notification',s.notify?'Enabled':'Disabled'),metric('Relationship',stale?'Stale':'In sync')];
  code=`<TextBox Text="{Binding Title, Mode=${s.mode}}" />\n\n// Inside the source setter:\n_title = value;\n${s.notify?'PropertyChanged?.Invoke(this, new(nameof(Title)));':'// No PropertyChanged event is raised.'}`;
  readout=stale?'The mismatched values are evidence of a missing edge. Use “Rebind” to perform a fresh initial read.':'Values agree now. That does not guarantee the next change will propagate; inspect the mode and notification.';
  trace=s.trace;
 }
 if(lab.id==='tree') {
  svg=text(34,30,'OBJECT EXPLORER','eyebrow-svg')+text(385,30,'LINKED UI PREVIEW · MODEL','eyebrow-svg');
  const depth=[0,1,2,3,4,4];
  treeNodes.forEach((name,i)=>{
   const x=35+depth[i]*17,y=55+i*46;
   svg+=`<g data-node="${name}" tabindex="0" role="button" aria-label="Inspect ${name}" aria-pressed="${s.selected===name}">`+rect(x,y,246-depth[i]*17,36,s.selected===name?'tone-1 selected-node':'surface-stroke')+text(x+13,y+23,`${i<4?'▾':'◇'}  ${name}`,'mono tiny')+'</g>';
  });
  const boxes={Page:[370,55,390,286],Grid:[386,89,358,236],Border:[403,114,324,192],StackPanel:[403+s.padding,130+s.padding/2,324-s.padding*2,148],TextBlock:[419+s.padding/2,167,260,44],Button:[419+s.padding/2,239,176,39]};
  svg+=rect(...boxes.Page,'surface-stroke')+text(389,78,'My workspace','tiny muted')+rect(...boxes.Border,'tone-3');
  svg+=text(419+s.padding/2,198,'Make something useful.','serif',`style="font-size:${s.font}px"`)+text(419+s.padding/2,225,'One object tree. Many possibilities.','tiny muted')+rect(...boxes.Button,'tone-1')+text(439+s.padding/2,264,'Start building  →','tiny');
  const b=boxes[s.selected];svg+=rect(b[0]-3,b[1]-3,b[2]+6,b[3]+6,'selection-outline')+text(760,367,s.selected+' selected','mono accent','text-anchor="end"');
  const properties={Page:['Content','Grid'],Grid:['Children.Count','1'],Border:['Padding',s.padding],StackPanel:['Children.Count','2'],TextBlock:['FontSize',s.font],Button:['Content','Start building']};
  metrics=[metric('Selected object',s.selected),metric('Owner',s.selected==='Page'?'Window':s.selected==='Button'?'StackPanel':treeNodes[Math.max(0,treeNodes.indexOf(s.selected)-1)]),metric(properties[s.selected][0],properties[s.selected][1])];
  code=`<Border Padding="${s.padding}">\n  <StackPanel>\n    <TextBlock Text="Make something useful." FontSize="${s.font}" />\n    <Button Content="Start building" />\n  </StackPanel>\n</Border>`;
  readout='Select a tree row or use the object selector. The same identity is highlighted in the modeled preview.';
 }
 if(lab.id==='box') {
  const m=boxGeometry(s),x=(800-s.width)/2,y=72,height=254;
  svg=text(34,30,'A BOUNDED SLOT · UNIFORM INSETS','eyebrow-svg');
  const levels=[{inset:0,cls:'tone-2',title:'Margin'},{inset:s.margin,cls:'tone-4',title:'Border'},{inset:s.margin+s.border,cls:'tone-1',title:'Padding'},{inset:m.inset,cls:'tone-3',title:'Content'}];
  levels.forEach((l,i)=>{const width=Math.max(0,s.width-l.inset*2),he=Math.max(0,height-l.inset*1.35);svg+=rect(x+l.inset,y+l.inset*.65,width,he,l.cls+(step===i?' is-highlight':''));});
  svg+=text(400,205,`${round(m.content)} u`,'big-metric','text-anchor="middle"')+text(400,234,'remaining content width','tiny','text-anchor="middle"');
  svg+=line(x,348,x+s.width,348,'dimension')+text(400,374,`${s.width} − 2 × (${s.margin} + ${s.border} + ${s.padding}) = ${round(m.content)}`,'mono','text-anchor="middle"');
  segments=[{label:'Margin',value:s.margin+' u / side',tone:2},{label:'Border',value:s.border+' u / side',tone:4},{label:'Padding',value:s.padding+' u / side',tone:1},{label:'Content',value:m.content+' u',tone:3}];
  metrics=[metric('Outer slot',s.width,'u'),metric('Insets per side',m.inset,'u'),metric('Content width',m.content,'u')];
  code=`<Border Margin="${s.margin}" BorderThickness="${s.border}" Padding="${s.padding}">\n  <TextBlock Text="Content" />\n</Border>`;
  readout='Each uniform inset is paid twice on the horizontal axis: once on the left and once on the right.';
 }
 if(lab.id==='state') {
  const nodes={idle:[46,138],loading:[278,138],success:[546,56],error:[546,161],cancelled:[546,266]};
  svg=text(34,30,'EXPLICIT STATES · VALID TRANSITIONS','eyebrow-svg');
  svg+=arrow(204,173,272,173,'edge')+text(236,153,'load','tiny muted','text-anchor="middle"');
  for(const [name,y]of [['success',91],['error',196],['cancelled',301]])svg+=`<path d="M 440 173 C 490 173 490 ${y} 540 ${y}" class="${s.status===name?'accent-line':'edge'}" fill="none"/>`;
  for(const [name,[x,y]]of Object.entries(nodes))svg+=rect(x,y,158,70,s.status===name?'tone-3 selected-node':'surface-stroke')+text(x+79,y+41,name,'node-title','text-anchor="middle"');
  svg+=text(34,368,'A disabled action is a state constraint, not a hidden transition.','tiny muted');
  metrics=[metric('Current state',s.status),metric('Accepted transitions',s.sequence),metric('Pending work',s.status==='loading'?'Yes':'No')];
  code=`// Explicit transition contract (model):\n${s.trace.length?s.trace.map(t=>`${t.from} --${t.action}--> ${t.to}`).join('\n'):'idle --load--> loading'}\n\n// Keep cancelled distinct from failed.`;
  readout={idle:'Ready for a new task.',loading:'Keep feedback visible; cancellation is available.',success:'The task completed. Another load is allowed.',error:'A recoverable error offers an explicit retry.',cancelled:'The user cancelled; this is not an error.'}[s.status];
  trace=s.trace.map(t=>[t.action,`${t.from} → ${t.to}`]);
 }
 if(lab.id==='race') {
  const m=raceState(s),scale=.227,start=140;
  svg=text(34,30,'OVERLAPPING REQUESTS · EDITABLE LATENCIES','eyebrow-svg');
  for(let t=0;t<=2800;t+=400)svg+=text(start+t*scale,65,t+'','tiny muted','text-anchor="middle"')+line(start+t*scale,77,start+t*scale,263,'grid-line');
  m.requests.forEach((r,i)=>{const y=105+i*91;svg+=text(34,y+24,`Request ${i?'B':'A'}`,'node-title')+rect(start+r.start*scale,y,Math.max(2,(r.end-r.start)*scale),44,i?'tone-3':'tone-2')+text(start+r.start*scale+10,y+28,`${r.label} · ${r.end-r.start} ms`,'tiny')+pill(594,y+49,170,r.status,r.status==='ignored'?'tone-2':'tone-4');});
  const px=start+s.time*scale;svg+=line(px,78,px,260,'accent-line')+`<circle cx="${px}" cy="78" r="5" class="signal-node"/>`;
  svg+=rect(140,294,624,66,m.stale?'tone-2':'tone-3')+text(158,320,'RENDERED RESULT','eyebrow-svg')+text(158,344,m.result?`${m.result.label} ${m.stale?'· STALE RESULT':'· accepted'}`:'Waiting for an accepted completion…','node-title');
  metrics=[metric('Scrub position',s.time,'ms'),metric('Policy',s.latestOnly?'Latest started':'Last completed'),metric('Output',m.stale?'Stale':m.result?'Current':'Pending')];
  code=s.latestOnly?'var generation = ++_generation;\nvar result = await SearchAsync(query, token);\nif (generation != _generation) return;\nResults = result;':'// Deliberately unsafe when operations overlap:\nResults = await SearchAsync(query, token);';
  readout=m.stale?'A finished last, but B represented newer intent. The older result has overwritten the newer one.':'A generation check accepts only the newest started request, irrespective of completion order.';
 }
 if(lab.id==='virtualization') {
  const m=visibleRange(s),left=250,top=78,scale=Math.min(1,244/s.viewport);
  svg=text(34,30,'DATA EXTENT / VIEWPORT / CONTAINER POOL','eyebrow-svg');
  svg+=rect(50,78,62,248,'surface-stroke');
  for(let i=0;i<28;i++)svg+=line(59,85+i*8.25,103,85+i*8.25,'grid-line');
  const mapY=80+(m.scroll/m.extent)*244,thumb=Math.max(7,s.viewport/m.extent*244);
  svg+=rect(51,mapY,60,thumb,'tone-1')+text(81,352,s.count+' items','tiny muted','text-anchor="middle"');
  svg+=line(114,mapY+thumb/2,235,top+122,'edge dashed');
  svg+=rect(left,top,302,s.viewport*scale,'surface-stroke');
  // Clip just the data area; buffer rows are listed separately in the pool.
  svg+=`<svg x="${left+4}" y="${top}" width="294" height="${s.viewport*scale}" viewBox="0 0 294 ${s.viewport}" overflow="hidden">`;
  m.rows.filter(r=>r.visible).forEach(r=>{svg+=rect(3,r.top+2,288,s.rowHeight-4,`tone-${r.slot%4+1}`)+text(17,r.top+Math.min(s.rowHeight-6,26),`Item ${r.index}   →   slot ${r.slot}`,'mono tiny');});
  svg+='</svg>';
  svg+=text(left,352,`Visible ${m.firstVisible}–${m.lastVisible}`,'mono muted');
  svg+=text(601,65,'REUSABLE SLOTS','eyebrow-svg');
  m.rows.slice(0,20).forEach((r,i)=>{const col=i%2,row=Math.floor(i/2),x=599+col*87,y=78+row*28;svg+=rect(x,y,79,23,r.visible?`tone-${r.slot%4+1}`:'surface-stroke')+text(x+39,y+16,`${r.slot} ↦ ${r.index}`,'tiny mono','text-anchor="middle"');});
  metrics=[metric('Data items',s.count),metric('Realized containers',m.realized),metric('Realization share',round(m.realized/s.count*100,2),'%')];
  code=`firstVisible = floor(${round(m.scroll)} / ${s.rowHeight}); // ${m.firstVisible}\nlastVisible = ceil((${round(m.scroll)} + ${s.viewport}) / ${s.rowHeight}) - 1;\nrealize = [${m.first}, ${m.last}]; // includes overscan\n\n// Model pool assignment: itemIndex % ${m.capacity}\n// Data count is not visual-tree size.`;
  readout=`${m.realized} containers represent the nearby range. The ${s.count.toLocaleString()} data items remain a separate allocation.`;
 }
 if(lab.id==='pipeline') {
  const layout=['Text','Width'].includes(s.property);const active=s.changed?[true,layout,layout,true]:[false,false,false,false];
  const names=['Property','Measure','Arrange','Present'];
  svg=text(34,30,'DEPENDENCIES, NOT A TIMING TRACE','eyebrow-svg');
  for(let i=0;i<4;i++){const x=35+i*191;svg+=rect(x,124,156,100,active[i]?`tone-${i===3?3:1}`:'surface-stroke')+text(x+16,151,'0'+(i+1),'tiny mono muted')+text(x+16,182,names[i],'node-title')+text(x+16,208,active[i]?'Needs work':'Unchanged','tiny muted');if(i<3)svg+=arrow(x+159,173,x+184,173,active[i]?'accent-line':'edge dashed');}
  if(s.changed&&!layout)svg+=`<path d="M 113 124 C 113 62 686 62 686 124" class="accent-line" fill="none"/>`+text(400,68,'Visual change bypasses layout in this model','tiny accent','text-anchor="middle"');
  svg+=rect(35,272,730,69,s.changed?'tone-3':'tone-2')+text(54,302,s.changed?`${s.property} changed`:'Setter equality guard: no effective change','node-title')+text(54,325,layout?'The modeled content or size change invalidates layout.':'The modeled visual change updates drawing or composition state.','tiny muted');
  metrics=[metric('Changed property',s.property),metric('Layout phases',active[1]?'2':'0'),metric('Active phases',active.filter(Boolean).length)];
  code=`if (oldValue == newValue) return;\n// ${s.property} change${s.changed?'':' was eliminated by equality guard'}.\n${s.changed?(layout?'InvalidateMeasure();\n// A later layout pass determines final rectangles.':'// Update the affected render/composition state.'):'// No invalidation required in this model.'}`;
  readout='The line describes a dependency, not elapsed time. Use actual runtime profiling to establish costs.';
 }
 if(lab.id==='damage') {
  const m=damageTiles({...s,tile:+s.tile}),ox=80,oy=46;
  svg=text(34,24,'OLD + NEW BOUNDS · CONSERVATIVE DAMAGE','eyebrow-svg');
  m.cells.forEach(c=>{svg+=rect(ox+c.x+1,oy+c.y+1,c.w-2,c.h-2,c.flag===3?'tile-overlap':c.flag===1?'tile-old':c.flag===2?'tile-new':'tile-clean',`data-tile="${c.flag}"`);});
  svg+=rect(ox+m.union.x,oy+m.union.y,m.union.w,m.union.h,'union-outline');
  svg+=rect(ox+m.old.x,oy+m.old.y,m.old.w,m.old.h,'old-outline');
  svg+=`<g data-drag="object" role="button" tabindex="0" aria-label="Drag current object; use X and Y sliders for keyboard control">`+rect(ox+s.x,oy+s.y,s.size,80,'current-object')+text(ox+s.x+12,oy+s.y+32,'Current','node-title')+text(ox+s.x+12,oy+s.y+57,'↔ drag','tiny')+'</g>';
  metrics=[metric('Dirty tiles',m.dirty,`/ ${m.cells.length}`),metric('Bounding union',m.unionCount,'tiles'),metric('Untouched',round((m.cells.length-m.dirty)/m.cells.length*100),'%')];
  code=`// Classify each tile against both expanded regions.\noldDamage = Expand(oldBounds, ${s.stroke});\nnewDamage = Expand(newBounds, ${s.stroke});\ndirty = Intersects(tile, oldDamage) || Intersects(tile, newDamage);\n\n// ${m.dirty} affected tiles versus ${m.unionCount} for the bounding union.\n// Actual WebGPU output is compared with this CPU reference.`;
  readout='Orange: old only. Teal: new only. Indigo: overlap. The dashed bounding union can include unaffected tiles.';
 }
 if(lab.id==='easing') {
  const t=s.t/100,p=easing(t,s.kind),left=74,top=51,w=346,he=254;
  svg=text(34,24,'TIME → EASED PROGRESS → POSITION','eyebrow-svg');
  for(let i=0;i<=4;i++){svg+=line(left,top+i*he/4,left+w,top+i*he/4,'grid-line')+line(left+i*w/4,top,left+i*w/4,top+he,'grid-line');svg+=text(left-12,top+he-i*he/4+4,round(i/4),'tiny muted','text-anchor="end"')+text(left+i*w/4,top+he+24,round(i/4),'tiny muted','text-anchor="middle"');}
  const pts=Array.from({length:81},(_,i)=>`${left+i/80*w},${top+he-easing(i/80,s.kind)*he}`).join(' ');
  svg+=line(left,top+he,left+w,top,'edge dashed')+`<polyline points="${pts}" class="curve-line" fill="none"/>`+line(left+t*w,top+he,left+t*w,top+he-p*he,'accent-line')+line(left,top+he-p*he,left+t*w,top+he-p*he,'accent-line')+`<circle cx="${left+t*w}" cy="${top+he-p*he}" r="8" class="signal-node"/>`;
  svg+=text(510,87,'LINEAR VS EASED','eyebrow-svg')+text(510,129,'Linear','tiny muted')+line(511,157,743,157,'dimension')+`<circle cx="${511+t*232}" cy="157" r="12" class="reference-dot"/>`+text(510,204,s.kind,'tiny muted')+line(511,236,743,236,'dimension')+`<circle cx="${511+p*232}" cy="236" r="16" class="signal-node"/>`;
  svg+=text(246,371,'Normalized elapsed time','tiny muted','text-anchor="middle"')+text(628,296,`${round(p*s.distance)} / ${s.distance} u`,'mono','text-anchor="middle"');
  metrics=[metric('Elapsed time',s.t,'%'),metric('Eased progress',round(p*100),'%'),metric('Position',round(p*s.distance),'u')];
  code=`t = ${round(t,2)};\neased = ${s.kind==='linear'?'t':s.kind==='ease-in'?'t * t * t':s.kind==='ease-out'?'1 - pow(1 - t, 3)':'t < 0.5 ? 4*t*t*t : 1 - pow(-2*t + 2, 3)/2'};\nposition = start + (end - start) * eased;\n// ${round(p*s.distance)} logical units along a ${s.distance}-unit path.`;
  readout='The two markers use the same clock. Only the time-to-progress function differs.';
 }
 if(lab.id==='precedence') {
  const m=effectiveValue({...s,defaultValue:14});
  svg=text(34,30,'EFFECTIVE VALUE STACK','eyebrow-svg')+text(503,30,'LINKED PREVIEW · MODEL','eyebrow-svg');
  m.layers.forEach((l,i)=>{const y=59+i*72;svg+=rect(35,y,376,58,l.id===m.winner.id?'tone-1 selected-node':'surface-stroke')+text(52,y+23,l.label,'node-title')+text(52,y+44,!l.enabled?'Not active':l.id===m.winner.id?'Effective source':'Overridden','tiny muted')+text(390,y+36,l.value+' pt','mono','text-anchor="end"');});
  svg+=rect(479,105,286,196,'tone-3')+text(503,139,'THE WINNING VALUE','eyebrow-svg')+text(503,202,'Hello, Uno.','serif',`style="font-size:${m.winner.value}px"`)+text(503,257,`${m.winner.label} → ${m.winner.value} pt`,'tiny muted');
  svg+=text(35,376,'Priority is not assignment order. Clear removes a local entry.','tiny muted');
  metrics=[metric('Effective FontSize',m.winner.value,'pt'),metric('Winning layer',m.winner.id),metric('Local entry',s.hasLocal?'Present':'Cleared')];
  code=`style.Setters.Add(new Setter(TextBlock.FontSizeProperty, ${s.styleValue}.0));\n${s.hasLocal?`title.FontSize = ${s.localValue};`:'title.ClearValue(TextBlock.FontSizeProperty);'}\n${s.animated?`// Active animation currently contributes ${s.animationValue} pt.`:'// No active animation.'}\n// Effective value in this subset: ${m.winner.value} pt`;
  readout='A local value equal to the metadata default is still a local value. ClearValue removes that precedence layer.';
 }
 return {svg,metrics,code,readout,trace,segments};
}

/** Original vector covers; different geometry for every experiment family. */
export function cover(id) {
 if(lessonLabMap.has(id)){const lab=lessonLabMap.get(id);return `<svg viewBox="0 0 800 400" aria-hidden="true" focusable="false">${lessonScene(lab,lab.defaults).svg.replace(/<text[\s\S]*?<\/text>/g,'')}</svg>`;}
 const s={...({layout:{width:800,fixed:120,auto:104,weight:1,gap:12,padding:24},binding:{source:'Hello, Uno',target:'Hello, Uno',mode:'OneWay',notify:true,revision:0},tree:{selected:'TextBlock',padding:24,font:26},box:{width:520,margin:24,border:4,padding:32},state:{status:'loading',sequence:1,trace:[]},race:{a:1800,b:400,secondAt:300,time:2000,latestOnly:true},virtualization:{count:5000,offset:1600,rowHeight:40,viewport:240,overscan:2},pipeline:{property:'Opacity',changed:true},damage:{x:344,y:152,size:112,stroke:8,tile:32},easing:{kind:'ease-in-out',t:35,distance:360},precedence:{styleValue:24,localValue:40,hasLocal:true,animated:false,animationValue:32}}[id])};
 // Compact covers retain the distinctive geometry but omit verbose annotations.
 const raw=scene({id},s,0).svg.replace(/<text[\s\S]*?<\/text>/g,'');
 return `<svg viewBox="0 0 800 400" aria-hidden="true" focusable="false">${raw.replace(/ tabindex="0"| role="[^"]+"| aria-[\w-]+="[^"]*"/g,'')}</svg>`;
}
