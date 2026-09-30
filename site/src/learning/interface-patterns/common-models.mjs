/** Small deterministic contracts. These are teaching models, not Uno internals. */
export function captionBinding(hostTitle, replaceContext=false) {
 const title=String(hostTitle).slice(0,80);
 return {hostTitle:title,externalContext:replaceContext?'SummaryCard (no Title property)':'DashboardState',caption:replaceContext?'':title,archive:'Archive',bound:!replaceContext};
}
export const reportCards=Object.freeze([
 Object.freeze({id:'doc-1',title:'Checklist'}),Object.freeze({id:'doc-2',title:'Research notes'}),Object.freeze({id:'doc-3',title:'Release plan'})
]);
export function collectionView(reversed=false,hiddenKey=null,selectedKey='doc-2') {
 const items=reportCards.filter(c=>c.id!==hiddenKey);
 if(reversed)items.reverse();
 return {items,selectedKey:items.some(c=>c.id===selectedKey)?selectedKey:null};
}
export function quantityDraft(text, minimum=1, maximum=100) {
 if(!Number.isSafeInteger(minimum)||!Number.isSafeInteger(maximum)||minimum>maximum)throw new RangeError('Invalid quantity policy');
 const draft=String(text).trim();
 if(!draft)return {kind:'missing',value:null,accepted:false,reason:'A quantity is required; blank is not zero.'};
 // Deliberately small invariant decimal syntax. The actual NumberBox owns its parser.
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(draft))return {kind:'syntax',value:null,accepted:false,reason:'Use a plain decimal value in this HTML model.'};
 const value=Number(draft);
 if(!Number.isFinite(value))return {kind:'nonfinite',value:null,accepted:false,reason:'The value must be finite.'};
 if(!Number.isSafeInteger(value))return {kind:'fraction',value,accepted:false,reason:'Quantity must contain whole items.'};
 if(value<minimum||value>maximum)return {kind:'range',value,accepted:false,reason:`Use ${minimum} through ${maximum} whole items.`};
 return {kind:'valid',value,accepted:true,reason:'The draft satisfies the quantity contract.'};
}
