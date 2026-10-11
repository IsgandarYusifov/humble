import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("out");
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".woff2":"font/woff2", ".json":"application/json", ".png":"image/png", ".svg":"image/svg+xml", ".jpg":"image/jpeg", ".mp4":"video/mp4", ".webm":"video/webm" };
const server = http.createServer((request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    let target = path.resolve(root, "." + pathname);
    if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target) && fs.existsSync(target + ".html")) target += ".html";
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { response.writeHead(404, {"Content-Type":"text/html; charset=utf-8"}); fs.createReadStream(path.join(root,"404.html")).pipe(response); return; }
    response.writeHead(200, { "Content-Type":types[path.extname(target)] || "application/octet-stream", "Cache-Control":"no-cache" });
    fs.createReadStream(target).pipe(response);
  } catch { response.writeHead(400); response.end("Bad request"); }
});
server.listen(3000,"127.0.0.1",() => console.log("Humble preview ready: http://127.0.0.1:3000"));
