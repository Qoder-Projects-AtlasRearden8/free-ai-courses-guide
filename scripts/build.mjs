import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ROOT,
  escapeAttribute,
  escapeHtml,
  getTotals,
  loadContent,
} from './lib.mjs';
import {
  renderCategoryOptions,
  renderCertificateFinePrint,
  renderCertificateMatrix,
  renderFeaturedResources,
  renderFooter,
  renderFreeCertificateRoutes,
  renderHeader,
  renderLibraryCards,
  renderPathQuickNav,
  renderPathTeasers,
  renderPathsPage,
  renderPlanFallback,
  renderPlanFinishLine,
  renderPlanPage,
  renderPlanPreview,
  renderPlanProjects,
  renderPlanRules,
  renderProviderOptions,
  renderSharingExamples,
  renderTypeCounts,
} from './render.mjs';
import { writeDocs } from './docs.mjs';

const SITE_DIR = path.join(ROOT, 'site');
const DOCS_DIR = path.join(ROOT, 'docs');
const TEMPLATE_DIR = path.join(ROOT, 'src', 'site');
const ASSET_DIR = path.join(TEMPLATE_DIR, 'assets');

function applyTokens(template, tokens) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) =>
    Object.hasOwn(tokens, key) ? String(tokens[key]) : match,
  );
}

function assertNoPlaceholders(output, filename) {
  const unresolved = [...new Set(output.match(/\{\{[A-Z0-9_]+\}\}/g) || [])];
  if (unresolved.length) {
    throw new Error(`${filename} has unresolved template tokens: ${unresolved.join(', ')}`);
  }
}

async function readTemplate(name) {
  return readFile(path.join(TEMPLATE_DIR, name), 'utf8');
}

export async function build() {
  const content = await loadContent();
  const totals = getTotals(content);
  const { meta } = content;
  const freeCertificateCount = content.resources.filter(
    (resource) => resource.certificate === 'free',
  ).length;

  const commonTokens = {
    TOTAL_RESOURCES: totals.resources,
    TOTAL_COURSES: totals.courses,
    TOTAL_GUIDES: totals.guides,
    TOTAL_BOOKS: totals.books,
    TOTAL_CHANNELS: totals.channels,
    FREE_CERT_COUNT: freeCertificateCount,
    TOTAL_PATHS: totals.paths,
    TOTAL_TASKS: totals.tasks,
    VERIFIED_LABEL: meta.verifiedLabel,
    HUB_URL: meta.hubUrl,
    SITE_NAME: meta.siteName,
    AUTHOR_ORG: meta.authorOrg,
  };

  const pageDefinitions = [
    {
      key: 'home',
      bodyClass: 'page-home',
      file: 'index.html',
      title: 'Learn AI for Free — A no-hype field guide',
      description:
        'A plain-English guide to legitimate free AI and tech courses, certificates, books, and official channels—with time, level, and honest certificate labels.',
      tokens: {
        FEATURED_CARDS: renderFeaturedResources(content.resources),
        PATH_TEASERS: renderPathTeasers(content.paths),
        PLAN_PREVIEW: renderPlanPreview(content.plan),
      },
    },
    {
      key: 'library',
      bodyClass: 'page-library',
      file: 'library.html',
      title: 'Free AI and Tech Course Library — Learn AI for Free',
      description:
        'Browse 54 official free AI and tech resources by category, level, provider, and certificate status.',
      tokens: {
        TYPE_COUNTS: renderTypeCounts(content.resources),
        CATEGORY_OPTIONS: renderCategoryOptions(content.categories, content.resources),
        PROVIDER_OPTIONS: renderProviderOptions(content.resources),
        LIBRARY_CARDS: renderLibraryCards(content.resources),
      },
    },
    {
      key: 'paths',
      bodyClass: 'page-paths',
      file: 'paths.html',
      title: 'Learning Paths — Learn AI for Free',
      description:
        'Four free AI learning paths with clear levels, time commitments, projects, and certificate realities.',
      tokens: {
        PATHS_INTRO: content.pathsIntro,
        PATH_QUICK_NAV: renderPathQuickNav(content.paths),
        PATHS: renderPathsPage(content),
      },
    },
    {
      key: 'certificates',
      bodyClass: 'page-certificates',
      file: 'certificates.html',
      title: 'Free AI Certificates, Explained — Learn AI for Free',
      description:
        'Which AI courses offer genuinely free certificates? A provider-by-provider guide to free learning, paid certificates, audit limits, and badges.',
      tokens: {
        CERT_HEADLINE: content.certificates.headline,
        CERT_INTRO: content.certificates.intro,
        FREE_ROUTE_NOTE: content.certificates.freeRouteNote,
        FREE_CERT_ROUTES: renderFreeCertificateRoutes(content.resources),
        CERT_MATRIX: renderCertificateMatrix(content.certificates.matrix),
        CERT_FINE_PRINT: renderCertificateFinePrint(content.certificates.finePrint),
        SHARING_WARNING: content.certificates.sharingWarning,
        SHARING_EXAMPLES: renderSharingExamples(content.certificates.sharingExamples),
      },
    },
    {
      key: 'plan',
      bodyClass: 'page-plan',
      file: 'plan.html',
      title: 'The 90-Day AI Learning Plan — Learn AI for Free',
      description:
        'A humane 90-day plan for learning AI in short sessions, with 36+ small tasks, three projects, and a fallback for hard weeks.',
      tokens: {
        PLAN_TITLE: content.plan.title,
        PLAN_SUBTITLE: content.plan.subtitle,
        PLAN_TIME_NOTE: content.plan.timeNote,
        PLAN_INTRO: content.plan.intro,
        PLAN_PHASES: renderPlanPage(content),
        PLAN_RULES: renderPlanRules(content.plan),
        PLAN_FALLBACK: renderPlanFallback(content.plan),
        PLAN_PROJECTS: renderPlanProjects(content.plan),
        PLAN_FINISH: renderPlanFinishLine(content.plan),
      },
    },
    {
      key: 'about',
      bodyClass: 'page-about',
      file: 'about.html',
      title: 'About This Guide — Learn AI for Free',
      description:
        'Why this independent free AI learning guide exists, who made it, how resources are selected, and how your privacy is respected.',
      tokens: {},
    },
  ];

  const layout = await readTemplate('layout.html');
  await rm(SITE_DIR, { recursive: true, force: true });
  await rm(DOCS_DIR, { recursive: true, force: true });
  await mkdir(SITE_DIR, { recursive: true });
  await mkdir(DOCS_DIR, { recursive: true });
  await cp(ASSET_DIR, path.join(SITE_DIR, 'assets'), { recursive: true });

  const footer = renderFooter(meta, totals);

  for (const page of pageDefinitions) {
    const template = await readTemplate(page.file);
    const contentHtml = applyTokens(template, { ...commonTokens, ...page.tokens });
    const tokens = {
      ...commonTokens,
      ...page.tokens,
      PAGE_KEY: page.key,
      BODY_CLASS: page.bodyClass,
      PAGE_TITLE: escapeHtml(page.title),
      PAGE_DESCRIPTION: escapeAttribute(page.description),
      HEADER: renderHeader(page.key),
      CONTENT: contentHtml,
      FOOTER: footer,
    };
    const html = applyTokens(layout, tokens).replace(/[ \t]+$/gm, '');
    assertNoPlaceholders(html, page.file);
    await writeFile(path.join(SITE_DIR, page.file), html);
  }

  const docFiles = await writeDocs(content);
  await writeFile(path.join(SITE_DIR, '.nojekyll'), '');

  console.log(
    `Built ${pageDefinitions.length} HTML pages, ${docFiles.length} Markdown guides, and copied site assets.`,
  );
  console.log(
    `${totals.resources} resources · ${freeCertificateCount} free certificate routes · ${totals.tasks} plan tasks`,
  );
  console.log(`Site: ${path.relative(ROOT, SITE_DIR)}/ · Docs: ${path.relative(ROOT, DOCS_DIR)}/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
