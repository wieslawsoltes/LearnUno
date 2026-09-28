import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.env.SERVE_ROOT || 'dist');
const types = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.css':'text/css', '.wasm':'application/wasm', '.dll':'application/octet-stream', '.dat':'application/octet-stream', '.svg':'image/svg+xml', '.png':'image/png', '.ttf':'font/ttf' };
http.createServer(async (req,res) => {
  res.setHeader('Access-Control-Allow-Origin','*'); res.setHeader('Cache-Control','no-store');
  try {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const target = (await stat(file)).isDirectory() ? path.join(file,'index.html') : file;
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream'); res.end(await readFile(target));
  } catch { res.writeHead(404).end('Not found'); }
}).listen(Number(process.env.PORT || 4173), '0.0.0.0', () => console.log('LearnUno: http://localhost:' + (process.env.PORT || 4173)));
