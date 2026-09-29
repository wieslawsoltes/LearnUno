/** Pure teaching models. No browser dependencies and no claims of renderer timings. */
export const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(+n) ? +n : min));
export const round = (n, digits = 1) => Number(n.toFixed(digits));
export function gridLayout({width, fixed, auto, weight, gap, padding}) {
  const available = Math.max(0, width - padding * 2);
  const reserved = fixed + auto + gap * 3;
  const remainder = Math.max(0, available - reserved);
  const unit = remainder / (weight + 2);
  const sizes = [fixed, auto, unit * weight, unit * 2];
  let x = padding;
  const tracks = sizes.map((size, i) => { const track = {x, width: size, label: ['Pixel','Auto',`${weight}*`,'2*'][i]}; x += size + gap; return track; });
  return {available, reserved, remainder, unit, sizes, tracks, overflow: Math.max(0, reserved - available)};
}
export function boxGeometry({width, margin, border, padding}) {
  const content = Math.max(0, width - 2 * (margin + border + padding));
  return {content, outer: width, borderBox: Math.max(0, width - margin * 2), paddingBox: Math.max(0, width - 2 * (margin + border)), inset: margin + border + padding};
}
export function visibleRange({count, offset, rowHeight, viewport, overscan}) {
  const extent = count * rowHeight;
  const scroll = clamp(offset, 0, Math.max(0, extent - viewport));
  const firstVisible = Math.min(count - 1, Math.floor(scroll / rowHeight));
  const lastVisible = Math.min(count - 1, Math.ceil((scroll + viewport) / rowHeight) - 1);
  const first = Math.max(0, firstVisible - overscan);
  const last = Math.min(count - 1, lastVisible + overscan);
  const capacity = Math.min(count, Math.ceil(viewport / rowHeight) + 1 + overscan * 2);
  return {extent, scroll, firstVisible, lastVisible, first, last, realized: last - first + 1, capacity,
    rows: Array.from({length: last - first + 1}, (_, i) => { const index = first + i; return {index, slot: index % capacity, top: index * rowHeight - scroll, visible: index >= firstVisible && index <= lastVisible}; })};
}
export function bindingTransition(state, side, next) {
  const s = {...state, revision: state.revision + 1};
  const trace = [];
  if (side === 'source') {
    s.source = next; trace.push(['Source setter', `Title ← “${next}”`]);
    if (s.mode === 'OneTime') trace.push(['No subscription', 'OneTime keeps its initial snapshot.']);
    else if (!s.notify) trace.push(['Notification absent', 'The target has no signal to read again.']);
    else {s.target = next;trace.push(['PropertyChanged', 'nameof(Title)'],['Binding engine', 'Read the updated source'],['Target updated', `Text ← “${next}”`]);}
  } else {
    s.target = next;trace.push(['Target edit', `Text ← “${next}”`]);
    if (s.mode === 'TwoWay') {s.source = next;trace.push(['Write back', `Title ← “${next}”`],['Equality guard', 'Do not circulate the same value.']);}
    else trace.push(['No write-back', `${s.mode} does not write to the source.`]);
  }
  return {...s, trace};
}
export function rebind(state) { return {...state, target: state.source, revision: state.revision + 1, trace: [['Attach binding', `${state.mode}; initial source read`],['Target initialized', `Text ← “${state.source}”`]]}; }
export function effectiveValue({defaultValue, styleValue, localValue, hasLocal, animated, animationValue}) {
  const layers = [
    {id:'animation', label:'Active animation', value:animationValue, enabled:animated},
    {id:'local', label:'Local value', value:localValue, enabled:hasLocal},
    {id:'style', label:'Style setter', value:styleValue, enabled:true},
    {id:'default', label:'Metadata default', value:defaultValue, enabled:true}
  ];
  const winner = layers.find(x => x.enabled);
  return {layers, winner};
}
export function easing(t, kind) {
  t = clamp(t,0,1);
  if(kind === 'ease-in') return t*t*t;
  if(kind === 'ease-out') return 1-(1-t)**3;
  if(kind === 'ease-in-out') return t<.5 ? 4*t*t*t : 1-(-2*t+2)**3/2;
  return t;
}
export function frameBudget({hz, input, layout, paint, gpu}) {
  const budget = 1000 / hz;
  const total = input + layout + paint + gpu;
  return {budget,total,slack:budget-total,missed:Math.max(0,Math.ceil(total/budget)-1), blocks:[input,layout,paint,gpu]};
}
export function raceState({a, b, secondAt, time, latestOnly}) {
  const requests = [{id:1, start:0, end:a, label:'Search “U”'}, {id:2, start:secondAt, end:secondAt+b, label:'Search “Uno”'}];
  const started = requests.filter(r=>r.start<=time);
  const latest = started.at(-1)?.id;
  const finished = requests.filter(r=>r.end<=time).sort((x,y)=>x.end-y.end);
  const accepted = finished.filter(r=>!latestOnly || r.id===latest);
  const result = accepted.at(-1);
  return {requests: requests.map(r=>({...r,status:time<r.start?'not started':time<r.end?'pending':latestOnly && r.id!==latest?'ignored':'completed'})), result, stale:!!result&&result.id!==latest};
}
export function stateTransition(s, action) {
  const transitions = {idle:{load:'loading'},loading:{success:'success',fail:'error',cancel:'cancelled'},success:{load:'loading'},error:{retry:'loading'},cancelled:{load:'loading'}};
  const next = transitions[s.status]?.[action];
  if(!next) return s;
  return {status:next, sequence:s.sequence+1, trace:[...s.trace.slice(-5),{from:s.status,to:next,action}]};
}
export function damageTiles({x, y, size, stroke, tile}) {
  const width=640, height=320;
  const old={x:128,y:96,w:112,h:80};
  const current={x,y,w:size,h:80};
  const expand=r=>({x:r.x-stroke,y:r.y-stroke,w:r.w+stroke*2,h:r.h+stroke*2});
  const previous=expand(old), next=expand(current);
  const union={x:Math.min(previous.x,next.x),y:Math.min(previous.y,next.y)};
  union.w=Math.max(previous.x+previous.w,next.x+next.w)-union.x;
  union.h=Math.max(previous.y+previous.h,next.y+next.h)-union.y;
  const cols=Math.ceil(width/tile),rows=Math.ceil(height/tile);
  const intersects=(a,b)=>a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
  const cells=Array.from({length:cols*rows},(_,i)=>{
    const r={x:(i%cols)*tile,y:Math.floor(i/cols)*tile,w:Math.min(tile,width-(i%cols)*tile),h:Math.min(tile,height-Math.floor(i/cols)*tile)};
    return {...r,flag:(intersects(r,previous)?1:0)|(intersects(r,next)?2:0),union:intersects(r,union)};
  });
  return {width,height,old,current,previous,next,union,cols,rows,cells,dirty:cells.filter(c=>c.flag).length,unionCount:cells.filter(c=>c.union).length};
}
