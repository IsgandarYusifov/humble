import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {normalizeBasePath} from './base-path.mjs';
const root=path.resolve('out');
const routes=['/','/origin/','/creators/','/about/','/data/','/apply/','/404.html'];
const routeFile=route=>path.join(root,route==='/'?'index.html':route.endsWith('/')?route.slice(1)+'index.html':route.slice(1));
const documents=new Map(routes.map(route=>[route,fs.readFileSync(routeFile(route),'utf8')]));
const basePath=normalizeBasePath(documents.get('/').match(/name="humble-base-path" content="([^"]*)"/)?.[1]);
const issues=[];let linkCount=0;
for(const [route,html] of documents){
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(/<dialog\b/.test(html))issues.push(`${route}: application modal remains`);
 for(const match of html.matchAll(/<a([^>]*\bdata-apply\b[^>]*)>/g)){
  const href=match[1].match(/href="([^"]*)"/)?.[1];
  const valid=href==='#application-form'||href===basePath+'/apply/'||['culture','art','agent','product'].some(category=>href===basePath+'/apply/?category='+category);
  if(!valid)issues.push(`${route}: invalid Apply destination`);
 }
 if(route!=='/apply/'&&/<a[^>]*\bdata-apply\b[^>]*href="#application-form"/.test(html))issues.push(`${route}: self Apply anchor outside application page`);
 if(new Set(ids).size!==ids.length)issues.push(`${route}: duplicate IDs`);
 if((html.match(/<h1\b/g)||[]).length!==1)issues.push(`${route}: expected one h1`);
 if(/Chroma|Nexus|chromalabs|nexus_core|7xKX|9yLM/.test(html))issues.push(`${route}: invented launch content`);
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=match[1];if(/^(mailto:|https?:|data:)/.test(value))continue;
  const url=new URL(value,'https://humble.test'+basePath+route);linkCount++;
  if(basePath&&!url.pathname.startsWith(basePath+'/')){issues.push(`${route}: link outside base path ${value}`);continue;}
  const pathname=basePath?url.pathname.slice(basePath.length):url.pathname;
  if(pathname.startsWith('/assets/')){if(!fs.existsSync(path.join(root,pathname.slice(1))))issues.push(`${route}: missing asset ${value}`);continue;}
  const target=documents.get(pathname);
  if(!target){issues.push(`${route}: missing route ${value}`);continue;}
  if(url.hash&&!target.includes(`id="${url.hash.slice(1)}"`))issues.push(`${route}: missing anchor ${value}`);
 }
}
for(const file of ['scripts/base-path.mjs','scripts/build.mjs','scripts/pages.mjs','scripts/preview.mjs','assets/application.js','assets/acid-interactions.js','assets/rupture-scene.js']){
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)issues.push(`${file}: ${result.stderr.trim()}`);
}
if(issues.length){console.error(issues.join('\n'));process.exit(1);}
console.log(`Verified ${documents.size} pages, ${linkCount} local links/assets, page headings/IDs, and source syntax.`);
