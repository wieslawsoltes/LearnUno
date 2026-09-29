import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

/** Public declarations + distinct SamplesApp XAML files, not market-use telemetry. */
export async function scanFeatures(root, lock) {
 const files=[];
 async function walk(dir){for(const e of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.(cs|xaml|md)$/i.test(e.name))files.push(p);}}
 await walk(path.join(root,'src'));await walk(path.join(root,'doc'));
 const declarations=new Map(), samples=new Map(), documents=[];let sampleFiles=0,sourceFiles=0;
 const relative=p=>path.relative(root,p).split(path.sep).join('/');
 function add(map,k,p){if(!map.has(k))map.set(k,new Set());map.get(k).add(p);}
 for(const p of files){
  const rel=relative(p);
  if(rel.endsWith('.md')){documents.push(rel);continue;}
  sourceFiles++;
  if(rel.startsWith('src/Uno.UI/')&&rel.endsWith('.cs')&&!/\/Generated\//.test(rel)){
   const text=await readFile(p,'utf8');
   for(const m of text.matchAll(/\bpublic\s+(?:(?:sealed|abstract|partial|static|new)\s+)*class\s+(\w+)/g))add(declarations,m[1],rel);
  }
  if(rel.startsWith('src/SamplesApp/')&&rel.endsWith('.xaml')){
   sampleFiles++;const text=(await readFile(p,'utf8')).replace(/<!--[\s\S]*?-->/g,'');
   for(const m of text.matchAll(/<(?:[\w]+:)?([A-Z]\w*)(?=\s|\/?>)/g))add(samples,m[1],rel);
  }
 }
 const rows=[];
 for(const [name,paths]of declarations){
  const implementations=[...paths].sort();const used=[...(samples.get(name)||[])].sort();
  if(!used.length&&!implementations.some(p=>p.includes('/Controls/')))continue;
  const docs=documents.filter(p=>path.basename(p,'.md').toLowerCase()===name.toLowerCase()||p.toLowerCase().includes('/'+name.toLowerCase()+'-')).slice(0,3);
  const evidence=await Promise.all(implementations.slice(0,2).map(async p=>({path:p,sha256:createHash('sha256').update(await readFile(path.join(root,p))).digest('hex'),url:`https://github.com/${lock.repository}/blob/${lock.revision}/${p}`})));
  rows.push({name,sampleFiles:used.length,implementationFiles:implementations.length,evidence,samples:used.slice(0,3).map(p=>({path:p,url:`https://github.com/${lock.repository}/blob/${lock.revision}/${p}`})),docs});
 }
 rows.sort((a,b)=>b.sampleFiles-a.sampleFiles||a.name.localeCompare(b.name));
 return {version:1,repository:lock.repository,revision:lock.revision,method:'Public class declarations outside Uno.UI/Generated, matched to distinct SamplesApp XAML files after stripping comments. Lexical scan; presence is not implementation parity. Counts are sample coverage, not application popularity.',sourceFiles,documentationFiles:documents.length,sampleFiles,features:rows};
}
export async function buildFeatureSurvey(){
 const root=process.env.UNO_SOURCE||'.sources/uno',out='dist/feature-map';await mkdir(out,{recursive:true});
 if(!existsSync(path.join(root,'src'))){if(process.env.REQUIRE_SOURCES==='1')throw new Error('Feature inventory needs the pinned Uno src checkout.');await writeFile(out+'/index.json',JSON.stringify({available:false,features:[]}));return;}
 const lock=JSON.parse(await readFile('sources.lock.json','utf8'));const report=await scanFeatures(root,lock);
 await writeFile(out+'/index.json',JSON.stringify({available:true,...report}));
 console.log(`Feature inventory: ${report.features.length} public types, ${report.sampleFiles} sample XAML files, ${report.sourceFiles} source files.`);
 return report;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))await buildFeatureSurvey();
