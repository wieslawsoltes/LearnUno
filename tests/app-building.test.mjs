import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {lessons,tracks,lessonMap,trackMap,appBuildingTrackIds} from '../site/src/course.mjs';
import {labMap,labForLesson} from '../site/src/atlas/catalog.mjs';
import {scene} from '../site/src/atlas/scenes.mjs';
import {calculations as calc} from '../site/src/atlas/app-building/models.mjs';
import {createProjectFiles} from '../site/src/export.mjs';
import {lessonPackages,runtimePackages} from '../site/src/runtime-dependencies.mjs';
import {renderChapter} from '../site/src/learning/chapters.mjs';
const metadata=JSON.parse(fs.readFileSync('site/content/app-building.json','utf8'));
const original=JSON.parse(fs.readFileSync('tests/fixtures/original-lessons.json','utf8'));
const hash=x=>createHash('sha256').update(x).digest('hex');
const run=(id,patch={})=>{const model=labMap.get(labForLesson({id}));return calc[id]({...model.defaults,...patch});};

test('the original sixty runnable starter and solution contracts are byte-for-byte preserved',()=>{
 assert.equal(original.length,60);
 for(let i=0;i<original.length;i++){
  const old=original[i],current=lessons[i];assert.equal(current.id,old.id);assert.equal(hash(current.code),old.codeHash,old.id);assert.equal(hash(current.solution),old.solutionHash,old.id);
 }
});
test('five additional six-lesson paths have unique stable identities and usable prerequisites',()=>{
 assert.equal(lessons.length,90);assert.equal(tracks.length,15);assert.equal(appBuildingTrackIds.length,5);
 assert.equal(new Set(lessons.map(l=>l.id)).size,90);assert.deepEqual(lessons.map(l=>l.number),Array.from({length:90},(_,i)=>i+1));
 for(const id of appBuildingTrackIds){const track=trackMap.get(id);assert.equal(track.lessons.length,6);assert(track.prerequisites.length>0);for(const p of track.prerequisites){assert.notEqual(id,p);assert(trackMap.has(p));}}
 const visiting=new Set(),done=new Set();function visit(id){assert(!visiting.has(id),'Prerequisite cycle at '+id);if(done.has(id))return;visiting.add(id);for(const p of trackMap.get(id).prerequisites)visit(p);visiting.delete(id);done.add(id);}for(const t of tracks)visit(t.id);
 assert.deepEqual(metadata.newLessons,lessons.slice(60).map(l=>l.id));
});
for(const id of metadata.newLessons)test('app-building lesson is fully authored and linked: '+id,()=>{
 const lesson=lessonMap.get(id),lab=labMap.get(labForLesson(lesson)),chapter=JSON.parse(fs.readFileSync(`site/content/chapters/${id}.json`));
 assert.equal(lesson.introducedIn,'0.4.0');assert.equal(lesson.language,'csharp');assert(lesson.code.includes('public static UIElement Build()'));assert(lesson.quiz.explanation.length>90);assert(chapter.references.length>0);assert(chapter.steps.every(s=>(s.explain+' '+s.worked+' '+s.answer).split(/\s+/).length>=90));
 assert.equal(lab.lesson,id);assert(lesson.prerequisiteLessons.every(p=>lessonMap.has(p)));
 const exportFiles=createProjectFiles(lesson,lesson.solution);
 for(const {name,version}of lessonPackages(lesson))assert(exportFiles['LessonApp.csproj'].includes(`Include="${name}" Version="${version}"`));
 assert.equal(exportFiles['Lesson.cs'],lesson.solution);
});
test('new package contracts match actual runner references and reject injected package names',()=>{
 const project=fs.readFileSync('runtime/LearnUnoRunner.csproj','utf8');
 assert.deepEqual(metadata.runtimePackages,runtimePackages);
 for(const [name,version]of Object.entries(runtimePackages))assert(project.includes(`<PackageReference Include="${name}" Version="${version}" />`));
 assert.throws(()=>lessonPackages({packages:{'malicious" />':'1.0'}}),/Unsupported/);
 assert.throws(()=>lessonPackages({packages:{'CommunityToolkit.Mvvm':'0.0.0'}}),/Unsupported/);
 assert.throws(()=>lessonPackages({packages:[]}),/Invalid/);
 for(const lesson of lessons.slice(0,60))assert.deepEqual(lessonPackages(lesson),[]);
});
test('new ordinary MVVM examples use actual Toolkit implementations, not generated placeholders',()=>{
 for(const l of trackMap.get('mvvm-patterns').lessons){assert(l.code.includes('CommunityToolkit.Mvvm'));assert(!l.code.includes('[ObservableProperty]'));assert(!l.code.includes('[RelayCommand]'));}
 assert(lessonMap.get('toolkit-validation').code.includes('ValidateProperty(Name, nameof(Name))'));
 assert(lessonMap.get('toolkit-messaging').code.includes('new CommunityToolkit.Mvvm.Messaging.WeakReferenceMessenger()'));
 assert(lessonMap.get('toolkit-async-command').code.includes('AsyncRelayCommand'));
 for(const l of trackMap.get('app-composition').lessons)assert(l.code.includes('new ServiceCollection()'));
});
test('input acceptance preserves the difference between parsing and domain validation',()=>{
 for(const raw of ['', 'abc','2147483648','-2147483649'])assert.equal(run('input-contracts',{raw}).parsed,false);
 assert.equal(run('input-contracts',{raw:'0'}).parsed,true);assert.equal(run('input-contracts',{raw:'0'}).accepted,false);
 assert.equal(run('input-contracts',{raw:'8',maximum:8}).accepted,true);assert.equal(run('input-contracts',{raw:'9',maximum:8}).accepted,false);
});
test('record identity and LINQ snapshots respond to value and collection changes',()=>{
 assert.equal(run('record-identity',{sameId:true,title:'Changed'}).recordEqual,false);assert.equal(run('record-identity',{sameId:true,title:'Draft the plan'}).recordEqual,true);
 const data=run('linq-projections',{minimum:3,append:true});assert.deepEqual(data.deferred,[3,4,5]);assert.deepEqual(data.snapshot,[3,4]);
});
test('expected async failures restore availability only after a terminal outcome',()=>{
 assert.equal(run('task-failure',{time:200,duration:500,fail:true}).enabled,false);
 assert.equal(run('task-failure',{time:600,duration:500,fail:true}).status,'Fault handled');
 assert.equal(run('task-failure',{time:600,duration:500,fail:false}).cleanup,true);
});
test('debounce accepts only finished intervals that were not superseded',()=>{
 assert.deepEqual(run('debounced-input',{delay:300,time:800}).accepted,[2]);
 assert.deepEqual(run('debounced-input',{delay:300,time:500}).accepted,[]);
 assert.deepEqual(run('debounced-input',{delay:100,time:800}).accepted,[0,1,2]);
 assert.equal(run('subscription-lifetimes',{disposed:true,pulses:6,ownerClosed:true}).callbacks,0);
 assert.equal(run('subscription-lifetimes',{disposed:false,ownerClosed:true}).retained,true);
});
test('editing, keyed selection and selection-set behavior have independent contracts',()=>{
 assert.equal(run('textbox-editing',{raw:'  x  ',save:true}).stored,'Previously saved');
 assert.equal(run('textbox-editing',{raw:'  abc  ',save:true}).stored,'abc');
 for(const reverse of [true,false])assert.equal(run('combobox-keys',{reverse,byKey:true}).key,'high');
 assert.notEqual(run('combobox-keys',{reverse:true,byKey:false,index:0}).key,run('combobox-keys',{reverse:false,byKey:false,index:0}).key);
 assert.deepEqual(run('listview-selection',{mode:'Multiple',current:1}).ids,[11,22]);assert.deepEqual(run('listview-selection',{mode:'Single',current:1}).ids,[22]);
});
test('dialogs and suggestion acceptance do not turn dismissal into consent',()=>{
 for(const decision of ['Close','Escape','Open'])assert.equal(run('dialog-decisions',{decision}).accepted,false);
 assert.equal(run('dialog-decisions',{decision:'Primary'}).accepted,true);
 assert.equal(run('autosuggest-search',{query:'Combo',accept:true}).result,'ComboBox');
 assert.equal(run('autosuggest-search',{query:'unmatched',accept:true}).chosen,false);
});
test('observable values, command invalidation, async state and validation are distinct',()=>{
 assert.equal(run('toolkit-observable',{previous:0,count:3,dependent:false}).stale,true);
 const c=run('toolkit-commands',{title:'A valid title',notify:false});assert.equal(c.valid,true);assert.equal(c.enabled,false);
 assert.equal(run('toolkit-async-command',{time:350,duration:700,cancel:false}).canExecute,false);
 assert.equal(run('toolkit-async-command',{time:350,duration:700,cancel:true}).status,'Cancelled');
 assert.deepEqual(run('toolkit-validation',{name:'',validate:false}).shown,[]);assert.equal(run('toolkit-validation',{name:'',validate:false}).valid,false);
});
test('messenger activity and draft rollback preserve ownership and baseline',()=>{
 assert.equal(run('toolkit-messaging',{editor:false,statusPanel:false,messages:6}).delivered,0);
 assert.equal(run('toolkit-messaging',{editor:true,statusPanel:true,messages:6}).delivered,12);
 assert.equal(run('mvvm-drafts',{draft:'Edited',action:'Cancel'}).draft,'Original title');
 assert.equal(run('mvvm-drafts',{draft:'  Saved anew  ',action:'Save'}).saved,'Saved anew');
});
test('frame parameters, journal bounds, route registration and external links are validated',()=>{
 assert.equal(run('frame-parameters',{contract:'string'}).valid,false);
 assert.equal(run('frame-history',{visits:2,back:5}).backCount,0);
 assert.equal(run('route-registry',{route:'Arbitrary.Type'}).known,false);
 for(const uri of ['https://task/42','learnuno://admin/42','learnuno://task/0','learnuno://task/42?role=admin','not a URI','learnuno://task/2147483648'])assert.equal(run('deep-link-contracts',{uri}).accepted,false,uri);
 assert.equal(run('deep-link-contracts',{uri:'learnuno://task/84'}).accepted,true);
});
test('navigation guards and request-local completion keep cancellation explicit',()=>{
 assert.equal(run('navigation-guards',{dirty:true,decision:'Stay'}).allowed,false);
 assert.equal(run('navigation-guards',{dirty:false,decision:'Stay'}).allowed,true);
 assert.equal(run('navigation-results',{first:'Cancel',second:'Accept',value:'Design'}).result,null);
 assert.equal(run('navigation-results',{first:'Accept',second:'Cancel',value:'Engineering'}).result,'Engineering');
});
test('DI scope identities and captive graphs honor the selected lifetime',()=>{
 assert.equal(run('scope-ownership',{scopes:3,resolves:4,lifetime:'Scoped'}).instances,3);
 assert.equal(run('scope-ownership',{scopes:3,resolves:4,lifetime:'Transient'}).instances,12);
 const hidden=run('captive-dependencies',{consumer:'Singleton',dependency:'Scoped',validate:false});assert(hidden.captive);assert(!hidden.rejected);
 assert.equal(run('captive-dependencies',{consumer:'Scoped',dependency:'Scoped',validate:true}).captive,false);
});
test('factory product ownership, decorator recursion and lazy options validation stay explicit',()=>{
 assert.equal(run('service-factories',{explicitOwner:false,close:true}).leaked,true);
 assert.equal(run('service-decorators',{recursive:false,cache:true,same:true}).reads,1);
 assert.equal(run('service-decorators',{recursive:false,cache:true,same:false}).reads,2);
 assert.equal(run('service-decorators',{recursive:true}).recursive,true);
 const lazy=run('options-validation',{size:200,access:false});assert(!lazy.valid);assert(!lazy.validated);assert.equal(lazy.result,'Not constructed');
 assert.equal(run('options-validation',{size:50,access:true}).result,'Accepted');
});
test('reader links reject injected protocols while keeping approved primary references',()=>{
 const lesson=lessonMap.get('composition-root');const c=JSON.parse(fs.readFileSync('site/content/chapters/composition-root.json'));
 const lab=labMap.get(labForLesson(lesson));
 const html=renderChapter({...c,revision:'test',readingMinutes:5,documents:[],snippets:[],steps:c.steps.map((s,i)=>({...s,title:lab.steps[i][0]})),references:[{url:'javascript:alert(1)',title:'x'},{url:'https://attacker.invalid/',title:'x'},{url:'https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection',title:'DI guide'}],continueWith:[{id:'"><script>',title:'x'}]},lesson);
 assert(!html.includes('href="javascript:'));assert(!html.includes('attacker.invalid'));assert(html.includes('DI guide'));assert(!html.includes('<script>'));
});


test('new model inputs do not collide with shared atlas state',()=>{
 const reserved=new Set(['revision','trace','status','sequence']);
 for(const id of appBuildingTrackIds)for(const lesson of trackMap.get(id).lessons){
  const lab=labMap.get(labForLesson(lesson));
  for(const c of lab.controls)assert(!reserved.has(c.key),lesson.id+': reserved key '+c.key);
  const state={...lab.defaults,revision:0,trace:[],status:'idle',sequence:0};
  const output=scene(lab,state,0);
  const scan=value=>{if(typeof value==='number')assert(Number.isFinite(value),lesson.id+' nonfinite result');else if(value&&typeof value==='object')Object.values(value).forEach(scan);};
  scan(output.data);scan(output.metrics);
 }
});
test('accepted draft commits and rollback both return to a clean model',()=>{
 for(const state of [{draft:'  Saved anew  ',action:'Save'},{draft:'Edited',action:'Cancel'}]){
  const data=run('mvvm-drafts',state);assert.equal(data.draft,data.saved);assert.equal(data.canSave,false);assert.equal(data.canCancel,false);
 }
});
