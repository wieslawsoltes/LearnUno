import {readFile,writeFile} from 'node:fs/promises';
// One-time, exact-source repair. Each replacement asserts its old input before writing.
const edits={
 'architecture':[['json + "\\nRestored: "','json + "\\\\nRestored: "']],
 'services':[['settings["Theme"]}\\nEnvironment:','settings["Theme"]}\\\\nEnvironment:']],
 'performance':[['Checksum: {sum}\\nComputation','Checksum: {sum}\\\\nComputation'],['seconds\\nExcludes','seconds\\\\nExcludes']],
 'platforms':[['{activation.AppVersion}\\nSchema','{activation.AppVersion}\\\\nSchema'],['{activation.Schema}\\n{activation.Reason}','{activation.Schema}\\\\n{activation.Reason}']]
};
for(const [module,replacements] of Object.entries(edits)){
 const path=`site/src/course/${module}.mjs`;
 let source=await readFile(path,'utf8');
 for(const [before,after] of replacements){
  if(source.includes(after))continue;
  if(source.split(before).length!==2)throw new Error(`Unexpected source in ${path}: ${before}`);
  source=source.replace(before,after);
 }
 await writeFile(path,source);
}
const {lessons}=await import('../site/src/course.mjs');
for(const id of ['persistence','configuration','profiling','wasm-delivery','deployment-lifecycle']){
 const lesson=lessons.find(l=>l.id===id);
 for(const line of lesson.code.split('\n'))if((line.match(/(?<!\\)"/g)||[]).length%2)throw new Error(`Unexpected multiline regular string in ${id}`);
}
console.log('Validated C# string escaping in five lesson starters and their generated solutions.');
