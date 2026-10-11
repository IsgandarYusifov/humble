import fs from "node:fs";
import path from "node:path";
import {createHash} from 'node:crypto';
import {pages,renderPage} from './pages.mjs';
import {renderHorizon,withVersionLinks} from './horizon-page.mjs';
import {normalizeBasePath} from './base-path.mjs';
const basePath=normalizeBasePath(process.env.HUMBLE_BASE_PATH);
const assetVersions=new Map();
const versionAssets=html=>html.replace(/\b(href|src|poster)="\/(assets\/[^"?#]+)"/g,(_,attribute,asset)=>{
 if(asset.endsWith('.woff2'))return `${attribute}="/${asset}"`;
 if(!assetVersions.has(asset))assetVersions.set(asset,createHash('sha256').update(fs.readFileSync(path.resolve(asset))).digest('hex').slice(0,12));
 return `${attribute}="/${asset}?v=${assetVersions.get(asset)}"`;
});
const prepare=html=>versionAssets(html).replace('</head>',`<meta name="humble-base-path" content="${basePath}"></head>`).replace(/\b(href|src|poster)="\/(?!\/)([^"]*)"/g,(_,attribute,value)=>`${attribute}="${basePath}/${value}"`);
const workspace = process.cwd();
const output = path.resolve(workspace, "out");
if (path.dirname(output) !== workspace || path.basename(output) !== "out") throw new Error("Output must be this workspace's out directory.");
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw new Error("Refusing to replace a linked output directory.");
if (fs.existsSync(output)) fs.rmSync(output, { recursive: true });
fs.mkdirSync(path.join(output, "assets"), { recursive: true });
const home = fs.readFileSync(path.join(workspace,'index.html'),'utf8');
fs.writeFileSync(path.join(output,'index.html'),prepare(withVersionLinks(home)));
fs.writeFileSync(path.join(output,'.nojekyll'),'');
fs.cpSync(path.join(workspace, "assets"), path.join(output, "assets"), { recursive: true });
for(const page of pages){
 if(!/^(origin|creators|about|data|apply|404)$/.test(page.route))throw Error('Unknown page route');
 const target=page.route==='404'?path.join(output,'404.html'):path.join(output,page.route,'index.html');
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,prepare(withVersionLinks(renderPage(home,page),page.route)));
}
fs.mkdirSync(path.join(output,'v2'),{recursive:true});
fs.writeFileSync(path.join(output,'v2','index.html'),prepare(renderHorizon(home)));
for(const page of pages){
 const target=page.route==='404'?path.join(output,'v2','404.html'):path.join(output,'v2',page.route,'index.html');
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,prepare(renderHorizon(home,page)));
}
console.log('Humble built: two complete design versions, each with home, origin, creators, about, data, apply, and 404.');
