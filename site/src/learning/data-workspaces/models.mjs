/** Pure deterministic teaching models. Inputs are bounded; no timings are claimed. */
export const bounded = (value, min, max, fallback=min) => Number.isFinite(Number(value)) ? Math.max(min,Math.min(max,Number(value))) : fallback;
const integer=(v,min,max,initial)=>Math.round(bounded(v,min,max,initial));
export function convertValue(input={}) {
  const value=bounded(input.value,-1,2,.375),digits=integer(input.digits,0,3,0);
  const culture=['en-US','pl-PL','de-DE'].includes(input.culture)?input.culture:'en-US';
  const valid=input.valid!==false;
  return {value,digits,culture,valid,display:valid?new Intl.NumberFormat(culture,{style:'percent',minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value):'No converter value',scaled:value*100,sourceUnchanged:value,rounded:Math.round(value*100*10**digits)/10**digits};
}
export function pageWindow(input={}) {
  const total=integer(input.total,0,1000,23),size=integer(input.size,1,25,5),loaded=Math.min(total,integer(input.loaded,0,1000,10));
  const repeat=integer(input.repeat,0,10,0),start=Math.max(0,loaded-repeat),end=Math.min(total,start+size);
  const received=Array.from({length:Math.max(0,end-start)},(_,i)=>start+i+1);
  const accepted=received.filter(id=>id>loaded),duplicates=received.length-accepted.length;
  return {total,size,loaded,start,end,received,accepted,duplicates,nextLoaded:Math.min(total,loaded+accepted.length),hasMore:end<total,viewportRows:6,realized:Math.min(loaded,10)};
}
export function contentOutcome(input={}) {
  const phase=['idle','loading','refreshing','success','empty','failure','cancelled'].includes(input.phase)?input.phase:'refreshing';
  const previous=integer(input.previous,0,12,3),retain=input.retain!==false;
  const pending=['loading','refreshing'].includes(phase);
  const rows=phase==='success'?3:phase==='empty'||phase==='idle'?0:(retain?previous:0);
  const stale=rows>0 && ['refreshing','failure','cancelled','loading'].includes(phase);
  const message={idle:'No request yet',loading:'Initial request pending',refreshing:'Refresh pending',success:'Fresh snapshot accepted',empty:'Success: no matching rows',failure:rows?'Refresh failed; older snapshot retained':'Request failed; no content',cancelled:'Cancelled by the user'}[phase];
  return {phase,previous,retain,pending,rows,stale,message,canRetry:phase==='failure',canCancel:pending};
}
export function versionedCommit(input={}) {
  const base=integer(input.base,1,20,1),current=integer(input.current,1,20,2);
  const draft=String(input.draft??'My proposed title').slice(0,60),minimum=integer(input.minimum,1,12,3);
  const valid=draft.trim().length>=minimum,conflict=base!==current;
  const outcome=!valid?'validation':conflict?'conflict':'accepted';
  return {base,current,draft,minimum,valid,conflict,outcome,nextVersion:outcome==='accepted'?current+1:current,retainedDraft:draft,acceptedTitle:outcome==='accepted'?draft.trim():null};
}
export function notificationLedger(input={}) {
  const count=integer(input.count,0,100,10),strategy=input.strategy==='reset'?'reset':'incremental';
  const actions=strategy==='reset'?['Reset']:['Reset',...Array(count).fill('Add')];
  const stable=input.stable!==false,selected=integer(input.selected,1,100,4);
  return {count,strategy,actions,eventCount:actions.length,stable,selected,selectionResolvable:stable&&selected<=count,selectionClaim:stable&&selected<=count?'Can resolve selected key; restoration still explicit':'No valid selected-key match',performance:'Not measured'};
}
export function initialHistory(capacity=3) {
  return {capacity:integer(capacity,1,12,3),past:[],current:'Untitled',future:[]};
}
export function historyTransition(state,action,value) {
  const s={capacity:state.capacity,past:[...state.past],current:state.current,future:[...state.future]};
  if(action==='commit') {
    const title=String(value??'').trim().slice(0,60);
    if(!title||title===s.current)return state;
    s.past.push(s.current);s.past=s.past.slice(-s.capacity);s.current=title;s.future=[];
  } else if(action==='undo'&&s.past.length) {s.future.push(s.current);s.current=s.past.pop();}
  else if(action==='redo'&&s.future.length) {s.past.push(s.current);s.current=s.future.pop();}
  else return state;
  return s;
}
export const definitions={
 'converter-contract':{defaults:{value:.375,digits:0,culture:'en-US',valid:true},controls:[['value','Fraction','range',-1,2,.001],['digits','Precision','range',0,3,1],['culture','Culture','select',['en-US','pl-PL','de-DE']],['valid','Compatible finite input','check']],calculate:convertValue},
 'page-window':{defaults:{total:23,size:5,loaded:10,repeat:0},controls:[['total','Total data items','range',0,100,1],['size','Page size','range',1,25,1],['loaded','Previously loaded','range',0,100,1],['repeat','Repeated boundary items','range',0,10,1]],calculate:pageWindow},
 'content-outcomes':{defaults:{phase:'refreshing',previous:3,retain:true},controls:[['phase','Request outcome','select',['idle','loading','refreshing','success','empty','failure','cancelled']],['previous','Previously accepted rows','range',0,12,1],['retain','Retain accepted snapshot','check']],calculate:contentOutcome},
 'versioned-commit':{defaults:{base:1,current:2,draft:'My proposed title',minimum:3},controls:[['base','Draft base version','range',1,20,1],['current','Store version','range',1,20,1],['draft','Draft title','text'],['minimum','Minimum title length','range',1,12,1]],calculate:versionedCommit},
 'collection-batch-ledger':{defaults:{count:10,strategy:'incremental',stable:true,selected:4},controls:[['count','Replacement item count','range',0,100,1],['strategy','Update strategy','select',['incremental','reset']],['stable','Stable keys available','check'],['selected','Selected key','range',1,100,1]],calculate:notificationLedger},
 'history-branch':{defaults:initialHistory(),controls:[],calculate:s=>s}
};
