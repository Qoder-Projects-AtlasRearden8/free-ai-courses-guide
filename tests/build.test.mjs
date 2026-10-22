import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test, { before } from 'node:test';
import { build } from '../scripts/build.mjs';
import { collectLocalIssues } from '../scripts/check-links.mjs';
import { ROOT, loadContent } from '../scripts/lib.mjs';

const SITE_DIR = path.join(ROOT, 'site');
const DOCS_DIR = path.join(ROOT, 'docs');
const PAGES = [
  { file: 'index.html', nav: '', heading: 'Learn AI for free.' },
  { file: 'library.html', nav: 'Library', heading: 'One good next thing.' },
  { file: 'paths.html', nav: 'Learning paths', heading: 'A route with a finish line.' },
  { file: 'certificates.html', nav: 'Certificates', heading: 'A certificate can open a door.' },
  { file: 'plan.html', nav: '90-day plan', heading: 'The 90-day plain-English AI plan' },
  { file: 'about.html', nav: 'About', heading: 'AI, explained like' },
];

let content;
let htmlByFile;

before(async () => {
  await build();
  content = await loadContent();
  htmlByFile = new Map();
  for (const page of PAGES) {
    htmlByFile.set(page.file, await readFile(path.join(SITE_DIR, page.file), 'utf8'));
  }
}, { timeout: 60000 });

test('all six pages are generated as complete documents', async () => {
  for (const page of PAGES) {
    const html = htmlByFile.get(page.file);
    assert.match(html, /^<!doctype html>/i, page.file);
    assert.match(html, /<html lang="en">/, page.file);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/, page.file);
    assert.match(html, /<a class="skip-link" href="#main">Skip to content<\/a>/, page.file);
    assert.match(html, /<main id="main" tabindex="-1">/, page.file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.file} needs exactly one h1`);
    assert.ok(html.includes(page.heading), `${page.file} is missing its heading`);
    assert.match(html, /<meta name="description" content="[^"]{80,}">/, page.file);
    assert.match(html, /<link rel="icon" href="assets\/favicon.svg"/, page.file);
    assert.match(html, /<script src="assets\/app.js" defer><\/script>/, page.file);
  }
});

test('pages have no unresolved tokens, template debris, or CSP-breaking inline code', () => {
  for (const [file, html] of htmlByFile) {
    assert.doesNotMatch(html, /\{\{[A-Z0-9_]+\}\}/, file);
    assert.doesNotMatch(html, /(?:\bundefined\b|\bNaN\b)/, file);
    assert.doesNotMatch(html, /style\s*=\s*"/i, `${file} has an inline style attribute`);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i, `${file} has an inline script`);
    assert.doesNotMatch(html, /<iframe\b/i, file);
    assert.doesNotMatch(html, /(googleapis|gstatic|googletagmanager|google-analytics|plausible\.io|hotjar)/i, file);
  }
});

test('navigation marks the current page and uses safe external links', () => {
  for (const page of PAGES) {
    const html = htmlByFile.get(page.file);
    const currentCount = (html.match(/aria-current="page"/g) || []).length;
    if (page.nav) {
      assert.equal(currentCount, 1, `${page.file} should mark one current nav item`);
      assert.match(
        html,
        new RegExp(`<a class="[^"]*is-active[^"]*" href="[^"]+" aria-current="page">${page.nav}</a>`),
        page.file,
      );
    } else {
      assert.equal(currentCount, 0, `${page.file} has no primary nav item`);
    }

    for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(match[0], /rel="noopener noreferrer"/, `${page.file}: ${match[0].slice(0, 90)}`);
    }
    for (const match of html.matchAll(/<button\b[^>]*>/g)) {
      assert.match(match[0], /\btype="(?:button|submit|reset)"/, `${page.file}: ${match[0].slice(0, 90)}`);
    }
    for (const match of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(match[0], /\balt="/, `${page.file}: an image is missing alt text`);
    }
  }
});

test('page ids are unique', () => {
  for (const [file, html] of htmlByFile) {
    const ids = [...html.matchAll(/(?:^|\s)id="([^"]+)"/gm)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file} has duplicate ids`);
  }
});

test('the home page carries the featured shelf and plan preview', () => {
  const html = htmlByFile.get('index.html');
  const featured = content.resources.filter((resource) => resource.featured);
  assert.equal((html.match(/data-resource-card/g) || []).length, featured.length);
  assert.equal((html.match(/class="phase-preview /g) || []).length, 3);
  featured.forEach((resource) => assert.ok(html.includes(resource.title), resource.title));
});

test('the library contains every resource and all category filters', () => {
  const html = htmlByFile.get('library.html');
  assert.equal((html.match(/data-resource-card/g) || []).length, content.resources.length);
  assert.match(html, /<select id="category-filter">/);
  assert.equal((html.match(/<option value="[a-z-]+">/g) || []).length >= content.categories.length, true);
  content.categories.forEach((category) => {
    assert.match(html, new RegExp(`<option value="${category.id}">`), category.navLabel);
  });
  content.resources.forEach((resource) => {
    assert.ok(html.includes(`id="resource-${resource.id}"`), resource.id);
    assert.ok(html.includes(`href="${resource.url}"`), resource.id);
  });
});

test('the paths page exposes all routes and local progress hooks', () => {
  const html = htmlByFile.get('paths.html');
  assert.equal((html.match(/data-path-block/g) || []).length, content.paths.length);
  content.paths.forEach((learningPath) => {
    assert.ok(html.includes(`id="${learningPath.id}"`), learningPath.id);
    assert.ok(html.includes(`data-path-resources="${[...new Set(learningPath.steps.flatMap((step) => step.resourceIds))].join(',')}"`), learningPath.id);
  });
  assert.match(html, /data-path-bar role="progressbar"/);
});

test('the certificate page lists every free route and provider rule', () => {
  const html = htmlByFile.get('certificates.html');
  const freeCourses = content.resources.filter((resource) => resource.certificate === 'free');
  assert.equal((html.match(/class="cert-route"/g) || []).length, freeCourses.length);
  assert.equal((html.match(/<th scope="row">/g) || []).length, content.certificates.matrix.length);
  freeCourses.forEach((resource) => assert.ok(html.includes(resource.title), resource.title));
  assert.match(html, /Coursera replaced full course auditing/);
  assert.match(html, /US\$299 verified certificate/);
});

test('the plan contains 12 weeks, 37 checkboxes, and the reset controls', () => {
  const html = htmlByFile.get('plan.html');
  assert.equal((html.match(/<section class="plan-phase /g) || []).length, 3);
  assert.equal((html.match(/class="plan-week"/g) || []).length, 12);
  assert.equal((html.match(/data-plan-task=/g) || []).length, 37);
  assert.match(html, /id="reset-plan"/);
  assert.match(html, /id="export-plan"/);
  assert.match(html, /role="progressbar" aria-label="Overall plan progress"/);
});

test('local HTML and Markdown links all resolve, including fragments', async () => {
  const issues = await collectLocalIssues();
  assert.deepEqual(issues, []);
});

test('all eleven Markdown guides are generated without template debris', async () => {
  const entries = await readdir(DOCS_DIR, { withFileTypes: true });
  const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'));
  assert.equal(markdownFiles.length, 11);
  let totalWords = 0;
  for (const entry of markdownFiles) {
    const markdown = await readFile(path.join(DOCS_DIR, entry.name), 'utf8');
    assert.match(markdown, /^# .+/m, entry.name);
    assert.doesNotMatch(markdown, /\{\{[A-Z0-9_]+\}\}/, entry.name);
    assert.doesNotMatch(markdown, /(?:\bundefined\b|\bNaN\b)/, entry.name);
    const words = markdown.split(/\s+/).filter(Boolean).length;
    assert.ok(words > 500, `${entry.name} is unexpectedly thin (${words} words)`);
    totalWords += words;
  }
  assert.ok(totalWords > 15000, `the Markdown edition is too thin (${totalWords} words)`);
});

test('the docs index has a real category table and honest certificate framing', async () => {
  const readme = await readFile(path.join(DOCS_DIR, 'README.md'), 'utf8');
  assert.match(readme, /\| # \| Category \| Level \| Time \| What it helps you do \|/);
  assert.match(readme, /\| --- \| --- \| --- \| --- \| --- \|/);
  assert.match(readme, /Twelve links in this guide lead to a free completion certificate or badge/);
  assert.doesNotMatch(readme, /Free lessons\. Lessons are free/);
  assert.match(readme, /not an accredited qualification/);
});

test('category guides contain a table, notes, and honest certificate guidance', async () => {
  for (const category of content.categories.filter((item) => item.id !== 'access')) {
    const file = {
      foundations: '01-foundations.md',
      'coding-data': '02-python-and-data.md',
      'machine-learning': '03-machine-learning.md',
      'llm-agents': '04-llms-agents-and-mcp.md',
      'deep-learning': '05-deep-learning.md',
    }[category.id];
    const markdown = await readFile(path.join(DOCS_DIR, file), 'utf8');
    assert.match(markdown, new RegExp(`^# ${category.number}\\.`), file);
    assert.match(markdown, /## Courses at a glance/, file);
    assert.match(markdown, /## Courses, one by one/, file);
    assert.match(markdown, /## A sensible order/, file);
    assert.match(markdown, /## Certificate reality/, file);
    assert.match(markdown, /## A small proof of work/, file);
    category.resourceIds.forEach((id) => {
      assert.ok(markdown.includes(`(https://`), file);
      assert.ok(markdown.includes(content.resourceById.get(id).title), `${file}: ${id}`);
    });
  }
});

test('the learning-path and plan Markdown keep working anchors and task boxes', async () => {
  const pathsMarkdown = await readFile(path.join(DOCS_DIR, 'learning-paths.md'), 'utf8');
  content.paths.forEach((learningPath) => {
    assert.ok(pathsMarkdown.includes(`<a id="${learningPath.id}"></a>`), learningPath.id);
    assert.ok(pathsMarkdown.includes(`(#${learningPath.id})`), learningPath.id);
  });
  assert.match(pathsMarkdown, /## 04\. Deep learning/);

  const planMarkdown = await readFile(path.join(DOCS_DIR, '90-day-plan.md'), 'utf8');
  assert.equal((planMarkdown.match(/^- \[ \] \*\*/gm) || []).length, 37);
  content.plan.phases.forEach((phase) => assert.ok(planMarkdown.includes(phase.title), phase.id));
});

test('assets are local, self-contained, and reasonably sized', async () => {
  for (const asset of ['styles.css', 'app.js', 'favicon.svg']) {
    const info = await stat(path.join(SITE_DIR, 'assets', asset));
    assert.ok(info.size > 100, asset);
  }
  const css = await readFile(path.join(SITE_DIR, 'assets', 'styles.css'), 'utf8');
  const js = await readFile(path.join(SITE_DIR, 'assets', 'app.js'), 'utf8');
  assert.doesNotMatch(css, /@import\s+url\(\s*['"]?https?:/i);
  assert.doesNotMatch(css, /url\(\s*['"]?https?:/i);
  assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  assert.doesNotMatch(js, /document\.cookie/);
  assert.ok((await stat(path.join(SITE_DIR, '.nojekyll'))).isFile());
});
