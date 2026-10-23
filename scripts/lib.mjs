import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TYPE_ORDER = ['course', 'guide', 'book', 'channel'];
export const TYPE_LABELS = {
  course: 'Course',
  guide: 'Guide',
  book: 'Free book',
  channel: 'YouTube',
};
export const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all: 'All levels',
};
export const CERTIFICATE_LABELS = {
  free: 'Free certificate',
  paid: 'Certificate paid',
  none: 'No certificate',
  varies: 'Certificate varies',
  na: '',
};
export const TIME_BUCKET_LABELS = {
  quick: 'Under 1 hour',
  short: '1–5 hours',
  medium: '6–20 hours',
  long: '20+ hours / multi-week',
  open: 'Reference / ongoing',
};

const REQUIRED_RESOURCE_FIELDS = [
  'id',
  'title',
  'provider',
  'providerGroup',
  'type',
  'url',
  'description',
  'level',
  'time',
  'timeBucket',
  'cost',
  'certificate',
  'certificateNote',
  'format',
  'topics',
  'noCode',
  'featured',
];

const TRACKING_PARAMETERS = ['utm_', 'gclid', 'fbclid', 'ref', 'affiliate', 'mc_cid', 'mc_eid'];

export async function readJson(relativePath) {
  const contents = await readFile(path.join(ROOT, relativePath), 'utf8');
  return JSON.parse(contents);
}

export async function loadContent() {
  const [catalog, categories, paths, plan, certificates] = await Promise.all([
    readJson('data/catalog.json'),
    readJson('data/categories.json'),
    readJson('data/learning-paths.json'),
    readJson('data/plan.json'),
    readJson('data/certificates.json'),
  ]);
  validateContent({ catalog, categories, paths, plan, certificates });

  const categoryByResource = new Map();
  categories.categories.forEach((category) => {
    category.resourceIds.forEach((id) => {
      categoryByResource.set(id, category);
    });
  });
  const resources = catalog.resources.map((resource) => ({
    ...resource,
    categoryId: categoryByResource.get(resource.id).id,
    categoryLabel: categoryByResource.get(resource.id).navLabel,
  }));

  return {
    meta: catalog.meta,
    resources,
    categories: categories.categories,
    categoriesIntro: categories.intro,
    paths: paths.paths,
    pathsIntro: paths.intro,
    plan,
    certificates,
    resourceById: new Map(resources.map((resource) => [resource.id, resource])),
    categoryById: new Map(categories.categories.map((category) => [category.id, category])),
  };
}

export function validateContent({ catalog, categories, paths, plan, certificates }) {
  const errors = [];
  const push = (message) => errors.push(message);

  if (!catalog?.meta || !Array.isArray(catalog.resources)) {
    throw new Error('catalog.json must contain meta and resources.');
  }

  const { meta, resources } = catalog;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.verifiedAt || '')) {
    push('meta.verifiedAt must use YYYY-MM-DD.');
  }
  if (!Array.isArray(meta.officialHosts) || meta.officialHosts.length < 10) {
    push('meta.officialHosts must list the approved official domains.');
  }

  const ids = new Set();
  const urls = new Set();
  const hostAllowlist = new Set(meta.officialHosts || []);

  resources.forEach((resource, index) => {
    const label = resource?.id || `resources[${index}]`;
    REQUIRED_RESOURCE_FIELDS.forEach((field) => {
      if (!(field in (resource || {}))) push(`${label} is missing ${field}.`);
    });
    if (!['course', 'guide', 'book', 'channel'].includes(resource.type)) {
      push(`${label} has an invalid type.`);
    }
    if (!Object.hasOwn(LEVEL_LABELS, resource.level)) {
      push(`${label} has an invalid level.`);
    }
    if (!Object.hasOwn(CERTIFICATE_LABELS, resource.certificate)) {
      push(`${label} has an invalid certificate value.`);
    }
    if (!Object.hasOwn(TIME_BUCKET_LABELS, resource.timeBucket)) {
      push(`${label} has an invalid time bucket.`);
    }
    if (resource.certificate === 'free' && resource.type !== 'course') {
      push(`${label} lists a free certificate but is not a course.`);
    }
    if (!Array.isArray(resource.topics) || resource.topics.length < 2) {
      push(`${label} needs at least two topics.`);
    }
    if (typeof resource.description !== 'string' || resource.description.length < 80) {
      push(`${label} needs a substantive description.`);
    }
    if (typeof resource.title !== 'string' || resource.title.length < 3) {
      push(`${label} needs a title.`);
    }
    if (ids.has(resource.id)) push(`Duplicate resource id: ${resource.id}.`);
    ids.add(resource.id);
    if (urls.has(resource.url)) push(`Duplicate resource URL: ${resource.url}.`);
    urls.add(resource.url);

    let parsed;
    try {
      parsed = new URL(resource.url);
    } catch {
      push(`${label} has an invalid URL.`);
      return;
    }
    if (parsed.protocol !== 'https:') push(`${label} must use HTTPS.`);
    if (parsed.username || parsed.password) push(`${label} must not contain URL credentials.`);
    if (!hostAllowlist.has(parsed.hostname)) {
      push(`${label} uses a domain outside the official allowlist: ${parsed.hostname}.`);
    }
    for (const key of parsed.searchParams.keys()) {
      if (TRACKING_PARAMETERS.some((parameter) => key.toLowerCase().startsWith(parameter))) {
        push(`${label} contains a tracking parameter: ${key}.`);
      }
    }
    if (parsed.hostname === 'github.com' && !parsed.pathname.startsWith('/microsoft/')) {
      push(`${label} uses GitHub but is not a Microsoft-owned repository.`);
    }
    if (parsed.hostname === 'www.youtube.com' && !parsed.pathname.startsWith('/@')) {
      push(`${label} must link to an official YouTube channel handle.`);
    }
    if (resource.certificate === 'free' && !/free/i.test(resource.certificateNote)) {
      push(`${label} should explain how the free certificate works.`);
    }
  });

  if (!Array.isArray(categories?.categories) || categories.categories.length < 4) {
    push('At least four guide categories are required.');
  } else {
    const categoryIds = new Set();
    const assignedResources = new Map();
    categories.categories.forEach((category) => {
      const label = `category ${category.id || '(missing id)'}`;
      ['id', 'number', 'navLabel', 'title', 'level', 'time', 'tagline', 'lede', 'body', 'certificateReality', 'bestFor', 'resourceIds', 'route', 'proof', 'next'].forEach(
        (field) => {
          if (!(field in category)) push(`${label} is missing ${field}.`);
        },
      );
      if (categoryIds.has(category.id)) push(`Duplicate category id: ${category.id}.`);
      categoryIds.add(category.id);
      if (!Array.isArray(category.resourceIds) || category.resourceIds.length < 2) {
        push(`${label} needs at least two resources.`);
        return;
      }
      category.resourceIds.forEach((id) => {
        if (!ids.has(id)) push(`${label} references an unknown resource: ${id}.`);
        if (assignedResources.has(id)) {
          push(`${id} appears in both ${assignedResources.get(id)} and ${category.id}.`);
        }
        assignedResources.set(id, category.id);
      });
      if (new Set(category.resourceIds).size !== category.resourceIds.length) {
        push(`${label} contains duplicate resource IDs.`);
      }
      if (!Array.isArray(category.route) || category.route.length < 3) {
        push(`${label} needs at least three recommended steps.`);
      } else {
        category.route.forEach((id) => {
          if (!category.resourceIds.includes(id)) {
            push(`${label} recommends a resource outside its category: ${id}.`);
          }
        });
      }
      if (!Array.isArray(category.body) || category.body.length < 2) {
        push(`${label} needs substantive guide copy.`);
      }
    });
    resources.forEach((resource) => {
      if (!assignedResources.has(resource.id)) push(`${resource.id} is not assigned to a guide category.`);
    });
    if (!categoryIds.has('access')) push('A certificate/access briefing category is required.');
  }

  const featured = resources.filter((resource) => resource.featured);
  if (featured.length < 3) push('At least three resources must be featured.');

  const freeCertificateResources = resources.filter((resource) => resource.certificate === 'free');
  if (freeCertificateResources.length < 10) {
    push('At least ten free certificate routes are required.');
  }

  const providerGroups = new Set(resources.map((resource) => resource.providerGroup));
  ['Google', 'Microsoft', 'AWS', 'DeepLearning.AI', 'Hugging Face', 'fast.ai', 'Coursera', 'edX', 'Kaggle Learn', 'freeCodeCamp'].forEach(
    (provider) => {
      if (!providerGroups.has(provider)) push(`Missing required provider group: ${provider}.`);
    },
  );

  if (!Array.isArray(paths?.paths) || paths.paths.length < 4) {
    push('At least four learning paths are required.');
  } else {
    const pathIds = new Set();
    const pathLevels = new Set();
    paths.paths.forEach((learningPath) => {
      const label = `path ${learningPath.id}`;
      if (pathIds.has(learningPath.id)) push(`Duplicate path id: ${learningPath.id}.`);
      pathIds.add(learningPath.id);
      pathLevels.add(learningPath.level.toLowerCase());
      if (!Array.isArray(learningPath.steps) || learningPath.steps.length < 4) {
        push(`${label} needs at least four steps.`);
      }
      if (!learningPath.project?.title || !learningPath.project?.description) {
        push(`${label} needs a project and finish line.`);
      }
      learningPath.steps.forEach((step) => {
        if (!Array.isArray(step.resourceIds) || step.resourceIds.length < 1) {
          push(`${label} has a step without resources.`);
        }
        step.resourceIds.forEach((id) => {
          if (!ids.has(id)) push(`${label} references an unknown resource: ${id}.`);
        });
      });
    });
    if (![...pathLevels].some((level) => level.includes('beginner'))) {
      push('Learning paths need a beginner route.');
    }
    if (!pathLevels.has('advanced')) {
      push('Learning paths need an advanced route.');
    }
  }

  const weeks = plan?.phases?.flatMap((phase) => phase.weeks) || [];
  const tasks = weeks.flatMap((week) => week.tasks || []);
  const taskIds = new Set();
  if (plan?.phases?.length !== 3) push('The study plan needs exactly three phases.');
  if (weeks.length !== 12) push('The study plan needs twelve weeks.');
  if (tasks.length < 36) push('The study plan needs at least 36 tasks.');
  weeks.forEach((week, index) => {
    if (week.number !== index + 1) push(`Plan week numbering is broken at week ${week.number}.`);
    if (!week.tasks || week.tasks.length < 3) push(`Week ${week.number} needs at least three tasks.`);
    (week.tasks || []).forEach((task) => {
      if (taskIds.has(task.id)) push(`Duplicate plan task id: ${task.id}.`);
      taskIds.add(task.id);
      if (task.resourceId && !ids.has(task.resourceId)) {
        push(`Plan task ${task.id} references an unknown resource: ${task.resourceId}.`);
      }
    });
    if (!week.outcome) push(`Week ${week.number} needs a finish line.`);
  });
  plan?.phases?.forEach((phase) => {
    if (!phase.milestone?.checks?.length) push(`Phase ${phase.id} needs a milestone checklist.`);
  });

  if (!certificates?.matrix || certificates.matrix.length < 8) {
    push('The certificate matrix needs at least eight providers.');
  }
  const certProviders = new Set((certificates?.matrix || []).map((row) => row.provider));
  ['Google', 'Microsoft', 'AWS', 'DeepLearning.AI', 'Hugging Face', 'fast.ai', 'Coursera', 'edX', 'Kaggle Learn', 'freeCodeCamp'].forEach(
    (provider) => {
      if (!certProviders.has(provider)) push(`Certificate matrix is missing ${provider}.`);
    },
  );

  if (errors.length) {
    throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
  }
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function escapeAttribute(value) {
  return escapeHtml(value);
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll('&', 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function plainTextLength(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length;
}

export function markdownEscape(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('[', '\\[').replaceAll(']', '\\]');
}

export function getTotals(content) {
  const freeCertificates = content.resources.filter((resource) => resource.certificate === 'free');
  return {
    resources: content.resources.length,
    courses: content.resources.filter((resource) => resource.type === 'course').length,
    guides: content.resources.filter((resource) => resource.type === 'guide').length,
    books: content.resources.filter((resource) => resource.type === 'book').length,
    channels: content.resources.filter((resource) => resource.type === 'channel').length,
    freeCertificates: freeCertificates.length,
    paths: content.paths.length,
    weeks: content.plan.phases.flatMap((phase) => phase.weeks).length,
    tasks: content.plan.phases.flatMap((phase) => phase.weeks).flatMap((week) => week.tasks).length,
    providers: new Set(content.resources.map((resource) => resource.providerGroup)).size,
  };
}
