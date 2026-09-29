/** Site-wide highlighting, isolated from Monaco and the untrusted Uno iframe. */
export function installCodeColoring(root=document.body){
 const states=new WeakMap(),pending=new Map(),queue=new Set();let worker=null,serial=0,timer=0,disposed=false,inflight=null,watchdog=0;
 function stopWorker(){worker?.terminate();worker=null;clearTimeout(watchdog);inflight=null;pending.clear();}
 function ensureWorker(){if(worker)return true;try{worker=new Worker(new URL('./coloring.worker.js',import.meta.url),{type:'module'});worker.onmessage=receive;worker.onerror=()=>{stopWorker();drain();};return true;}catch{return false;}}
 function receive({data}){const job=pending.get(data.id);pending.delete(data.id);if(inflight===data.id){clearTimeout(watchdog);inflight=null;}if(job&&!data.error&&job.node.isConnected&&job.node.textContent===job.code&&hint(job.node)===job.hint){job.node.innerHTML=data.html;job.node.dataset.colored=data.language;job.node.classList.add('syntax-code');const pre=job.node.parentElement;if(pre?.tagName==='PRE')pre.dataset.codeLanguage=data.language;}
 drain();}
 function hint(node){return node.dataset.language||node.className.match(/\blanguage-([\w#+-]+)/)?.[1]||node.closest('[data-code-language]')?.dataset.codeLanguage||'';}
 function visit(node){if(node.nodeType!==1)return;if(node.matches('code'))queue.add(node);for(const code of node.querySelectorAll('code'))queue.add(code);}
 function scan(records){for(const r of records){const node=r.target.nodeType===3?r.target.parentElement:r.target;if(node?.closest?.('.monaco-editor, .view-lines, [data-no-color]'))continue;if(node?.tagName==='CODE'||node?.closest?.('code'))queue.add(node.closest('code')||node);for(const n of r.addedNodes)visit(n);}clearTimeout(timer);timer=setTimeout(drain,30);}
 function drain(){if(disposed||inflight!==null)return;for(const node of queue){queue.delete(node);if(!node.isConnected||node.closest('.monaco-editor, [data-no-color]'))continue;const code=node.textContent,language=hint(node),key=language+'\0'+code;if(states.get(node)===key)continue;states.set(node,key);if(!code.trim())continue;if(!ensureWorker())return;
 const id=++serial;pending.set(id,{node,code,hint:language});inflight=id;worker.postMessage({id,code,language});watchdog=setTimeout(()=>{node.dataset.colored='plaintext';stopWorker();drain();},1800);return;}}
 const observer=new MutationObserver(scan);observer.observe(root,{childList:true,subtree:true,characterData:true});visit(root);drain();
 return()=>{disposed=true;clearTimeout(timer);stopWorker();queue.clear();observer.disconnect();};
}
