import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
export async function verifyControlEvidence(root,manifest){
 if(manifest.repository!=='unoplatform/uno'||!/^[a-f0-9]{40}$/.test(manifest.revision))throw new Error('Invalid control-study provenance');
 const lessons={};
 for(const [id,selection]of Object.entries(manifest.lessons)){
  const {path:file,start,end}=selection;
  if(!/^src\/[\w./-]+\.(cs|xaml)$/.test(file)||file.split('/').includes('..'))throw new Error('Invalid source path: '+file);
  const source=await readFile(path.join(root,file),'utf8');
  const fileHash=createHash('sha256').update(source).digest('hex');
  if(fileHash!==selection.fileSha256)throw new Error('Source changed: '+file);
  const lines=source.replace(/\r\n/g,'\n').split('\n');
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||end<start||end>lines.length)throw new Error('Invalid source range');
  const code=lines.slice(start-1,end).join('\n');
  if(createHash('sha256').update(code).digest('hex')!==selection.sha256)throw new Error('Excerpt changed: '+id);
  lessons[id]={...selection,code,url:`https://github.com/${manifest.repository}/blob/${manifest.revision}/${file.split('/').map(encodeURIComponent).join('/')}#L${start}-L${end}`};
 }
 return {repository:manifest.repository,revision:manifest.revision,lessons};
}
export async function buildControlStudy(){
 const root=process.env.UNO_SOURCE||'.sources/uno';
 const manifest=JSON.parse(await readFile('site/content/control-study.json','utf8'));
 const lock=JSON.parse(await readFile('sources.lock.json','utf8'));
 if(manifest.revision!==lock.revision)throw new Error('Control-study revision does not match course snapshot');
 const output='dist/control-study';await mkdir(output,{recursive:true});
 if(!existsSync(path.join(root,'src'))){if(process.env.REQUIRE_SOURCES==='1')throw new Error('Pinned control source is required');return 0;}
 const index=await verifyControlEvidence(root,manifest);await writeFile(output+'/index.json',JSON.stringify(index));
 console.log(`Control study: ${Object.keys(index.lessons).length} reviewed and hash-verified source excerpts.`);
 return Object.keys(index.lessons).length;
}
