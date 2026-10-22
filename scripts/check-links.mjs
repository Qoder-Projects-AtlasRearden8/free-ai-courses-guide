import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { ROOT } from './lib.mjs';

const execFileAsync = promisify(execFile);
const SITE_DIR = path.join(ROOT, 'site');
const DOCS_DIR = path.join(ROOT, 'docs');
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function collectIds(html) {
  const ids = new Set();
  for (const match of html.matchAll(/(?:^|\s)id\s*=\s*"([^"]+)"/gm)) ids.add(match[1]);
  for (const match of html.matchAll(/(?:^|\s)name\s*=\s*"([^"]+)"/gm)) ids.add(match[1]);
  return ids;
}

function githubSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

function collectMarkdownIds(markdown) {
  const ids = new Set();
  for (const match of markdown.matchAll(/<a\s+(?:id|name)\s*=\s*"([^"]+)"/g)) ids.add(match[1]);
  const seen = new Map();
  for (const match of markdown.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    let slug = githubSlug(match[1]);
    const count = seen.get(slug) || 0;
    seen.set(slug, count + 1);
    if (count) slug = `${slug}-${count}`;
    ids.add(slug);
  }
  return ids;
}

async function mapFiles(directory, extension, idsById) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(extension)) continue;
    const filePath = path.join(directory, entry.name);
    const text = await readFile(filePath, 'utf8');
    idsById.set(filePath, extension === '.html' ? collectIds(text) : collectMarkdownIds(text));
  }
  return idsById;
}

async function collectSiteFiles(directory, files = new Set()) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectSiteFiles(entryPath, files);
    } else if (entry.isFile()) {
      files.add(entryPath);
    }
  }
  return files;
}

function isExternal(target) {
  return /^(?:https?:)?\/\//i.test(target) || /^[a-z][a-z0-9+.-]*:/i.test(target);
}

function resolveLink(fromFile, target, rootDir) {
  const [rawPath, fragment] = target.split('#');
  const withoutQuery = rawPath.split('?')[0];
  const decodedPath = decodeURIComponent(withoutQuery);
  const filePath = decodedPath ? path.resolve(path.dirname(fromFile), decodedPath) : fromFile;
  const relative = path.relative(rootDir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return { error: `escapes ${path.basename(rootDir)}/` };
  }
  return { filePath, fragment: fragment ? decodeURIComponent(fragment) : '' };
}

export async function collectLocalIssues() {
  const issues = [];
  const siteIds = new Map();
  const docIds = new Map();
  await mapFiles(SITE_DIR, '.html', siteIds);
  await mapFiles(DOCS_DIR, '.md', docIds);
  const siteFiles = await collectSiteFiles(SITE_DIR);

  for (const [filePath, ids] of siteIds) {
    const html = await readFile(filePath, 'utf8');
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*"([^"]*)"/g)) {
      const target = decodeEntities(match[1].trim());
      if (!target || target.startsWith('mailto:') || target.startsWith('tel:') || isExternal(target)) {
        continue;
      }
      const resolved = resolveLink(filePath, target, SITE_DIR);
      const shown = `${path.relative(ROOT, filePath)} -> ${target}`;
      if (resolved.error) {
        issues.push(`${shown}: ${resolved.error}`);
        continue;
      }
      if (!siteFiles.has(resolved.filePath)) {
        issues.push(`${shown}: target file does not exist`);
        continue;
      }
      const targetIds = siteIds.get(resolved.filePath);
      if (resolved.fragment && (!targetIds || !targetIds.has(resolved.fragment))) {
        issues.push(`${shown}: missing #${resolved.fragment}`);
      }
    }

    for (const match of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      const target = match[1].trim();
      if (!target || target.startsWith('data:') || isExternal(target)) continue;
      const resolved = resolveLink(filePath, target, SITE_DIR);
      if (!resolved.error && !siteFiles.has(resolved.filePath)) {
        issues.push(`${path.relative(ROOT, filePath)} -> ${target}: missing asset`);
      }
    }
  }

  for (const [filePath, ids] of docIds) {
    const markdown = await readFile(filePath, 'utf8');
    for (const match of markdown.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1].trim();
      if (!target || target.startsWith('mailto:') || target.startsWith('tel:') || isExternal(target)) {
        continue;
      }
      const resolved = resolveLink(filePath, target, DOCS_DIR);
      const shown = `${path.relative(ROOT, filePath)} -> ${target}`;
      if (resolved.error) {
        issues.push(`${shown}: ${resolved.error}`);
        continue;
      }
      const targetIds = docIds.get(resolved.filePath);
      if (!targetIds && path.extname(resolved.filePath) !== '.md') {
        continue;
      }
      if (!targetIds) {
        issues.push(`${shown}: target file does not exist`);
        continue;
      }
      if (resolved.fragment && !targetIds.has(resolved.fragment)) {
        issues.push(`${shown}: missing #${resolved.fragment}`);
      }
    }
  }

  return issues;
}

async function collectExternalUrls() {
  const urls = new Set();
  const sources = ['site', 'docs'];
  for (const directory of sources) {
    const absolute = path.join(ROOT, directory);
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const text = await readFile(path.join(absolute, entry.name), 'utf8');
      for (const match of text.matchAll(/\bhref\s*=\s*"([^"]+)"/g)) {
        if (/^https?:\/\//i.test(match[1])) urls.add(decodeEntities(match[1]));
      }
      for (const match of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) urls.add(match[1]);
    }
  }
  return [...urls].sort();
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithNode(url, timeout) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  await response.body?.cancel();
  return response.status;
}

async function fetchWithCurl(url, timeout) {
  const { stdout } = await execFileAsync(
    'curl',
    [
      '-sS',
      '-L',
      '-o',
      '/dev/null',
      '-w',
      '%{http_code}',
      '--max-time',
      String(Math.ceil(timeout / 1000)),
      '-A',
      USER_AGENT,
      url,
    ],
    { timeout: timeout + 2000 },
  );
  return Number.parseInt(stdout.trim(), 10);
}

async function probe(url, { timeout = 25000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      let status;
      try {
        status = await fetchWithNode(url, timeout);
      } catch (error) {
        if (attempt === 0) throw error;
        status = await fetchWithCurl(url, timeout).catch(() => 0);
      }
      if (status >= 200 && status < 400) return { ok: true, status };
      if (status === 403 || status === 405 || status === 429) {
        const curlStatus = await fetchWithCurl(url, timeout).catch(() => 0);
        if (curlStatus >= 200 && curlStatus < 400) return { ok: true, status: curlStatus };
      }
      lastError = new Error(`HTTP ${status}`);
      if (status < 500 && status !== 429) break;
    } catch (error) {
      lastError = error;
    }
    if (attempt === 0) await delay(800);
  }
  return { ok: false, error: lastError?.message || 'request failed' };
}

export async function checkLinks({ offline = false, concurrency = 5, timeout = 25000 } = {}) {
  const localIssues = await collectLocalIssues();
  const externalUrls = offline ? [] : await collectExternalUrls();
  const results = [];
  if (externalUrls.length) {
    let index = 0;
    const workers = Array.from({ length: Math.min(concurrency, externalUrls.length) }, async () => {
      while (index < externalUrls.length) {
        const current = index;
        index += 1;
        const url = externalUrls[current];
        const result = await probe(url, { timeout });
        results.push({ url, ...result });
        const label = result.ok ? 'OK' : 'FAIL';
        console.log(`${label.padEnd(4)} ${result.ok ? result.status : result.error}  ${url}`);
      }
    });
    await Promise.all(workers);
  }
  results.sort((a, b) => Number(a.ok) - Number(b.ok) || a.url.localeCompare(b.url));
  return { localIssues, externalUrls, results };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const offline = process.argv.includes('--offline');
  const concurrencyArgument = process.argv.find((argument) => argument.startsWith('--concurrency='));
  const concurrency = concurrencyArgument
    ? Number.parseInt(concurrencyArgument.split('=')[1], 10)
    : 5;
  try {
    console.log(offline ? 'Checking local links only.' : 'Checking local and external links.');
    const { localIssues, externalUrls, results } = await checkLinks({
      offline,
      concurrency: Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 5,
    });
    const failures = results.filter((result) => !result.ok);
    console.log('');
    console.log(`Local issues: ${localIssues.length}`);
    localIssues.forEach((issue) => console.log(`  - ${issue}`));
    if (!offline) {
      console.log(`External URLs: ${externalUrls.length}; failures: ${failures.length}`);
    }
    if (localIssues.length || failures.length) {
      process.exitCode = 1;
    } else {
      console.log('All checked links passed.');
    }
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
