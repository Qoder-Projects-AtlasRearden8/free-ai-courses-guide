import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { ROOT } from './lib.mjs';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function send(res, status, message) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(`${message}\n`);
}

function safePath(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const segments = decoded.split('/').filter(Boolean);
  if (segments.some((segment) => segment.startsWith('.'))) return null;
  const resolved = path.resolve(root, segments.join('/'));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) return null;
  return resolved;
}

async function resolveFile(root, pathname) {
  let filePath = safePath(root, pathname);
  if (!filePath) return null;
  try {
    let info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      info = await stat(filePath);
    }
    if (!info.isFile()) return null;
    return { filePath, size: info.size };
  } catch {
    if (path.extname(filePath) === '') {
      const alternate = `${filePath}.html`;
      try {
        const info = await stat(alternate);
        if (info.isFile()) return { filePath: alternate, size: info.size };
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function createStaticServer({ root = path.join(ROOT, 'site') } = {}) {
  const absoluteRoot = path.resolve(root);
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      send(res, 405, 'Method not allowed');
      return;
    }

    let pathname;
    try {
      pathname = new URL(req.url || '/', 'http://localhost').pathname;
    } catch {
      send(res, 400, 'Bad request');
      return;
    }

    const resolved = await resolveFile(absoluteRoot, pathname);
    if (!resolved) {
      send(res, 404, 'Not found');
      return;
    }

    const extension = path.extname(resolved.filePath).toLowerCase();
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Content-Length': resolved.size,
      'Cache-Control': 'no-cache',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(resolved.filePath)
      .on('error', () => {
        if (!res.headersSent) send(res, 500, 'Unable to read file');
        else res.destroy();
      })
      .pipe(res);
  });
}

export async function startStaticServer({ port = 0, host = '127.0.0.1', root } = {}) {
  const server = createStaticServer({ root });
  server.listen(port, host);
  await once(server, 'listening');
  const address = server.address();
  const url = `http://${host}:${address.port}`;
  return {
    server,
    url,
    close: () =>
      new Promise((resolve, reject) => {
        server.closeAllConnections?.();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number.parseInt(process.env.PORT || '4173', 10);
  const host = process.env.HOST || '127.0.0.1';
  const { url } = await startStaticServer({ port, host });
  console.log(`Serving site/ at ${url}`);
  console.log('Press Ctrl+C to stop.');
  const shutdown = () => process.exit(0);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
