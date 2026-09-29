import hljs from 'highlight.js/lib/core';
import {registerReferenceGrammars, referenceAliases, referenceLanguages} from './reference-grammars.mjs';
import csharp from 'highlight.js/lib/languages/csharp';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import yaml from 'highlight.js/lib/languages/yaml';
import diff from 'highlight.js/lib/languages/diff';
import ini from 'highlight.js/lib/languages/ini';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import fsharp from 'highlight.js/lib/languages/fsharp';
import http from 'highlight.js/lib/languages/http';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import plaintext from 'highlight.js/lib/languages/plaintext';
const grammars={csharp,xml,javascript,typescript,json,css,bash,powershell,yaml,diff,ini,sql,markdown,python,cpp,fsharp,http,dockerfile,plaintext};
for(const [name,grammar] of Object.entries(grammars))hljs.registerLanguage(name,grammar);
hljs.registerLanguage('wgsl',h=>({name:'WGSL',keywords:{keyword:'alias break case const const_assert continue continuing default diagnostic discard else enable false fn for if let loop override requires return struct switch true var while',type:'array atomic bool f16 f32 i32 mat2x2f mat3x3f mat4x4f ptr sampler sampler_comparison texture_2d texture_storage_2d u32 vec2 vec3 vec4',built_in:'abs clamp cos dot floor fract length max min mix normalize pow select sin smoothstep sqrt'},contains:[h.C_LINE_COMMENT_MODE,h.COMMENT('/\\*','\\*/',{contains:['self']}),{className:'meta',begin:/@\w+/},{className:'number',begin:/\b(?:0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)[fhiu]?/i},{className:'title.function',begin:/\b\w+(?=\s*\()/}]}));
registerReferenceGrammars(hljs);
const aliases={...referenceAliases,'cs':'csharp','c#':'csharp','c-sharp':'csharp','xaml':'xml','axaml':'xml','html':'xml','svg':'xml','csproj':'xml','js':'javascript','ts':'typescript','sh':'bash','shell':'bash','shellscript':'bash','console':'bash','ps1':'powershell','ps':'powershell','yml':'yaml','md':'markdown','text':'plaintext','txt':'plaintext','none':'plaintext','c++':'cpp','f#':'fsharp','fs':'fsharp','py':'python'};
export const languages=Object.freeze([...Object.keys(grammars),'wgsl',...referenceLanguages]);
export function languageFor(code,hint=''){
 hint=String(hint).toLowerCase().replace(/^language-/, '').trim();
 if(hint){const canonical=aliases[hint]||hint;return hljs.getLanguage(canonical)?canonical:'plaintext';}
 const s=String(code).trim();
 if(/^<(?:[!?]|[\w:]+[\s/>])/.test(s))return 'xml';
 if(/^[\[{]/.test(s)){try{JSON.parse(s);return 'json';}catch{}}
 if(/(^|\n)\s*(?:dotnet|npm|npx|git|cd|#\!\/.*sh)\b/.test(s))return 'bash';
 if(/(^|\n)\s*(?:using |namespace |public |private |internal |protected |\[RelayCommand)/.test(s))return 'csharp';
 if(/\b(?:import |export |const |let |function |await page\.)/.test(s))return 'javascript';
 if(/@(compute|group|vertex|fragment)\b|\bfn\s+\w+/.test(s))return 'wgsl';
 if(/^\s*(?:name|on|jobs|steps):/m.test(s))return 'yaml';
 return 'csharp';
}
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache=new Map();let cacheSize=0;const LIMIT=1_500_000;
export function colorCode(value,hint=''){
 const code=String(value),language=languageFor(code,hint),key=language+'\0'+code;
 if(code.length>100000)return {html:escape(code),language:'plaintext',reason:'Large source: readable plain text'};
 if(cache.has(key)){const item=cache.get(key);cache.delete(key);cache.set(key,item);return item;}
 let html;try{html=hljs.highlight(code,{language,ignoreIllegals:true}).value;}catch{html=escape(code);}
 const item={html,language};cache.set(key,item);cacheSize+=key.length+html.length;
 while(cache.size>128||cacheSize>LIMIT){const k=cache.keys().next().value;cacheSize-=k.length+cache.get(k).html.length;cache.delete(k);}
 return item;
}
