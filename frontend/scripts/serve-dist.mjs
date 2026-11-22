// Serves the production build (with the service worker) on http://localhost:4200 and proxies the backend paths like
// proxy.conf.json does for `ng serve`. Used to check PWA behaviour locally: `npm run build && npm run serve:dist`.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(import.meta.dirname, '..', 'dist', 'kitchen-notebook', 'browser');
const backend = { host: 'localhost', port: 8080 };
const port = 4200;
const proxied = Object.keys(
  JSON.parse(readFileSync(join(import.meta.dirname, '..', 'proxy.conf.json'), 'utf8')),
);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

createServer((req, res) => {
  const path = new URL(req.url, `http://localhost:${port}`).pathname;
  if (proxied.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    const headers = {
      ...req.headers,
      'x-forwarded-host': `localhost:${port}`,
      'x-forwarded-proto': 'http',
      'x-forwarded-port': String(port),
    };
    const upstream = request(
      { ...backend, path: req.url, method: req.method, headers },
      (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      },
    );
    upstream.on('error', () => res.writeHead(502).end());
    req.pipe(upstream);
    return;
  }
  let file = normalize(join(root, path));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, 'index.html');
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
