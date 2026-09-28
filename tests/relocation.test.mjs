import test from 'node:test';
import assert from 'node:assert/strict';
import {relocateConfiguration} from '../scripts/relocate-runtime.mjs';
for(const base of ['https://example.test/','https://example.test/runner/','https://example.test/LearnUno/runner/'])test('Uno dependency relocation under '+base,()=>{
 const config={uno_app_base:'/package_abc',uno_dependencies:['/package_abc/Uno.UI.js','/package_abc/nested/example.js'],environmentVariables:{OTHER:'keep'}};
 relocateConfiguration(config,base+'package_abc/uno-config.js');
 assert.equal(config.uno_dependencies[0],base+'package_abc/Uno.UI.js');
 assert.equal(config.uno_dependencies[1],base+'package_abc/nested/example.js');
 assert.equal(config.environmentVariables.UNO_BOOTSTRAP_WEBAPP_BASE_PATH,new URL(base).pathname);
 assert.equal(config.environmentVariables.UNO_BOOTSTRAP_APP_BASE,'package_abc');
 assert.equal(config.environmentVariables.OTHER,'keep');
});
test('unexpected package dependency is rejected rather than silently rewritten',()=>assert.throws(()=>relocateConfiguration({uno_app_base:'/package',uno_dependencies:['https://other.invalid/script.js']},'https://example.test/package/uno-config.js'),/outside its package/));
