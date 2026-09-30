import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
export default defineConfig({testDir:'.',testMatch:'inline-input.spec.mjs',workers:1,timeout:180000,retries:0,reporter:[['list'],['json',{outputFile:root+'artifacts/inline/report.json'}]],use:{baseURL:'http://localhost:4187',viewport:{width:1440,height:1000},headless:true},webServer:{command:'node scripts/serve.mjs',cwd:root,url:'http://localhost:4187',env:{PORT:'4187'},reuseExistingServer:false}});
