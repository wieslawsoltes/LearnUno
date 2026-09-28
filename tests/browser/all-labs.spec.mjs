import {test,expect} from '@playwright/test';
import {tracks} from '../../site/src/course.mjs';
for(const track of tracks)test(`all starters and solutions execute: ${track.id}`,async({page})=>{
 test.skip(!!process.env.PUBLIC_URL,'Exhaustive lab execution is performed against the exact pre-deployment artifact. Public tests cover representative journeys.');
 test.setTimeout(300000);
 await page.goto('./#/playground/'+track.lessons[0].id);
 await page.evaluate(()=>window.learnUnoLab.start());
 const results=[];
 for(const lesson of track.lessons){
  for(const variant of ['code','solution']){
   const result=await page.evaluate(payload=>window.learnUnoLab.request(payload),{method:'run',language:lesson.language,code:lesson[variant]});
   results.push({id:lesson.id,variant,rendered:result.rendered,engine:result.engine,text:result.text,diagnostics:result.diagnostics});
   expect.soft(result.rendered,`${lesson.id}/${variant}: ${JSON.stringify(result.diagnostics||result)}`).toBe(true);
  }
 }
 await test.info().attach('runtime-results',{body:JSON.stringify(results,null,2),contentType:'application/json'});
});
