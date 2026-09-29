import {colorCode} from './engine.mjs';
self.onmessage=({data})=>{
 if(!data||!Number.isSafeInteger(data.id)||typeof data.code!=='string')return;
 try{self.postMessage({id:data.id,...colorCode(data.code,data.language)});}
 catch{self.postMessage({id:data.id,error:true});}
};
