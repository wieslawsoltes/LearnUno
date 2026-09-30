import {txt,box,line,arrow,circle,card,lines,bars,axis,path,n,metric,result} from '../lessons/toolkit.mjs';
const short=(s,length=27)=>String(s).length>length?String(s).slice(0,length-1)+'…':String(s);
const chip=(x,y,w,label,tone='tone-1')=>box(x,y,w,31,tone)+txt(x+12,y+21,label,'tiny');
const caption=(value)=>txt(34,28,value,'eyebrow-svg');
const lane=(x,y,w,label,tone)=>box(x,y,w,53,tone)+txt(x+12,y+32,label,'tiny');
const m=(a,b,c)=>[metric(...a),metric(...b),metric(...c)];
const output=(svg,metrics,code,readout,data,focus)=>result(svg,metrics,code,readout,data,focus);
export const renderers={
 'input-contracts':(s,d)=>{
  let g=caption('TEXT → REPRESENTATION → DOMAIN');
  g+=card(34,76,216,105,'Editable text',short(s.raw||'(empty)'),'tone-4');
  g+=arrow(254,128,310,128)+`<path d="M 390 65 L 465 128 L 390 191 L 315 128 Z" class="${d.parsed?'tone-3':'tone-2'}"/>`+txt(390,127,'Int32?','node-title','text-anchor="middle"')+txt(390,151,d.parsed?'parsed':'rejected','tiny','text-anchor="middle"');
  g+=arrow(467,128,525,128)+card(530,76,234,105,'Domain range',`1 ≤ value ≤ ${s.maximum}`,d.accepted?'tone-3':'tone-2');
  g+=box(130,256,540,66,d.accepted?'tone-3':'tone-2')+txt(151,283,d.accepted?'Commit a validated value':'Retain input and explain the rule','node-title')+txt(151,306,d.parsed?`Parsed value: ${d.value}`:'No valid Int32 value exists','tiny');
  return output(g,m(['Parsing',d.parsed?'Success':'Failed'],['Maximum',s.maximum],['Commit',d.accepted?'Allowed':'Blocked']),`var parsed = int.TryParse(text, out var value);\nvar accepted = parsed && value >= 1 && value <= ${s.maximum};`,d.accepted?'Both representation and domain predicates passed.':'An input can fail parsing or be representable but outside the allowed domain.',d,[[34,76,216,105],[315,65,150,126],[530,76,234,105],[130,256,540,66]]);
 },
 'record-identity':(s,d)=>{
  let g=caption('TWO SNAPSHOTS / ONE ENTITY KEY');
  for(const [i,v]of [d.original,d.edited].entries()){const x=55+i*370;g+=box(x,71,315,200,i?'tone-3':'tone-1')+txt(x+19,105,i?'Edited snapshot':'Original snapshot','node-title')+line(x+17,119,x+296,119)+txt(x+19,151,'Id','mono')+chip(x+190,133,88,v.id,'tone-4')+txt(x+19,203,'Title','mono')+txt(x+19,239,short(v.title,30),'tiny');}
  g+=arrow(373,169,420,169)+chip(68,316,279,`Identity equality: ${d.idSame}`,d.idSame?'tone-3':'tone-2')+chip(437,316,281,`Record equality: ${d.recordEqual}`,d.recordEqual?'tone-3':'tone-2');
  return output(g,m(['Stable key',d.idSame?'Same':'Different'],['Title',d.titleSame?'Equal':'Changed'],['Snapshot value',d.recordEqual?'Equal':'Different']),`var edited = original with { Id = ${d.edited.id}, Title = "${s.title.replaceAll('"','\\"')}" };\nvar identity = original.Id == edited.Id;\nvar valueEquality = original == edited;`,'Entity lookup uses its chosen identity contract. Full record equality compares all participating fields.',d,[[55,71,315,200],[425,71,315,200],[68,316,279,31],[437,316,281,31]]);
 },
 'linq-projections':(s,d)=>{
  let g=caption('ENUMERATION IS A MOMENT, NOT A STORED LIST');
  d.items.forEach((v,i)=>{g+=box(43+i*59,64,47,47,v>=s.minimum?'tone-3':'surface-stroke')+txt(66+i*59,94,v,'mono','text-anchor="middle"');});
  g+=txt(404,93,`Where(value ≥ ${s.minimum})`,'mono')+arrow(215,120,215,164);
  g+=lane(43,175,309,'Deferred: '+d.deferred.join(', '),'tone-3')+lane(404,175,349,'Captured: '+d.snapshot.join(', '),'tone-1');
  g+=line(378,140,378,332,'edge dashed')+txt(48,266,'Re-enumerate the current source','tiny muted')+txt(410,266,'ToArray captured original members','tiny muted');
  Array.from({length:s.enumerations},(_,i)=>{g+=circle(62+i*26,314,7,'reference-dot');});
  return output(g,m(['Source items',d.items.length],['Deferred result',d.deferred.length],['Snapshot result',d.snapshot.length]),`var query = items.Where(value => value >= ${s.minimum});\nvar snapshot = query.ToArray();\n${s.append?'items.Add(5);':'// No appended item.'}\nvar current = query.ToArray();`,'Query variables describe work; materialized arrays retain membership from their creation time. Repeated enumeration can repeat work.',d,[[43,64,310,47],[404,64,349,47],[43,175,309,151],[404,175,349,151]]);
 },
 'task-failure':(s,d)=>{
  const p=Math.min(1,s.time/s.duration);let g=caption('AWAIT AN OPERATION / RESTORE INVARIANTS');
  g+=box(64,80,673,61,'surface-stroke')+box(69,86,663*p,49,d.terminal?(s.fail?'tone-2':'tone-3'):'tone-1')+txt(83,118,`${s.time} ms / ${s.duration} ms`,'mono');
  g+=line(218,144,218,190)+arrow(218,189,102,226)+arrow(218,189,357,226);
  g+=card(39,228,279,69,'catch',d.terminal&&s.fail?'Expected fault handled':'No handled fault','tone-2')+card(351,228,226,69,'success',d.terminal&&!s.fail?'Result applied':'No result applied','tone-3');
  g+=arrow(578,263,614,263)+card(619,210,147,110,'finally',d.cleanup?'Re-enable':'Not yet','tone-4');
  return output(g,m(['Status',d.status],['Start action',d.enabled?'Enabled':'Disabled'],['Cleanup',d.cleanup?'Executed':'Pending']),`try { await LoadAsync(token); }\ncatch (ExpectedException error) { ShowError(error); }\nfinally { IsBusy = false; }`,'The expected failure path is separate from success; finally restores the busy-state invariant for either terminal outcome.',d,[[64,80,673,61],[39,228,279,69],[351,228,226,69],[619,210,147,110]]);
 },
 'debounced-input':(s,d)=>{
  const scale=.6;let g=caption('QUIET INTERVAL / CANCEL SUPERSEDED WORK');
  [0,200,400,600,800,1000].forEach(t=>g+=line(92+t*scale,67,92+t*scale,302,'grid-line')+txt(92+t*scale,51,t,'tiny muted','text-anchor="middle"'));
  d.commits.forEach((v,i)=>{const y=86+i*67;g+=circle(92+d.edits[i]*scale,y+18,6)+box(92+d.edits[i]*scale,y,s.delay*scale,35,v.cancelled?'tone-2':'tone-3')+txt(98+d.edits[i]*scale,y+23,['U','Un','Uno'][i],'tiny')+txt(728,y+23,v.cancelled?'cancelled':v.time<=s.time?'accepted':'waiting','tiny','text-anchor="end"');});
  g+=line(92+s.time*scale,62,92+s.time*scale,303,'accent-line')+chip(127,337,507,`Generation ${d.generation} · accepted requests: ${d.accepted.length}`,'tone-1');
  return output(g,m(['Delay',s.delay,'ms'],['Current generation',d.generation],['Accepted',d.accepted.length]),`var generation = ++_generation;\npending?.Cancel();\nawait Task.Delay(${s.delay}, token);\nif (generation != _generation) return;\nawait SearchAsync(query, token);`,'An edit cancels the earlier quiet interval. A generation check separately prevents an obsolete result from being applied.',d,[[92,65,600,41],[92,86,600,171],[92,258,600,46],[127,337,507,31]]);
 },
 'subscription-lifetimes':(s,d)=>{
  let g=caption('AN EXPLICIT SUBSCRIPTION HAS AN EXPLICIT OWNER');
  g+=card(38,59,257,74,'Long-lived source',`${s.pulses} emitted pulses`,'tone-1')+arrow(295,96,409,96,d.registered?'accent-line':'edge dashed')+card(414,59,346,74,'Stored delegate',d.registered?'Handler reachable':'Registration removed',d.registered?'tone-4':'surface-stroke');
  g+=line(585,136,585,181,d.registered?'accent-line':'edge dashed')+card(414,187,346,87,'Owner + captured state',d.retained?'Closed owner still retained':s.ownerClosed?'Owner can be released':'Owner still active',d.retained?'tone-2':'tone-3');
  g+=card(38,192,257,80,'Disposable token',s.disposed?'Dispose called':'Owns removal action',s.disposed?'tone-3':'tone-2')+arrow(166,187,166,139);
  g+=chip(195,330,404,`Deliveries now: ${d.callbacks} · no GC timing claimed`,'tone-3');
  return output(g,m(['Registration',d.registered?'Active':'Removed'],['Callbacks',d.callbacks],['Closed owner retained',d.retained?'Yes':'No']),`IDisposable subscription = source.Subscribe(handler);\n// At the owner boundary:\n${s.disposed?'subscription.Dispose();':'// Token still owns the registration.'}`,'Disposing the token removes the exact stored delegate. Being unreachable is different from proving immediate garbage collection.',d,[[38,59,257,74],[414,59,346,74],[414,187,346,87],[38,192,257,80]]);
 },
 'textbox-editing':(s,d)=>{
  let g=caption('EDITING TEXT / VALIDATION / EXPLICIT COMMIT');
  g+=box(59,71,474,127,'surface-stroke')+txt(80,100,'Task title','node-title')+box(78,120,433,53,'tone-1')+txt(94,153,short(d.draft,44),'mono')+txt(515,222,`${d.length} / ${s.limit} UTF-16 units`,'tiny muted','text-anchor="end"');
  g+=card(563,105,183,85,'Save action',d.valid?'Enabled':'Disabled',d.valid?'tone-3':'tone-2')+arrow(654,196,654,265);
  g+=box(80,277,666,69,'tone-3')+txt(98,302,'COMMITTED VALUE','eyebrow-svg')+txt(98,327,short(d.stored,61),'mono');
  return output(g,m(['Draft length',d.length],['Rule',d.valid?'Valid':'Too short'],['Stored',short(d.stored,22)]),`var title = input.Text.Trim();\nif (title.Length < 3) return;\nsavedTitle = title;`,'MaxLength bounds editing length. Trimming and the save predicate decide acceptance; the saved value changes only on an accepted commit.',d,[[59,71,474,127],[78,120,433,53],[563,105,183,85],[80,277,666,69]]);
 },
 'combobox-keys':(s,d)=>{
  let g=caption('DISPLAY LABELS ARE NOT SELECTION KEYS');
  g=caption('DISPLAY LABELS ARE NOT SELECTION KEYS')+d.options.map((v,i)=>box(46,64+i*73,376,58,v.key===d.key?'tone-3':'surface-stroke')+txt(63,100+i*73,v.label,'node-title')+txt(300,100+i*73,`[${i}] ${v.key}`,'mono')).join('');
  g+=arrow(428,168,475,168)+card(482,113,267,116,s.byKey?'SelectedValue key':'SelectedIndex input',s.byKey?'high':s.index,'tone-4');
  g+=chip(137,322,527,`Resolved key: ${d.key} · current row index: ${d.index}`,'tone-1');
  return output(g,m(['Lookup contract',s.byKey?'Stable key':'Position'],['Selected key',d.key],['Current index',d.index]),`combo.DisplayMemberPath = "Name";\ncombo.SelectedValuePath = "Code";\n${s.byKey?'combo.SelectedValue = "high";':`combo.SelectedIndex = ${s.index};`}`,'Reordering changes position-based selection but does not change the item identified by a stable key.',d,[[46,64,376,204],[482,113,267,116],[137,322,527,31],[46,64+d.index*73,376,58]]);
 },
 'listview-selection':(s,d)=>{
  let g=caption('A SELECTION SET CONTAINS ITEM IDENTITIES');
  [11,22,33].forEach((key,i)=>{const y=65+i*77;g+=box(54,y,365,63,d.selected.includes(i)?'tone-1':'surface-stroke')+box(72,y+19,23,23,d.selected.includes(i)?'tone-3':'surface-stroke')+txt(112,y+39,`Task ${key}`,'node-title');if(d.selected.includes(i))g+=txt(84,y+37,'✓','tiny','text-anchor="middle"');});
  g+=box(470,66,271,218,'tone-3')+txt(489,99,'SelectedItems → IDs','node-title');d.ids.forEach((key,i)=>g+=circle(526+i*110,173,33,'reference-dot')+txt(526+i*110,179,key,'mono','text-anchor="middle"'));
  g+=txt(489,256,`${d.count} independent item${d.count===1?'':'s'}`,'tiny');
  return output(g,m(['Mode',s.mode],['Selected count',d.count],['IDs',d.ids.join(', ')]),`list.SelectionMode = SelectionMode.${s.mode};\nvar ids = list.SelectedItems.Cast<TaskRow>()\n    .Select(item => item.Id).ToArray();`,'Selection belongs to item identity. A selected index is a projection position, not a durable entity identifier.',d,[[54,65,365,63],[54,142,365,140],[470,66,271,218],[489,226,230,38]]);
 },
 'navigationview-shell':(s,d)=>{
  let g=caption('SHELL CHROME IS NOT THE NAVIGATION JOURNAL');g+=box(50,55,698,279,'surface-stroke');
  if(d.position==='Top'){g+=box(62,68,674,52,'tone-4')+chip(79,78,164,'Overview',s.destination==='Overview'?'tone-3':'surface-stroke')+chip(255,78,139,'Tasks',s.destination==='Tasks'?'tone-3':'surface-stroke')+card(82,160,635,138,d.content,'The selected menu identifies intent.','tone-1');}
  else{g+=box(63,70,180,249,'tone-4')+chip(78,99,147,'Overview',s.destination==='Overview'?'tone-3':'surface-stroke')+chip(78,144,147,'Tasks',s.destination==='Tasks'?'tone-3':'surface-stroke')+card(273,117,442,168,d.content,'Content is a separate region.','tone-1');}
  g+=txt(63,369,`Tag → ${d.route} · route/history integration remains explicit`,'mono muted');
  return output(g,m(['Pane',d.position],['Invoked item',d.active],['Route key',d.route]),`shell.PaneDisplayMode = NavigationViewPaneDisplayMode.${s.mode};\nshell.ItemInvoked += (_, e) =>\n    HandleIntent(e.InvokedItemContainer?.Tag);`,'NavigationView supplies interaction chrome and item events. A Frame or navigator must independently own destination history and lifecycle.',d,[[50,55,698,279],d.position==='Top'?[62,68,674,52]:[63,70,180,249],d.position==='Top'?[82,160,635,138]:[273,117,442,168],[63,346,670,30]]);
 },
 'dialog-decisions':(s,d)=>{
  let g=caption('DISMISSAL DOES NOT IMPLY DESTRUCTIVE CONSENT');g+=box(58,55,682,280,'tone-4')+box(201,98,401,199,'surface-stroke')+txt(225,135,'Delete this draft?','node-title')+lines(225,169,'A close action is not a primary-action decision.',46)+chip(225,239,141,'Keep draft','tone-1')+chip(396,239,180,'Delete','tone-2');
  g+=circle(176,188,17,d.accepted?'signal-node':'reference-dot')+txt(66,368,`Decision ${s.decision} → result ${d.result} → ${d.retained?'retain draft':'apply accepted action'}`,'tiny');
  return output(g,m(['Result',d.result],['Accepted',d.accepted?'Yes':'No'],['Draft',d.retained?'Retained':'Delete authorized']),`var result = await dialog.ShowAsync();\nif (result == ContentDialogResult.Primary)\n    ApplyAcceptedDecision();`,'The preview models a decision only. The actual ContentDialog lab sets XamlRoot from the active view and performs no real deletion.',d,[[58,55,682,280],[201,98,401,199],[225,239,351,31],[66,344,670,32]]);
 },
 'autosuggest-search':(s,d)=>{
  let g=caption('SUGGESTIONS AND SUBMISSION ARE DIFFERENT CONTRACTS');g+=box(64,58,352,53,'tone-1')+txt(81,91,short(s.query||'(empty query)',32),'mono')+circle(390,83,8,'reference-dot');
  d.matches.forEach((item,i)=>g+=chip(64,115+i*34,352,item,i===0&&d.chosen?'tone-3':'surface-stroke'));
  g+=card(468,113,274,162,'QuerySubmitted',short(d.result||'(empty)',26),'tone-3')+arrow(421,171,462,171)+txt(485,246,d.chosen?'ChosenSuggestion':'Free query text','tiny muted');
  return output(g,m(['Suggestions',d.matches.length],['Limit',s.limit],['Submission',d.chosen?'Chosen item':'Free text']),`if (e.Reason == AutoSuggestionBoxTextChangeReason.UserInput)\n    box.ItemsSource = Filter(box.Text).Take(${s.limit});\n// QuerySubmitted supplies ChosenSuggestion or QueryText.`,'Changing suggestions must not be mistaken for a fresh user query. Submission may choose an item or carry free text.',d,[[64,58,352,53],[64,115,352,210],[468,113,274,162],[468,235,274,40]]);
 },
 'toolkit-observable':(s,d)=>{
  let g=caption('SETPROPERTY / DEPENDENT PROPERTY NOTIFICATION');g+=card(54,62,267,86,'Count setter',`${s.previous} → ${s.count}`,'tone-1')+arrow(328,102,458,102,d.notify?'accent-line':'edge dashed')+card(466,62,276,86,'Equality guard',d.notify?'Value changed':'No change','tone-3');
  g+=line(189,151,189,190)+card(54,201,267,104,'Count notification',d.notify?'Raised':'Not required','tone-3')+card(466,201,276,104,'Summary notification',s.dependent?d.summary:'Retains '+d.summary,s.dependent?'tone-3':'tone-2')+arrow(326,250,460,250,s.dependent?'accent-line':'edge dashed');
  return output(g,m(['Count',d.count],['Equality guard',d.notify?'Passes change':'Skips change'],['Summary',d.stale?'Stale':'Consistent']),`if (SetProperty(ref _count, value))\n{\n${s.dependent?'    OnPropertyChanged(nameof(Summary));':'    // Missing dependent notification.'}\n}`,'ObservableObject supplies the ordinary notification mechanism. A derived property still needs an explicit notification when its dependencies change.',d,[[54,62,267,86],[466,62,276,86],[54,201,267,104],[466,201,276,104]]);
 },
 'toolkit-commands':(s,d)=>{
  let g=caption('ONE COMMAND INSTANCE / CHANGING AVAILABILITY');g+=box(49,69,686,83,'tone-1')+txt(69,99,'Title input','node-title')+txt(69,127,short(s.title,60),'mono');
  g+=arrow(195,158,195,213)+card(49,218,291,95,'CanExecute rule',`${d.length} ≥ ${s.minimum}: ${d.valid}`,'tone-3');
  g+=arrow(344,264,464,264,s.notify?'accent-line':'edge dashed')+card(470,218,265,95,'Button availability',d.enabled?'Enabled':'Disabled',d.enabled?'tone-3':'tone-2')+txt(385,244,s.notify?'notify':'stale','tiny','text-anchor="middle"');
  return output(g,m(['Trimmed length',d.length],['Predicate',d.valid?'True':'False'],['UI enabled',d.enabled?'Yes':'No']),`Create = new RelayCommand(CreateTask, CanCreate);\n// After Title changes:\n${s.notify?'Create.NotifyCanExecuteChanged();':'// No availability notification.'}`,'A stable ICommand object separates behavior from its invoker. Availability changes must notify the command-bound UI.',d,[[49,69,686,83],[49,218,291,95],[346,229,116,69],[470,218,265,95]]);
 },
 'toolkit-async-command':(s,d)=>{
  const progress=Math.min(1,s.time/s.duration),radius=89,c=2*Math.PI*radius;
  let g=caption('ASYNC COMMAND / RUNNING AND CANCELLATION STATE');g+=`<circle cx="213" cy="195" r="${radius}" fill="none" class="grid-line" stroke-width="14"/><circle cx="213" cy="195" r="${radius}" fill="none" class="accent-line" style="stroke-width:14;stroke-dasharray:${c*progress} ${c};transform:rotate(-90deg);transform-origin:213px 195px"/>`+txt(213,191,Math.round(progress*100)+'%','big-metric','text-anchor="middle"')+txt(213,224,d.status,'tiny','text-anchor="middle"');
  g+=lane(399,87,332,'IsRunning: '+d.running,d.running?'tone-1':'surface-stroke')+lane(399,171,332,'CanExecute: '+d.canExecute,d.canExecute?'tone-3':'tone-2')+lane(399,255,332,'CanBeCanceled: '+d.canCancel,d.canCancel?'tone-3':'surface-stroke');
  return output(g,m(['Operation',d.status],['Start enabled',d.canExecute?'Yes':'No'],['Cancel enabled',d.canCancel?'Yes':'No']),`Load = new AsyncRelayCommand(LoadAsync);\nawait Task.Delay(${s.duration}, token);\n// Cancel requests cooperative cancellation, not thread abortion.`,'The model shows observed command state, not a runtime scheduler. In the real lab, AsyncRelayCommand owns its execution task and cancellation signal.',d,[[120,102,186,186],[399,87,332,53],[399,171,332,53],[399,255,332,53]]);
 },
 'toolkit-validation':(s,d)=>{
  let g=caption('VALIDATION RESULTS ARE OBSERVABLE PRESENTATION STATE');g+=box(57,69,333,79,'tone-1')+txt(75,101,'Name','node-title')+txt(75,130,short(s.name||'(empty)',32),'mono');
  [['Required',s.name.trim().length>0],['MinLength('+s.minimum+')',s.name.length>=s.minimum]].forEach(([rule,pass],i)=>g+=box(444,59+i*87,293,66,pass?'tone-3':'tone-2')+txt(465,99+i*87,rule+' '+(pass?'✓':'×'),'mono'));
  g+=arrow(227,155,227,241)+box(58,246,679,91,d.shown.length?'tone-2':'tone-3')+txt(79,276,'GetErrors(nameof(Name))','node-title')+txt(79,307,d.shown.join(' • ')||'No displayed errors','tiny');
  return output(g,m(['Rule failures',d.failures.length],['Validation invoked',s.validate?'Yes':'No'],['Displayed errors',d.shown.length]),`SetProperty(ref _name, value, true);\n// Initial field check:\nValidateProperty(Name, nameof(Name));\nvar errors = GetErrors(nameof(Name));`,'The attributes define rules; an actual validation call evaluates them. Do not confuse no displayed errors with proof that an unchecked field is valid.',d,[[57,69,333,79],[444,59,293,153],[58,246,679,91],[58,281,679,55]]);
 },
 'toolkit-messaging':(s,d)=>{
  let g=caption('MESSAGE DELIVERY / EXPLICIT RECIPIENT ACTIVITY');g+=circle(133,196,67,'reference-dot')+txt(133,194,'Sender','node-title','text-anchor="middle"')+txt(133,221,s.messages+' messages','tiny','text-anchor="middle"');
  g+=box(275,67,183,257,'tone-1')+txt(291,103,'Local messenger','node-title')+lines(291,140,short(s.payload,44),19);
  g+=arrow(204,196,269,196);
  d.recipients.forEach((r,i)=>{const y=63+i*100;g+=arrow(463,195,516,y+35,r.active?'accent-line':'edge dashed')+card(522,y,244,72,r.name,r.active?'Receives payload':'Unregistered',r.active?'tone-3':'surface-stroke');});
  return output(g,m(['Active recipients',d.recipients.filter(r=>r.active).length],['Messages',s.messages],['Deliveries',d.delivered]),`messenger.Register<NoticeModel, ValueChangedMessage<string>>(\n    model, static (recipient, message) => recipient.Receive(message.Value));\n// At deactivation: messenger.UnregisterAll(model);`,'Weak references help reachability; they do not define when a still-alive recipient should stop reacting. Use explicit activation and unregistration.',d,[[66,129,134,134],[275,67,183,257],[522,63,244,172],[522,263,244,72]]);
 },
 'mvvm-drafts':(s,d)=>{
  let g=caption('DRAFT TRANSACTION / SAVE OR CANCEL');g+=card(46,63,316,98,'Persisted baseline',d.baseline,'tone-1')+card(438,63,316,98,'Editable draft',short(s.draft,30),'tone-4');
  g+=arrow(598,164,598,217)+chip(510,227,180,s.action,s.action==='Cancel'?'tone-2':'tone-3');
  g+=card(46,245,316,94,'Resulting saved value',short(d.saved,31),'tone-3')+card(438,296,316,66,'Resulting editor',short(d.draft,28),'tone-1');
  g+=line(381,63,381,363,'edge dashed');
  return output(g,m(['CanSave',d.canSave?'Yes':'No'],['CanCancel',d.canCancel?'Yes':'No'],['Selected action',s.action]),`var dirty = Draft != Saved;\nSave = new RelayCommand(CommitDraft, () => dirty && IsValid(Draft));\nCancel = new RelayCommand(RestoreBaseline, () => dirty);`,'Cancel restores the saved baseline. Save commits a validated normalized value; neither action should depend on a visual control instance.',d,[[46,63,316,98],[438,63,316,98],[510,227,180,31],[46,245,708,117]]);
 },
 'frame-parameters':(s,d)=>{
  let g=caption('NAVIGATION DATA IS A CONTRACT AT THE DESTINATION');g+=card(45,54,260,76,'Caller intent',`TaskTarget(${s.id})`,'tone-1')+arrow(310,92,409,92)+box(415,54,333,76,'tone-4')+txt(436,88,'Frame.Navigate','node-title')+txt(436,112,s.navigate?'Requested':'Not requested','tiny');
  g+=arrow(582,135,582,201)+card(415,208,333,124,'OnNavigatedTo',d.display,d.valid?'tone-3':'tone-2')+box(45,224,260,84,'surface-stroke')+txt(62,253,'Expected type','tiny muted')+txt(62,282,'TaskTarget','mono');
  g+=line(310,268,408,268,d.valid?'accent-line':'edge dashed');
  return output(g,m(['Navigation',d.constructed?'Requested':'Idle'],['Parameter contract',d.valid?'Valid':'Rejected'],['Task ID',s.id]),`frame.Navigate(typeof(TaskDetailPage), new TaskTarget(${s.id}));\n// Destination:\nif (e.Parameter is not TaskTarget { Id: > 0 } target)\n    ShowInvalidParameter();`,'Constructing a Page and validating its navigation parameter are separate steps. Stable route data is not the same as passing a live visual tree.',d,[[45,54,260,76],[415,54,333,76],[45,224,260,84],[415,208,333,124]]);
 },
 'frame-history':(s,d)=>{
  let g=caption('FRAME BACK STACK / CURRENT ENTRY / FORWARD ENTRIES');
  for(let i=0;i<s.visits;i++){const x=50+i*106,y=100+(i%2)*20;g+=box(x,y,91,117,i<d.stack.length-1?'tone-1':i===d.stack.length-1?'tone-3':'surface-stroke')+txt(x+12,y+31,'Visit '+(i+1),'node-title')+txt(x+12,y+87,i<d.stack.length-1?'back':i===d.stack.length-1?'current':'forward','tiny');if(i<s.visits-1)g+=arrow(x+93,y+60,x+103,y+60);}
  g+=chip(61,289,269,'CanGoBack: '+(d.backCount>0),'tone-4')+chip(384,289,297,'Current: '+d.current,'tone-3');
  return output(g,m(['Back entries',d.backCount],['Current',d.current],['Forward entries',d.forward.length]),`if (frame.CanGoBack) frame.GoBack();\n// Model: ${d.backCount} earlier entries remain.\n// The browser URL history is a separate integration.`,'A navigation journal represents visited entries and a current position. Page lifecycle, caching, and browser Back integration require additional policies.',d,[[50,100,636,137],[61,289,269,31],[384,289,297,31],[50,75,636,173]]);
 },
 'route-registry':(s,d)=>{
  let g=caption('REGISTERED ROUTES / CONTROLLED DESTINATION RESOLUTION');g+=box(52,70,214,61,'tone-4')+txt(71,108,short(s.route,19),'mono');g+=arrow(269,101,367,101);
  g+=box(374,56,361,152,'surface-stroke')+txt(391,84,'Route registry','node-title');d.routes.forEach((r,i)=>g+=lane(391,98+i*47,326,r+' → '+r+'Page',s.route===r?'tone-3':'tone-1'));
  g+=arrow(555,214,555,267)+card(196,275,540,69,'Resolution result',d.destination,d.known?'tone-3':'tone-2');
  return output(g,m(['Route text',short(s.route,18)],['Registered',d.known?'Yes':'No'],['Destination',d.destination]),`if (!routes.TryGetValue(route, out var pageType))\n    ShowUnknownRoute();\nelse\n    frame.Navigate(pageType);`,'This is a flat allowlisted route registry, not the full Uno.Extensions region system. ViewMap and RouteMap add richer project-level contracts.',d,[[52,70,214,61],[374,56,361,152],[391,98,326,94],[196,275,540,69]]);
 },
 'deep-link-contracts':(s,d)=>{
  let g=caption('AN EXTERNAL LINK IS UNTRUSTED INPUT');g+=box(43,55,715,60,'tone-4')+txt(61,92,short(s.uri,70),'mono');
  [['Scheme',d.scheme],['Host',d.host],['ID contract',d.payload],['No extras',d.extras]].forEach(([name,ok],i)=>{const x=48+i*184;g+=box(x,155,151,72,ok?'tone-3':'tone-2')+txt(x+15,181,name,'node-title')+txt(x+15,208,ok?'accepted':'rejected','tiny');if(i<3)g+=arrow(x+154,191,x+176,191);});
  g+=box(140,279,520,62,d.accepted?'tone-3':'tone-2')+txt(164,317,d.accepted?`Validated local route data: task ${d.id}`:'Do not open a destination','node-title');
  return output(g,m(['Scheme',d.scheme?'Allowed':'Invalid'],['Resource ID',d.payload?d.id:'Invalid'],['Dispatch',d.accepted?'Allowed':'Blocked']),`if (!Uri.TryCreate(text, UriKind.Absolute, out var uri)) return;\n// Validate scheme, host, decoded ID, query and fragment.\n// Parsing is not authorization or OS activation registration.`,'A valid route representation only permits local dispatch. The trusted data service must still authorize the requested resource.',d,[[43,55,715,60],[48,155,335,72],[416,155,335,72],[140,279,520,62]]);
 },
 'navigation-guards':(s,d)=>{
  let g=caption('LEAVING A DIRTY EDITOR IS A DECISION');g+=card(45,79,240,93,'Current editor',s.dirty?'Unsaved changes':'No pending changes',s.dirty?'tone-2':'tone-3');
  g+=arrow(289,125,333,125)+box(340,62,199,235,'tone-4')+txt(357,95,'Guard','node-title')+lines(357,128,d.dialog?'Ask for confirmation':'No confirmation needed',22)+chip(354,227,170,d.decision,d.allowed?'tone-3':'tone-2');
  g+=arrow(543,125,585,125,d.allowed?'accent-line':'edge dashed')+card(593,79,165,144,'Destination',d.destination,d.allowed?'tone-3':'surface-stroke');
  g+=txt(48,349,'The guard must run before the navigation it protects.','tiny muted');
  return output(g,m(['Dirty state',s.dirty?'Yes':'No'],['Decision',d.decision],['May leave',d.allowed?'Yes':'No']),`if (IsDirty && await ConfirmLeaveAsync() != LeaveDecision.Discard)\n    return;\nframe.Navigate(typeof(SummaryPage));`,'Disabling one button only guards that path. A full app must coordinate Back, deep links, document close, and every other exit route.',d,[[45,79,240,93],[340,62,199,235],[354,227,170,31],[593,79,165,144]]);
 },
 'navigation-results':(s,d)=>{
  let g=caption('ONE REQUEST / ONE TERMINAL RESULT');g+=card(39,72,239,78,'Caller','await selection task','tone-1')+arrow(284,111,347,111)+card(354,72,391,78,'TaskCompletionSource',d.accepted?'Accepted result':'Cancelled outcome','tone-3');
  g+=card(39,239,239,74,'First completion',s.first,'tone-3')+card(354,239,188,74,'Later callback',s.second,d.ignored?'tone-2':'surface-stroke')+card(563,239,182,74,'Result value',d.result||'(none)','tone-4');
  g+=arrow(158,233,415,157)+arrow(448,233,448,157,'edge dashed')+line(648,151,648,234);
  return output(g,m(['Accepted',d.accepted?'Yes':'No'],['Later attempt',d.ignored?'Ignored':'Absent'],['Returned value',d.result||'Cancelled']),`var completion = new TaskCompletionSource<SelectionResult>(\n    TaskCreationOptions.RunContinuationsAsynchronously);\ncompletion.TrySetResult(result); // only the first completion wins`,'Capture the request-local completion object. Old callbacks must not complete a newer pending operation stored in a shared field.',d,[[39,72,239,78],[354,72,391,78],[39,239,503,74],[563,239,182,74]]);
 },
 'composition-root':(s,d)=>{
  let g=caption('CONSTRUCTION AT THE EDGE / BEHAVIOR IN THE MODEL');g+=box(33,52,720,79,'tone-4')+txt(52,83,'Composition root','node-title')+txt(52,110,'ServiceCollection → validated ServiceProvider','mono');
  g+=card(47,200,280,91,'IWorkspaceName',d.registered?short(s.name,26):'Missing registration',d.registered?'tone-3':'tone-2')+arrow(182,137,182,193);
  for(let i=0;i<s.resolutions;i++){const x=408+(i%2)*157,y=181+Math.floor(i/2)*76;g+=card(x,y,142,65,'Model '+(i+1),'constructor','tone-1')+arrow(333,244,x-6,y+33,d.valid?'accent-line':'edge dashed');}
  return output(g,m(['Registered service',d.valid?'Present':'Missing'],['Model resolutions',d.models],['Shared instances',d.serviceInstances]),`services.AddSingleton<IWorkspaceName>(name);\nservices.AddTransient<WorkspaceModel>();\n// The model constructor declares IWorkspaceName.`,'The model has a typed dependency. Only the composition root chooses the service implementation and lifetime.',d,[[33,52,720,79],[47,200,280,91],[408,181,301,141],[333,178,415,151]]);
 },
 'scope-ownership':(s,d)=>{
  let g=caption('EXPLICIT CLIENT SCOPES / INSTANCE OWNERSHIP');
  d.ids.forEach((ids,row)=>{const y=60+row*95;g+=box(43,y,711,82,row===0&&s.closeFirst?'tone-2':'surface-stroke')+txt(59,y+26,`Scope ${row+1}${row===0&&s.closeFirst?' · closed':''}`,'node-title');ids.forEach((id,i)=>g+=chip(200+i*124,y+23,110,id,row===0&&s.closeFirst?'surface-stroke':'tone-3'));});
  return output(g,m(['Constructed instances',d.instances],['Disposed by first scope',d.disposed],['Same within scope',d.same?'Yes':'No']),`services.Add${s.lifetime}<EditingSession>();\nusing (var scope = provider.CreateScope())\n{\n    var session = scope.ServiceProvider.GetRequiredService<EditingSession>();\n}`,'Client scopes are explicitly created owner boundaries. Disposing one scope must not invalidate another document’s session.',d,[[43,60,711,82],[200,83,496,31],[43,155,711,82],[43,60,711,Math.min(280,s.scopes*95-13)]]);
 },
 'captive-dependencies':(s,d)=>{
  let g=caption('LIFETIME EDGES / CAPTIVE DEPENDENCY CHECK');
  g+=box(73,64,660,47,'tone-1')+txt(90,94,'Application lifetime','node-title');
  g+=box(73,134,s.consumer==='Singleton'?660:281,56,'tone-4')+txt(90,169,`Consumer: ${s.consumer}`,'mono');
  g+=box(73,217,s.dependency==='Singleton'?660:281,56,'tone-3')+txt(90,252,`Dependency: ${s.dependency}`,'mono')+arrow(279,195,279,212);
  if(d.captive)g+=line(355,246,730,246,'edge dashed');
  g+=chip(139,328,522,d.rejected?'Validation rejected the captive graph':d.captive?'Capture still exists; validation is disabled':'Lifetime relationship accepted',d.captive?'tone-2':'tone-3');
  return output(g,m(['Captive edge',d.captive?'Yes':'No'],['Scope validation',s.validate?'Enabled':'Disabled'],['Graph rejected',d.rejected?'Yes':'No']),`services.Add${s.dependency}<DocumentSession>();\nservices.Add${s.consumer}<WorkspaceConsumer>();\nnew ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = ${s.validate} };`,'Disabling validation removes a diagnostic, not the invalid lifetime edge. Align the consumer lifetime or redesign the operation boundary.',d,[[73,64,660,47],[73,134,660,56],[73,217,660,56],[139,328,522,31]]);
 },
 'service-factories':(s,d)=>{
  let g=caption('TYPED FACTORY / SERVICES PLUS PER-REQUEST DATA');
  g+=card(35,59,282,81,'Provider-owned clock','IReportClock','tone-1')+card(35,243,282,81,'Runtime argument',short(s.title,27),'tone-4');
  g+=arrow(320,99,407,184)+arrow(320,280,407,210)+box(414,158,167,84,'tone-3')+txt(431,190,'Create(title)','node-title')+txt(431,220,'Factory boundary','tiny');
  g+=arrow(584,201,631,201)+box(636,66,119,261,d.leaked?'tone-2':'surface-stroke')+lines(649,103,'Report model',10,'node-title')+lines(649,164,d.disposed?'Disposed by owner':d.owned?'Owned by caller':'No disposal owner',11);
  return output(g,m(['Product owner',d.owned?'Explicit':'Missing'],['Owner closed',s.close?'Yes':'No'],['Cleanup',d.disposed?'Disposed':d.leaked?'Leaked obligation':'Alive']),`public ReportModel Create(string title) =>\n    ActivatorUtilities.CreateInstance<ReportModel>(_services, title);\n// The caller owns a disposable factory product.`,'The factory may resolve services at its construction seam. Product disposal and the lifetimes of injected collaborators remain explicit contracts.',d,[[35,59,282,81],[35,243,282,81],[414,158,167,84],[636,66,119,261]]);
 },
 'service-decorators':(s,d)=>{
  let g=caption('DECORATOR / INNER SERVICE / REQUEST REUSE');
  d.keys.forEach((key,i)=>g+=chip(45,80+i*69,167,'Read '+key,'tone-4')+arrow(217,96+i*69,288,133));
  g+=card(295,65,234,207,'ICatalog decorator',s.recursive?'Incorrect self-resolution':s.cache?'Cache active':'Bypass cache',d.recursive?'tone-2':'tone-1');
  if(d.recursive)g+=`<path d="M 413 277 C 533 354 278 354 363 277" class="accent-line" fill="none"/>`+txt(413,328,'recursive resolution','tiny','text-anchor="middle"');
  else g+=arrow(534,153,581,153)+card(587,85,172,143,'MemoryCatalog',`${d.reads} reads`,'tone-3');
  return output(g,m(['Inner reads',d.reads],['Cache hits',d.hits],['Registration',d.recursive?'Recursive':'Valid']),`services.AddSingleton<MemoryCatalog>();\nservices.AddSingleton<ICatalog>(p =>\n    new CachedCatalog(p.GetRequiredService<${s.recursive?'ICatalog':'MemoryCatalog'}>()));`,'The exposed service factory must resolve an independently registered inner implementation. Cache validity and memory policy are separate production requirements.',d,[[45,80,167,100],[295,65,234,207],[587,85,172,143],[295,278,300,65]]);
 },
 'options-validation':(s,d)=>{
  let g=caption('REGISTER → CONSTRUCT → VALIDATE → CONSUME');g+=card(43,66,212,93,'Configure',`PageSize = ${s.size}`,'tone-1')+arrow(258,112,305,112)+card(311,66,212,93,'IOptions.Value',s.access?'Accessed':'Not accessed','tone-4')+arrow(527,112,574,112,s.access?'accent-line':'edge dashed')+card(580,66,175,93,'Validate',d.valid?'Range valid':'Range invalid',d.valid?'tone-3':'tone-2');
  const x=73+(s.size/220)*650;g+=line(73,219,723,219,'dimension')+box(73+650/220,202,99/220*650,34,'tone-3')+circle(x,219,8)+txt(73,249,'0','tiny muted')+txt(73+100/220*650,249,'100','tiny muted')+txt(723,249,'220','tiny muted','text-anchor="end"');
  g+=lane(82,295,639,d.result,d.valid&&d.constructed?'tone-3':'tone-2');
  return output(g,m(['Configured value',s.size],['Value accessed',s.access?'Yes':'No'],['Validation',d.validated?(d.valid?'Accepted':'Rejected'):'Not run']),`services.AddOptions<PageSettings>()\n .Configure(o => o.PageSize = ${s.size})\n .Validate(o => o.PageSize >= 1 && o.PageSize <= 100);\n${s.access?'var value = provider.GetRequiredService<IOptions<PageSettings>>().Value;':'// Registering is not constructing or validating Value.'}`,'A bare provider does not run a Generic Host startup policy. This experiment evaluates validation only when the effective options value is accessed.',d,[[43,66,212,93],[311,66,212,93],[580,66,175,93],[82,295,639,53]]);
 }
};
