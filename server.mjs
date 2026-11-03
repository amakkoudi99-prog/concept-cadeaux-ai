import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']],
  ['/app.js', ['app.js', 'text/javascript']],
]);

createServer(async (request, response) => {
  const asset = assets.get(request.url?.split('?')[0]);
  if (!asset || request.method !== 'GET') {
    response.writeHead(404).end();
    return;
  }
  try {
    const [file, type] = asset;
    const content = await readFile(new URL(`./public/${file}`, import.meta.url));
    response.writeHead(200, {
      'Content-Type': `${type}; charset=utf-8`,
      'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'none'",
      'X-Content-Type-Options': 'nosniff',
    }).end(content);
  } catch {
    response.writeHead(500).end('Impossible de charger la page.');
  }
}).listen(3000, '127.0.0.1', () => console.log('http://127.0.0.1:3000'));
