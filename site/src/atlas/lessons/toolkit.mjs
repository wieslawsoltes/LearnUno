import {escapeHtml as esc} from '../../helpers.mjs';
export const R=(key,label,min,max,value,unit='u',step=1)=>({key,label,type:'range',min,max,value,unit,step});
export const S=(key,label,options,value=options[0])=>({key,label,type:'select',options,value});
export const B=(key,label,value=true)=>({key,label,type:'toggle',value});
export const T=(key,label,value)=>({key,label,type:'text',value});
export const n=(value,d=1)=>Number(Number(value).toFixed(d));
export const txt=(x,y,value,cls='tiny',extra='')=>`<text x="${x}" y="${y}" class="${cls}" ${extra}>${esc(value)}</text>`;
export const box=(x,y,w,h,cls='surface-stroke',extra='')=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" rx="7" class="${cls}" ${extra}/>`;
export const line=(x,y,x2,y2,cls='edge')=>`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
export const arrow=(x,y,x2,y2,cls='accent-line')=>line(x,y,x2,y2,cls)+`<path d="M -6 -4 L 0 0 L -6 4" transform="translate(${x2} ${y2}) rotate(${Math.atan2(y2-y,x2-x)*180/Math.PI})" class="${cls}" fill="none"/>`;
export const circle=(x,y,r,cls='signal-node')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
export function lines(x,y,value,width=38,cls='tiny muted'){let rows=[],row='';for(const word of String(value).split(' ')){if((row+' '+word).length>width){rows.push(row);row=word;}else row+=(row?' ':'')+word;}if(row)rows.push(row);return rows.map((r,i)=>txt(x,y+i*19,r,cls)).join('');}
export const card=(x,y,w,h,title,value,cls='tone-1')=>box(x,y,w,h,cls)+txt(x+14,y+25,title,'node-title')+lines(x+14,y+49,value,Math.floor((w-24)/7),'tiny');
export const bars=(items,{x=45,y=82,w=670,row=58,max=Math.max(1,...items.map(i=>i.value))}={})=>items.map((v,i)=>txt(x,y+i*row,v.label,'tiny muted')+box(x+154,y-17+i*row,Math.max(2,v.value/max*(w-230)),26,`tone-${v.tone||i%4+1}`)+txt(x+w-50,y+2+i*row,v.display??n(v.value),'mono')).join('');
export const axis=(x,y,w,h)=>line(x,y,x,y+h)+line(x,y+h,x+w,y+h);
export const path=(points,cls='curve-line')=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" class="${cls}" fill="none"/>`;
export const metric=(label,value,unit='')=>({label,value,unit});
export function result(svg,metrics,code,readout,data={},focus=[],language='csharp'){return {svg,metrics,code,readout,data,focus,language,trace:[],segments:[]};}
/** Unique model, not a relabelled fallback. The metadata is also used in the lesson's deep dive. */
export function D(lesson,title,category,controls,steps,challenge,why,pitfall,scope,run){
 if(steps.length!==4)throw new Error('Each model has four authored explanatory phases: '+lesson);
 return {id:'lesson-'+lesson,lesson,title,short:title,category,color:{Foundations:'blue',Structure:'indigo',State:'teal',Architecture:'blue',Quality:'teal',Performance:'coral',Platforms:'amber',Motion:'amber'}[category]||'indigo',summary:why.split('. ')[0]+'.',controls,defaults:Object.fromEntries(controls.map(c=>[c.key,c.value])),steps,challenge,why,pitfall,scope,run,sourceTopic:lesson,presets:[['Reset inputs',Object.fromEntries(controls.map(c=>[c.key,c.value]))]]};
}
