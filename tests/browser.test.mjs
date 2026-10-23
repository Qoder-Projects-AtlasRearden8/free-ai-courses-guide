import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import test, { after, before } from 'node:test';
import { chromium } from 'playwright-core';
import { ROOT, loadContent } from '../scripts/lib.mjs';
import { startStaticServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core');
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const ARTIFACTS = path.join(ROOT, 'artifacts');
const PAGES = [
  'index.html',
  'library.html',
  'paths.html',
  'certificates.html',
  'plan.html',
  'about.html',
];

let browser;
let serverInfo;
let baseUrl;
let content;

before(async () => {
  await mkdir(ARTIFACTS, { recursive: true });
  content = await loadContent();
  serverInfo = await startStaticServer({ port: 0 });
  baseUrl = serverInfo.url;
  browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
}, { timeout: 60000 });

after(async () => {
  await browser?.close();
  await serverInfo?.close();
});

async function openPage({ viewport = { width: 1440, height: 1000 }, bypassCSP = false } = {}) {
  const context = await browser.newContext({
    viewport,
    bypassCSP,
    acceptDownloads: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) => {
    errors.push(`requestfailed: ${request.url()} (${request.failure()?.errorText || 'unknown'})`);
  });
  page.on('request', (request) => {
    const url = request.url();
    if (/^https?:/i.test(url) && !url.startsWith(baseUrl)) externalRequests.push(url);
  });
  return { context, page, errors, externalRequests };
}

function assertClean(errors, externalRequests) {
  assert.deepEqual(errors, [], 'the page produced browser errors');
  assert.deepEqual(externalRequests, [], 'the page made an external network request');
}

async function visibleCardCount(page) {
  return page.evaluate(
    () => [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden).length,
  );
}

async function waitForCardCount(page, expected) {
  await page.waitForFunction(
    (count) =>
      [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden).length ===
      count,
    expected,
  );
}

test('the home page renders, navigates, and the skip link works', async () => {
  const { context, page, errors, externalRequests } = await openPage();
  try {
    await page.goto(`${baseUrl}/index.html`);
    await page.waitForLoadState('networkidle');
    assert.match(await page.title(), /Learn AI for Free/);
    await assert.doesNotReject(page.locator('h1').waitFor({ state: 'visible' }));
    assert.equal(await page.locator('.resource-grid--featured [data-resource-card]').count(), 4);

    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), true);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#main');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');

    await page.click('.primary-nav a[href="library.html"]');
    await page.waitForURL(/library\.html$/);
    assert.equal(await page.locator('main h1').innerText(), 'One good next thing.');
    assert.equal(
      await page.getAttribute('a[aria-current="page"]', 'href'),
      'library.html',
    );
    assertClean(errors, externalRequests);
  } finally {
    await context.close();
  }
});

test('library search, category, time, certificate, and type filters work together', async () => {
  const { context, page, errors, externalRequests } = await openPage();
  try {
    await page.goto(`${baseUrl}/library.html`);
    await waitForCardCount(page, content.resources.length);
    assert.equal((await page.locator('[data-resource-card]').count()), content.resources.length);

    await page.fill('#library-search', 'mcp');
    await page.waitForFunction(() => {
      const cards = [...document.querySelectorAll('[data-resource-card]')];
      return cards.some((card) => !card.hidden) && cards.some((card) => card.hidden);
    });
    const searchState = await page.evaluate(() => {
      const visible = [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden);
      return {
        count: visible.length,
        allMatch: visible.every((card) => card.dataset.search.includes('mcp')),
      };
    });
    assert.ok(searchState.count > 0 && searchState.count < content.resources.length);
    assert.equal(searchState.allMatch, true);
    assert.match(
      await page.locator('#results-count').innerText(),
      new RegExp(`Showing \\d+ of ${content.resources.length} resources`),
    );
    await page.click('[data-clear-search]');
    await waitForCardCount(page, content.resources.length);

    await page.selectOption('#category-filter', 'access');
    await waitForCardCount(page, 4);
    assert.equal(
      await page.evaluate(() => [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden).every((card) => card.dataset.category === 'access')),
      true,
    );
    await page.click('.clear-filters');
    await waitForCardCount(page, content.resources.length);

    const quickCount = content.resources.filter((resource) => resource.timeBucket === 'quick').length;
    assert.ok(quickCount > 0);
    await page.selectOption('#time-filter', 'quick');
    await waitForCardCount(page, quickCount);
    assert.equal(
      await page.evaluate(() => [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden).every((card) => card.dataset.timeBucket === 'quick')),
      true,
    );
    await page.click('.clear-filters');
    await waitForCardCount(page, content.resources.length);

    await page.check('#free-cert-filter');
    await waitForCardCount(page, content.resources.filter((resource) => resource.certificate === 'free').length);
    assert.equal(
      await page.evaluate(() => [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden).every((card) => card.dataset.certificate === 'free')),
      true,
    );
    await page.uncheck('#free-cert-filter');
    await waitForCardCount(page, content.resources.length);

    await page.click('[data-type-filter="guide"]');
    await waitForCardCount(page, content.resources.filter((resource) => resource.type === 'guide').length);
    assert.equal(
      await page.evaluate(() => [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden).every((card) => card.dataset.type === 'guide')),
      true,
    );

    await page.fill('#library-search', 'zzzz-not-a-topic');
    await waitForCardCount(page, 0);
    assert.equal(await page.locator('#empty-state').isVisible(), true);
    await page.click('.empty-state [data-clear-filters]');
    await waitForCardCount(page, content.resources.length);
    assert.equal(await page.locator('#empty-state').isVisible(), false);

    assertClean(errors, externalRequests);
  } finally {
    await context.close();
  }
});

test('saved and done marks persist, filter, and update path progress', async () => {
  const { context, page, errors, externalRequests } = await openPage();
  try {
    await page.goto(`${baseUrl}/library.html`);
    await waitForCardCount(page, content.resources.length);
    const card = page.locator('#resource-google-intro-genai');
    await card.locator('[data-save-id]').click();
    await card.locator('[data-done-id]').click();
    assert.equal(await card.locator('[data-save-id]').getAttribute('aria-pressed'), 'true');
    assert.equal(await card.locator('[data-done-id]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-saved-count]').first().innerText(), '1');
    assert.equal(await page.locator('[data-done-count]').first().innerText(), '1');

    await page.click('#saved-filter');
    await waitForCardCount(page, 1);
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('[data-resource-card]')].filter((card) => !card.hidden)[0].dataset.resourceId), 'google-intro-genai');
    await page.click('#done-filter');
    await waitForCardCount(page, 1);
    await page.click('.clear-filters');
    await waitForCardCount(page, content.resources.length);

    await page.reload();
    await waitForCardCount(page, content.resources.length);
    assert.equal(await page.locator('#resource-google-intro-genai [data-save-id]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#resource-google-intro-genai [data-done-id]').getAttribute('aria-pressed'), 'true');

    await page.goto(`${baseUrl}/paths.html`);
    await page.waitForFunction(() => {
      const block = document.querySelector('#understand-ai');
      return block && block.querySelector('[data-path-count]')?.textContent.startsWith('1 of');
    });
    const pathProgress = await page.evaluate(() => {
      const block = document.querySelector('#understand-ai');
      return {
        label: block.querySelector('[data-path-count]').textContent,
        value: block.querySelector('[data-path-bar]').getAttribute('aria-valuenow'),
        total: block.querySelector('[data-path-bar]').getAttribute('aria-valuemax'),
      };
    });
    assert.match(pathProgress.label, /^1 of \d+ resources done$/);
    assert.equal(pathProgress.value, '1');
    assert.ok(Number(pathProgress.total) >= 4);

    assert.deepEqual(
      await page.evaluate(() => JSON.parse(localStorage.getItem('learn-ai-for-free:v1:saved'))),
      ['google-intro-genai'],
    );
    assert.deepEqual(
      await page.evaluate(() => JSON.parse(localStorage.getItem('learn-ai-for-free:v1:done'))),
      ['google-intro-genai'],
    );
    assertClean(errors, externalRequests);
  } finally {
    await context.close();
  }
});

test('the 90-day plan persists checkboxes, exports JSON, and resets safely', async () => {
  const { context, page, errors, externalRequests } = await openPage();
  try {
    await page.goto(`${baseUrl}/plan.html`);
    assert.equal(await page.locator('[data-plan-task]').count(), 37);
    await page.locator('.task-check').nth(0).click();
    await page.locator('.task-check').nth(2).click();
    await page.waitForFunction(
      () => document.querySelector('[data-plan-overall-count]')?.textContent === '2 of 37 tasks done',
    );
    assert.equal(await page.locator('[data-plan-overall-percent]').innerText(), '5%');

    await page.reload();
    assert.equal(await page.locator('[data-plan-task]').nth(0).isChecked(), true);
    assert.equal(await page.locator('[data-plan-task]').nth(2).isChecked(), true);
    assert.equal(await page.locator('[data-plan-overall-count]').innerText(), '2 of 37 tasks done');

    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-plan');
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'learn-ai-for-free-progress.json');
    const downloadPath = await download.path();
    assert.ok(downloadPath, 'the exported progress file should be saved locally');
    const exported = JSON.parse(await readFile(downloadPath, 'utf8'));
    assert.equal(exported.guide, 'Learn AI for Free');
    assert.equal(exported.planTasks.length, 37);
    assert.equal(exported.planTasks.filter((task) => task.done).length, 2);
    assert.ok(Array.isArray(exported.savedResources));

    page.once('dialog', (dialog) => dialog.accept());
    await page.click('#reset-plan');
    await page.waitForFunction(
      () => document.querySelector('[data-plan-overall-count]')?.textContent === '0 of 37 tasks done',
    );
    assert.equal(await page.locator('[data-plan-task]:checked').count(), 0);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('learn-ai-for-free:v1:tasks'))), []);
    assertClean(errors, externalRequests);
  } finally {
    await context.close();
  }
});

test('category deep links and path anchors are stable', async () => {
  const { context, page, errors, externalRequests } = await openPage();
  try {
    await page.goto(`${baseUrl}/library.html?category=llm-agents`);
    const expected = content.categories.find((category) => category.id === 'llm-agents').resourceIds.length;
    await waitForCardCount(page, expected);
    assert.equal(await page.inputValue('#category-filter'), 'llm-agents');

    await page.goto(`${baseUrl}/paths.html#build-with-ai`);
    await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(() => window.location.hash), '#build-with-ai');
    assert.equal(await page.locator('#build-with-ai').isVisible(), true);
    assert.match(await page.locator('#build-with-ai [data-path-count]').innerText(), /^0 of \d+ resources done$/);

    assertClean(errors, externalRequests);
  } finally {
    await context.close();
  }
});

test('mobile navigation opens, closes on Escape, and no page overflows', async () => {
  const { context, page, errors, externalRequests } = await openPage({
    viewport: { width: 390, height: 844 },
  });
  try {
    await page.goto(`${baseUrl}/index.html`);
    const toggle = page.locator('.nav-toggle');
    await toggle.waitFor({ state: 'visible' });
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#primary-nav')).display), 'none');
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector('#primary-nav')).display === 'flex',
    );
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(
      await page.evaluate(() => getComputedStyle(document.querySelector('#primary-nav')).display),
      'none',
    );
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('nav-toggle')), true);

    for (const file of PAGES) {
      await page.goto(`${baseUrl}/${file}`);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => {
        window.scrollTo(window.innerWidth + 100, 0);
        return {
          bodyWidth: document.body.scrollWidth,
          scrollX: window.scrollX,
          viewport: window.innerWidth,
        };
      });
      assert.ok(overflow.bodyWidth <= overflow.viewport + 1, `${file} body overflows horizontally: ${JSON.stringify(overflow)}`);
      assert.equal(overflow.scrollX, 0, `${file} can be scrolled horizontally: ${JSON.stringify(overflow)}`);
    }
    assertClean(errors, externalRequests);
  } finally {
    await context.close();
  }
});

test('every page loads cleanly at desktop width and captures screenshots', async () => {
  for (const file of PAGES) {
    const { context, page, errors, externalRequests } = await openPage();
    try {
      await page.goto(`${baseUrl}/${file}`);
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('main').count(), 1, file);
      const overflow = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      assert.ok(overflow.documentWidth <= overflow.viewport + 1, `${file} overflows on desktop`);
      if (file === 'index.html' || file === 'library.html' || file === 'paths.html' || file === 'plan.html') {
        const name = file.replace('.html', '');
        await page.screenshot({
          path: path.join(ARTIFACTS, `${name}-desktop.png`),
          fullPage: file === 'index.html' || file === 'paths.html',
        });
      }
      assertClean(errors, externalRequests);
    } finally {
      await context.close();
    }
  }
});

test('all pages pass the WCAG 2.1 A/AA automated scan', async () => {
  const axeSource = await readFile(AXE_PATH, 'utf8');
  for (const file of PAGES) {
    const { context, page } = await openPage({ bypassCSP: true });
    try {
      await page.goto(`${baseUrl}/${file}`);
      await page.waitForLoadState('networkidle');
      await page.addScriptTag({ content: axeSource });
      const results = await page.evaluate(async () => {
        const report = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
          resultTypes: ['violations'],
        });
        return report.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.slice(0, 4).map((node) => ({
            target: node.target,
            summary: node.failureSummary,
          })),
        }));
      });
      assert.deepEqual(results, [], `${file} accessibility violations:\n${JSON.stringify(results, null, 2)}`);
    } finally {
      await context.close();
    }
  }
});
