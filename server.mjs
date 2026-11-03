import { openCatalogue, searchCatalogue } from "./catalogue.mjs";
import { fileURLToPath } from "node:url";
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const assets = new Map([
  ['/pricing.js', ['pricing.js', 'text/javascript']],
  ['/pricing-ui.js', ['pricing-ui.js', 'text/javascript']],
  ['/', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']],
  ['/app.js', ['app.js', 'text/javascript']],
]);

const catalogue = openCatalogue(fileURLToPath(new URL("./catalogue.sqlite", import.meta.url)));

createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (request.method === "GET" && url.pathname === "/api/catalogue") {
    const products = searchCatalogue(catalogue.list(), url.searchParams.get("q") ?? "");
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(products));
    return;
  }
  const asset = assets.get(url.pathname);
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
