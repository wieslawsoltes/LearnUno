import {definitions,initialHistory,historyTransition} from './models.mjs';
export function controlledComparison(id) {
 const baseline=structuredClone(definitions[id].defaults);let changed;
 const captions={
  'converter-contract':'Change only the formatting precision; the numeric source stays the same.',
  'page-window':'Request three records instead of five without changing the viewport constraint.',
  'content-outcomes':'A refresh moves from pending to failure while the previous accepted rows remain visible.',
  'versioned-commit':'After explicitly accepting the new editing base, the expected version matches and the next commit can succeed.',
  'collection-batch-ledger':'Replace the same number of items with one broad Reset instead of Clear plus individual Adds. Event count is not a timing claim.',
  'history-branch':'Commit A, B, and C; Undo to B; commit D. The old redo future containing C is abandoned.'
 };
 if(id==='converter-contract')changed={...baseline,digits:1};
 else if(id==='page-window')changed={...baseline,size:3};
 else if(id==='content-outcomes')changed={...baseline,phase:'failure'};
 else if(id==='versioned-commit')changed={...baseline,base:2};
 else if(id==='collection-batch-ledger')changed={...baseline,strategy:'reset'};
 else if(id==='history-branch'){
  changed=initialHistory(3);for(const title of ['A','B','C'])changed=historyTransition(changed,'commit',title);
  changed=historyTransition(changed,'undo');changed=historyTransition(changed,'commit','D');
 } else throw new Error('Unrecognized comparison');
 return {baseline,changed,caption:captions[id]};
}
