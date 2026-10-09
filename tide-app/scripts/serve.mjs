import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../public/', import.meta.url));
const allowed = new Set(['index.html','styles.css','app.js','model.js','data.csv', 'brand-theme.css', 'logo-maritime.png', 'activity-football.png', 'activity-crab.png', 'header-coast.jpg']);
const mime = { html:'text/html; charset=utf-8', css:'text/css', js:'text/javascript', csv:'text/csv; charset=utf-8', png:'image/png', jpg:'image/jpeg' };
http.createServer(async (req,res) => {
 const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
 if (!allowed.has(name)) { res.writeHead(404); res.end('Not found'); return; }
 try { const data = await readFile(root + name); res.writeHead(200, { 'Content-Type':mime[name.split('.').pop()] }); res.end(data); }
 catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 3133), '127.0.0.1', () => console.log('http://localhost:3133'));

