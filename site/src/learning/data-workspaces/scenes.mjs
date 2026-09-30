import {definitions} from './models.mjs';
export const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,value,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${escape(value)}</text>`;
const box=(x,y,w,h,cls='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" class="${cls}"/>`;
const line=(x,y,xx,yy,cls='')=>`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" class="${cls}"/>`;
const label=(x,y,w,title,body,cls='')=>box(x,y,w,80,cls)+text(x+14,y+28,title,'title')+text(x+14,y+57,body,'small');
const trunc=(v,n=25)=>String(v).length>n?String(v).slice(0,n-1)+'…':String(v);
export function drawScene(id,input,phase=0) {
  const definition=definitions[id];if(!definition)throw new Error('Unknown scene');
  const m=definition.calculate(input);let svg='',metrics=[],explain='';
  if(id==='converter-contract') {
    svg=label(30,115,196,'Typed source',`${m.value} : double`,'teal')+label(275,70,225,'Convert',`P${m.digits} · ${m.culture}`,'violet')+label(553,115,218,'Presentation',m.display,m.valid?'teal':'amber');
    svg+=line(229,153,271,110)+line(503,110,549,153)+line(124,201,124,275)+text(42,301,'Source is not written back','small');
    svg+=text(290,196,`scaled: ${m.scaled.toFixed(3)}`,'mono')+text(290,224,`rounded: ${m.rounded}`,'mono')+box(274,247,260,58,'amber')+text(289,282,'Not a persistence operation','small');
    metrics=[['Source',m.value],['Target',m.display],['Direction','OneWay']];explain='The source value is retained. A percentage formatter changes representation, not the stored number. Invalid input produces no converter value in this model.';
  } else if(id==='page-window') {
    const scale=700/Math.max(1,m.total),top=117;
    svg=text(32,67,'DATA INTERVALS · RECORD KEYS','title')+box(32,top,700,72,'neutral');
    svg+=box(32,top,m.loaded*scale,72,'teal')+box(32+m.start*scale,top+94,(m.end-m.start)*scale,44,'violet');
    svg+=text(42,top+43,`${m.loaded} already loaded`,'small')+text(32+m.start*scale,top+168,`receive ${m.received.join(', ')||'nothing'}`,'small');
    svg+=text(32,330,`${m.accepted.length} new keys · ${m.duplicates} duplicate keys · ${m.total} source items`,'mono');
    metrics=[['Loaded after acceptance',m.nextLoaded],['Page records',m.received.length],['Duplicate keys',m.duplicates]];explain='Loaded membership, requested interval, and viewport realization are separate counts. The example ignores duplicates by stable ID; it does not reconcile changed fields.';
  } else if(id==='content-outcomes') {
    svg=text(35,62,'REQUEST STATUS','title')+text(390,62,'ACCEPTED SNAPSHOT','title');
    svg+=label(35,95,270,m.phase,m.pending?'Request is pending':'No active request',m.phase==='failure'?'amber':'violet');
    svg+=box(390,94,352,225,'neutral');for(let i=0;i<Math.min(5,m.rows);i++)svg+=box(404,109+i*35,323,27,m.stale?'amber':'teal')+text(415,129+i*35,`Row ${i+1} · ${m.stale?'older snapshot':'current snapshot'}`,'small');
    if(!m.rows)svg+=text(414,169,m.phase==='empty'?'Success: empty result':'No accepted rows','small');
    svg+=label(35,217,270,'Recovery',m.canCancel?'Cancel is available':m.canRetry?'Retry is available':'Await the next intent','teal');
    metrics=[['Request',m.phase],['Visible rows',m.rows],['Freshness',m.stale?'Older snapshot':m.rows?'Fresh':'No rows']];explain=m.message+'. The presence of useful content and the latest request outcome are independently represented.';
  } else if(id==='versioned-commit') {
    svg=label(35,67,285,'Local draft',`based on version ${m.base}`,'violet')+text(49,174,trunc(m.draft,30),'mono')+label(474,67,285,'Authoritative record',`current version ${m.current}`,'teal');
    svg+=line(178,154,340,240)+line(612,154,438,240)+`<path d="M 389 192 L 470 250 L 389 309 L 309 250 Z" class="${m.outcome==='accepted'?'teal':'amber'}"/>`+text(349,254,'compare','small');
    svg+=text(277,351,m.outcome==='accepted'?`Accept → version ${m.nextVersion}`:`Reject: ${m.outcome}; preserve draft`,'title');
    metrics=[['Expected',m.base],['Actual',m.current],['Decision',m.outcome]];explain='The expected version describes the draft’s base. An authoritative compare-and-update must be atomic; this in-memory teaching model does not supply distributed guarantees.';
  } else if(id==='collection-batch-ledger') {
    svg=text(34,57,'NOTIFICATION STREAM','title');
    m.actions.slice(0,18).forEach((a,i)=>{const x=34+(i%6)*121,y=80+Math.floor(i/6)*61;svg+=box(x,y,107,42,a==='Reset'?'amber':'teal')+text(x+13,y+27,a,'small');});
    if(m.actions.length>18)svg+=text(38,294,`… ${m.actions.length-18} additional Add notifications`,'small');
    svg+=box(34,317,713,48,'violet')+text(48,347,m.selectionClaim,'small');
    metrics=[['Collection events',m.eventCount],['Final item count',m.count],['Render cost','Not measured']];explain='The ledger counts actual protocol events in the model. One broad Reset is not automatically cheaper than incremental changes, and stable-key selection restoration remains an application responsibility.';
  } else if(id==='history-branch') {
    const past=m.past.slice(-5),future=[...m.future].reverse().slice(0,5);
    svg=text(30,57,'PAST','title')+text(329,57,'CURRENT','title')+text(551,57,'REDO FUTURE','title');
    past.forEach((v,i)=>svg+=box(30,83+i*49,234,36,'neutral')+text(44,107+i*49,trunc(v,25),'small'));
    svg+=label(304,149,213,'Current',trunc(m.current,21),'teal');
    future.forEach((v,i)=>svg+=box(553,83+i*49,214,36,'violet')+text(567,107+i*49,trunc(v,21),'small'));
    svg+=line(272,190,296,190)+line(524,190,545,190)+text(31,357,`Capacity ${m.capacity}. A new commit discards the old redo future.`,'small');
    metrics=[['Undo states',m.past.length],['Current',m.current],['Redo states',m.future.length]];explain='History stores data, not controls. A no-op commit preserves redo; a different commit after Undo starts a new linear future.';
  }
  return {svg,metrics,explain,model:m,phase:Math.max(0,Math.min(3,phase))};
}
