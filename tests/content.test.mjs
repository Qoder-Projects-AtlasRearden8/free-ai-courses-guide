import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CERTIFICATE_LABELS,
  LEVEL_LABELS,
  getTotals,
  loadContent,
  readJson,
  validateContent,
} from '../scripts/lib.mjs';

const DATA_FILES = [
  'data/catalog.json',
  'data/categories.json',
  'data/learning-paths.json',
  'data/plan.json',
  'data/certificates.json',
];

async function rawContent() {
  const [catalog, categories, paths, plan, certificates] = await Promise.all(
    DATA_FILES.map((file) => readJson(file)),
  );
  return { catalog, categories, paths, plan, certificates };
}

test('the catalog loads and passes validation', async () => {
  const content = await loadContent();
  assert.ok(content.resources.length >= 50);
  assert.ok(content.categories.length >= 5);
  assert.ok(content.paths.length >= 4);
});

test('the edition keeps its promised totals', async () => {
  const content = await loadContent();
  const totals = getTotals(content);
  assert.deepEqual(
    {
      resources: totals.resources,
      courses: totals.courses,
      freeCertificates: totals.freeCertificates,
      paths: totals.paths,
      weeks: totals.weeks,
      tasks: totals.tasks,
    },
    {
      resources: 54,
      courses: 29,
      freeCertificates: 12,
      paths: 4,
      weeks: 12,
      tasks: 37,
    },
  );
});

test('every resource is assigned to exactly one category', async () => {
  const content = await loadContent();
  const assignments = new Map();
  content.categories.forEach((category) => {
    category.resourceIds.forEach((id) => {
      assignments.set(id, (assignments.get(id) || 0) + 1);
    });
  });
  content.resources.forEach((resource) => {
    assert.equal(assignments.get(resource.id), 1, `${resource.id} should appear once`);
    assert.equal(resource.categoryId, content.categories.find((category) => category.resourceIds.includes(resource.id)).id);
  });
  assert.equal(assignments.size, content.resources.length);
});

test('all learning links are official HTTPS sources without tracking', async () => {
  const content = await loadContent();
  const officialHosts = new Set(content.meta.officialHosts);
  content.resources.forEach((resource) => {
    const url = new URL(resource.url);
    assert.equal(url.protocol, 'https:', resource.id);
    assert.ok(officialHosts.has(url.hostname), `${resource.id} uses ${url.hostname}`);
    assert.equal(url.username, '');
    assert.equal(url.password, '');
    for (const key of url.searchParams.keys()) {
      assert.doesNotMatch(key, /^(utm_|gclid|fbclid|ref|affiliate|mc_)/i, resource.id);
    }
  });
});

test('all labels and levels use the published vocabulary', async () => {
  const content = await loadContent();
  content.resources.forEach((resource) => {
    assert.ok(LEVEL_LABELS[resource.level], resource.id);
    assert.ok(Object.hasOwn(CERTIFICATE_LABELS, resource.certificate), resource.id);
    assert.ok(['course', 'guide', 'book', 'channel'].includes(resource.type), resource.id);
  });
});

test('free certificate routes are courses with a real free explanation', async () => {
  const content = await loadContent();
  const freeCourses = content.resources.filter((resource) => resource.certificate === 'free');
  assert.equal(freeCourses.length, 12);
  freeCourses.forEach((resource) => {
    assert.equal(resource.type, 'course', resource.id);
    assert.match(resource.certificateNote, /free/i, resource.id);
    assert.doesNotMatch(resource.certificateNote, /free trial only|credit card required/i, resource.id);
  });
});

test('the four learning paths are coherent and reachable', async () => {
  const content = await loadContent();
  const pathIds = new Set(content.paths.map((path) => path.id));
  assert.deepEqual(
    [...pathIds].sort(),
    ['build-with-ai', 'deep-learning', 'python-and-data', 'understand-ai'],
  );
  const levels = content.paths.map((path) => path.level.toLowerCase()).join(' ');
  assert.match(levels, /beginner/);
  assert.match(levels, /advanced/);

  content.paths.forEach((learningPath) => {
    assert.ok(learningPath.steps.length >= 4, learningPath.id);
    assert.ok(learningPath.project.title.length > 5, learningPath.id);
    const used = new Set(learningPath.steps.flatMap((step) => step.resourceIds));
    assert.ok(used.size >= 4, learningPath.id);
    used.forEach((id) => assert.ok(content.resourceById.has(id), `${learningPath.id}: ${id}`));
  });
});

test('the 12-week plan has unique tasks and valid resource references', async () => {
  const content = await loadContent();
  const weeks = content.plan.phases.flatMap((phase) => phase.weeks);
  const tasks = weeks.flatMap((week) => week.tasks);
  assert.equal(weeks.length, 12);
  assert.equal(tasks.length, 37);
  assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length);
  tasks.forEach((task) => {
    assert.ok(task.label.length > 5, task.id);
    assert.ok(task.detail.length > 20, task.id);
    if (task.resourceId) assert.ok(content.resourceById.has(task.resourceId), task.id);
  });
  content.plan.phases.forEach((phase) => {
    assert.ok(phase.milestone.checks.length >= 2, phase.id);
  });
});

test('every category has substantial framing, resources, and a route', async () => {
  const content = await loadContent();
  content.categories.forEach((category) => {
    assert.ok(category.tagline.length > 20, category.id);
    assert.ok(category.lede.length > 100, category.id);
    assert.ok(category.body.join(' ').length > 300, category.id);
    assert.ok(category.bestFor.length > 40, category.id);
    assert.ok(category.certificateReality.length > 80, category.id);
    assert.ok(category.proof.length > 60, category.id);
    assert.ok(category.resourceIds.length >= 4, category.id);
    assert.ok(category.route.length >= 3, category.id);
    category.route.forEach((id) => assert.ok(category.resourceIds.includes(id), `${category.id}: ${id}`));
  });
});

test('validation rejects an unknown category member', async () => {
  const data = await rawContent();
  data.categories.categories[0].resourceIds.push('not-a-real-resource');
  assert.throws(() => validateContent(data), /unknown resource: not-a-real-resource/);
});

test('validation rejects a resource that is missing from every category', async () => {
  const data = await rawContent();
  const removed = data.categories.categories[0].resourceIds.pop();
  assert.throws(() => validateContent(data), new RegExp(`${removed} is not assigned`));
});

test('validation rejects a tracking parameter and an unofficial host', async () => {
  const tracking = await rawContent();
  tracking.catalog.resources[0].url = `${tracking.catalog.resources[0].url}?utm_source=test`;
  assert.throws(() => validateContent(tracking), /tracking parameter/);

  const unofficial = await rawContent();
  unofficial.catalog.resources[0].url = 'https://example.com/course';
  assert.throws(() => validateContent(unofficial), /outside the official allowlist/);
});

test('validation rejects a duplicate resource URL', async () => {
  const data = await rawContent();
  data.catalog.resources[1].url = data.catalog.resources[0].url;
  assert.throws(() => validateContent(data), /Duplicate resource URL/);
});
