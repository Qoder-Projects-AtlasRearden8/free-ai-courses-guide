import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  CERTIFICATE_LABELS,
  LEVEL_LABELS,
  getTotals,
  markdownEscape,
  ROOT,
} from './lib.mjs';

export const DOC_FILES = {
  foundations: '01-foundations.md',
  'coding-data': '02-python-and-data.md',
  'machine-learning': '03-machine-learning.md',
  'llm-agents': '04-llms-agents-and-mcp.md',
  'deep-learning': '05-deep-learning.md',
};

const PATH_ANCHORS = {
  foundations: 'understand-ai',
  'coding-data': 'python-and-data',
  'machine-learning': 'python-and-data',
  'llm-agents': 'build-with-ai',
  'deep-learning': 'deep-learning',
};

const TYPE_SINGULAR = {
  course: 'Course',
  guide: 'Guide',
  book: 'Book',
  channel: 'YouTube channel',
};

function numberWord(number) {
  return (
    ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'][number] ||
    String(number)
  );
}

function tableCell(value) {
  return markdownEscape(String(value).replace(/\s+/g, ' ').trim());
}

function resourceLink(resource) {
  return `[${resource.title}](${resource.url})`;
}

function certificateShort(resource) {
  if (resource.type !== 'course') return '—';
  const labels = {
    free: '**Free certificate**',
    paid: 'Paid certificate',
    none: 'No certificate',
    varies: 'Certificate varies',
  };
  return labels[resource.certificate] || '—';
}

function certificateLine(resource) {
  if (resource.type !== 'course') return 'Not applicable — not a course.';
  return resource.certificateNote || CERTIFICATE_LABELS[resource.certificate] || 'Not listed';
}

function docFooter(content) {
  return `\n---\n\nVerified ${content.meta.verifiedLabel}. Course access and certificate rules can change; check the provider's page before enrolling. Independent guide by ${content.meta.authorOrg}. Education only—not medical, legal, or financial advice.\n\n[Back to the guide index](README.md)\n`;
}

function categoryResources(content, category) {
  return category.resourceIds.map((id) => content.resourceById.get(id));
}

function coursesTable(resources) {
  const rows = resources
    .filter((resource) => resource.type === 'course')
    .map(
      (resource) =>
        `| ${resourceLink(resource)} | ${tableCell(resource.provider)} | ${tableCell(LEVEL_LABELS[resource.level])} | ${tableCell(resource.time)} | ${tableCell(resource.cost)} | ${certificateShort(resource)} | ${tableCell(resource.topics.join(', '))} |`,
    )
    .join('\n');
  return `| Course | Provider | Level | Time | Cost | Free certificate? | What it covers |
| --- | --- | --- | --- | --- | --- | --- |
${rows}`;
}

function nonCourseSection(resources, type, title) {
  const matches = resources.filter((resource) => resource.type === type);
  if (!matches.length) return '';
  const items = matches
    .map(
      (resource) =>
        `- ${resourceLink(resource)} — ${resource.provider}. ${LEVEL_LABELS[resource.level]}, ${resource.time}. ${resource.description}`,
    )
    .join('\n');
  return `\n## ${title}\n\n${items}\n`;
}

function courseNotes(resources) {
  const courses = resources.filter((resource) => resource.type === 'course');
  return courses
    .map(
      (resource) => `### ${resourceLink(resource)}

**${resource.provider}** · ${LEVEL_LABELS[resource.level]} · ${resource.time} · ${resource.format}

${resource.description}

- **Access:** ${resource.cost}
- **Certificate:** ${certificateLine(resource)}
- **Topics:** ${resource.topics.join(', ')}
`,
    )
    .join('\n');
}

export function renderCategoryDoc(content, category) {
  const resources = categoryResources(content, category);
  const route = category.route
    .map((id) => content.resourceById.get(id))
    .filter(Boolean)
    .map(
      (resource, index) =>
        `${index + 1}. ${resourceLink(resource)} — ${resource.provider}; ${resource.time}; ${LEVEL_LABELS[resource.level]}. ${resource.description}`,
    )
    .join('\n');
  const pathAnchor = PATH_ANCHORS[category.id];
  const pathLink = pathAnchor ? `[the matching learning path](learning-paths.md#${pathAnchor})` : 'the learning paths';

  return `# ${category.number}. ${category.title}

**${category.level} · ${category.time}**

> ${category.tagline}

[Guide home](README.md) · [Certificate guide](certificates.md) · [Learning paths](learning-paths.md) · [Full library](full-library.md)

${category.lede}

${category.body.join('\n\n')}

**Best for:** ${category.bestFor}

## Courses at a glance

${coursesTable(resources)}

Every course above is free to learn in some form, but "free to learn" is not the same as "free certificate." The access and certificate columns are part of the recommendation, not a footnote.

## Courses, one by one

${courseNotes(resources)}
${nonCourseSection(resources, 'book', 'Free books and reference')}${nonCourseSection(resources, 'guide', 'Free guides and access notes')}${nonCourseSection(resources, 'channel', 'Official channels')}
## A sensible order

You do not need every resource. This order keeps the next step small:

${route}

## Certificate reality

${category.certificateReality}

A completion certificate is a record that you finished a defined piece of learning. It is not an accredited degree, a professional license, or proof that you can do the work unsupervised. See [the certificate guide](certificates.md) for the provider-by-provider rules.

## A small proof of work

${category.proof}

## Where next

${category.next} Open ${pathLink} for a longer sequence, or return to [the guide index](README.md) to choose another shelf.
${docFooter(content)}`;
}

export function renderDocsIndex(content) {
  const totals = getTotals(content);
  const categoryRows = content.categories
    .filter((category) => category.id !== 'access')
    .map((category) => {
      const file = DOC_FILES[category.id];
      return `| ${category.number} | [${category.navLabel}](${file}) | ${category.level} | ${category.time} | ${category.tagline} |`;
    })
    .join('\n');
  const freeCourses = content.resources.filter((resource) => resource.certificate === 'free');
  return `# Learn AI for Free

### A no-hype field guide to legitimate free AI and tech courses and certificates.

**${totals.resources} official resources · ${totals.freeCertificates} free certificate routes · ${totals.paths} learning paths · ${totals.weeks}-week plan**

> Start smaller than you think. Make one useful thing. Check the source. Then decide what comes next.

This guide is for adults learning around real life: nurses, writers, small-business owners, career changers, and anyone who wants a plain-English route through AI without being sold a fantasy. Every learning link goes to the provider's own site. Every certificate label separates three different things: **free to learn**, **free certificate**, and **accredited credential**. They are not interchangeable.

Links and certificate rules were last checked **${content.meta.verifiedLabel}**. Provider terms can change, so confirm the details on the course page before you enroll.

## Start here

| If you want to… | Start with | Time | Certificate |
| --- | --- | --- | --- |
| Understand AI without code | [Google's Introduction to Generative AI](${content.resourceById.get('google-intro-genai').url}) | 45 min | Free Google skill badge |
| Think carefully about AI in society | [Elements of AI](${content.resourceById.get('elements-of-ai').url}) | ~30 hours | Certificate €50 |
| Train your first model | [Kaggle's Intro to Machine Learning](${content.resourceById.get('kaggle-intro-machine-learning').url}) | 3 hours | Free Kaggle certificate |
| Write a little Python | [Kaggle's Python course](${content.resourceById.get('kaggle-python').url}) | 5 hours | Free Kaggle certificate |
| Build with LLMs and agents | [Hugging Face's AI Agents Course](${content.resourceById.get('huggingface-agents-course').url}) | 3–4 hours per unit | Free fundamentals and completion certificates |
| Study deep learning seriously | [fast.ai's Practical Deep Learning for Coders](${content.resourceById.get('fastai-practical-deep-learning').url}) | 9 lessons plus practice | No certificate |

If a listed certificate is paid, the course is still useful; the guide simply refuses to call the whole package free.

## The categorized guide

| # | Category | Level | Time | What it helps you do |
| --- | --- | --- | --- | --- |
${categoryRows}

The sixth site category, **Access briefings**, contains short official policy pages rather than courses. Those sources are collected in [the certificate guide](certificates.md).

## Certificates without the marketing gloss

${numberWord(totals.freeCertificates).replace(/^./, (letter) => letter.toUpperCase())} links in this guide lead to a free completion certificate or badge. They come from Kaggle Learn, freeCodeCamp, Google, Hugging Face, and Databricks. A free certificate can be useful evidence of practice, especially during a career change. It is not an accredited qualification, and no certificate promises a job.

The guide labels **paid**, **varies**, and **no certificate** routes too. Start with [Free AI and tech certificates, explained](certificates.md).

Free certificate routes in this edition:

${freeCourses
  .map(
    (resource) =>
      `- ${resourceLink(resource)} — ${resource.provider}; ${resource.time}. ${resource.certificateNote}`,
  )
  .join('\n')}

## Two quieter ways to use the guide

- [Learning paths](learning-paths.md) arrange resources into five routes with a finish line: AI literacy, Python and data, building with LLMs and agents, free AI coding with local models, and deep learning.
- [The 90-day plan](90-day-plan.md) turns the same material into three short sessions a week, with a fallback for hard weeks.

You can also browse [the complete library](full-library.md), read [the certificate map](certificates.md), or check [the sources and method](sources-and-method.md).

## How to read the labels

- **Free:** The provider currently offers the listed learning without payment. An account may be required.
- **Free certificate:** The provider issues a completion certificate or badge without payment, subject to its current requirements.
- **Certificate paid:** Learning access may be free, but the certificate costs money or requires paid membership.
- **Certificate varies:** Rules differ by cohort, access route, or platform; check the current official page.
- **No certificate:** No completion credential is offered for the listed resource.

This guide does not use affiliate links, tracking links, or third-party certificate sellers. No account is needed on this site, and no analytics run here.

## A necessary boundary

Healthcare-related examples are for education only. They are not medical advice, clinical guidance, a diagnostic tool, or a substitute for professional standards and employer policy. Never place real patient information, client records, passwords, or other sensitive data into a consumer AI tool.

## Who made this

This shelf is a project of **ASDALE DYNAMICS, LLC**, founded by Dylan Asdale—a registered nurse turned AI author. It follows the same plain-English spirit as *The Massive AI Manual* and [dylanasdale.github.io](${content.meta.hubUrl}): step by step, never condescending.

_Independent guide. Not affiliated with or endorsed by any course provider. See the repository license for reuse terms._
${docFooter(content)}`;
}

export function renderCertificatesDoc(content) {
  const freeCourses = content.resources.filter((resource) => resource.certificate === 'free');
  const paidCourses = content.resources.filter(
    (resource) => resource.type === 'course' && resource.certificate === 'paid',
  );
  const variedCourses = content.resources.filter(
    (resource) => resource.type === 'course' && resource.certificate === 'varies',
  );
  const noCertificateCourses = content.resources.filter(
    (resource) => resource.type === 'course' && resource.certificate === 'none',
  );
  const accessResources = categoryResources(content, content.categoryById.get('access'));
  const matrixRows = content.certificates.matrix
    .map(
      (row) =>
        `| [${tableCell(row.provider)}](${row.url}) | ${tableCell(row.learnFree)} | ${tableCell(row.freeCertificate)} | ${tableCell(row.watchOut)} |`,
    )
    .join('\n');
  const freeRows = freeCourses
    .map(
      (resource) =>
        `| ${resourceLink(resource)} | ${tableCell(resource.provider)} | ${tableCell(resource.time)} | ${tableCell(resource.certificateNote)} |`,
    )
    .join('\n');
  const paidRows = paidCourses
    .map(
      (resource) =>
        `- ${resourceLink(resource)} — ${resource.provider}; ${resource.time}. ${resource.certificateNote}`,
    )
    .join('\n');
  const variedRows = variedCourses
    .map(
      (resource) =>
        `- ${resourceLink(resource)} — ${resource.provider}; ${resource.time}. ${resource.certificateNote}`,
    )
    .join('\n');
  const noCertRows = noCertificateCourses
    .map(
      (resource) =>
        `- ${resourceLink(resource)} — ${resource.provider}; ${resource.time}. ${resource.certificateNote}`,
    )
    .join('\n');
  const freeRouteNote = content.certificates.freeRouteNote;

  return `# Free AI and tech certificates, explained

> A certificate can open a door. It cannot do the learning for you.

[Guide home](README.md) · [Categorized guide](README.md#the-categorized-guide) · [Learning paths](learning-paths.md) · [Full library](full-library.md)

${content.certificates.intro}

${freeRouteNote}

Links and certificate rules were last checked **${content.meta.verifiedLabel}**. This page records a verification date, not a permanent promise.

## The genuinely free routes

These are the ${freeCourses.length} resources in this guide that currently lead to a free completion record from the provider. Requirements vary; the certificate note is the short version.

| Course or program | Provider | Time | What the free certificate requires |
| --- | --- | --- | --- |
${freeRows}

**What "free" means here:** the provider does not charge you for the listed completion certificate or badge. You may still need an account, might need to pass a quiz, or might need to complete a project. A free certificate is a completion record—not an accredited degree, professional license, or employment guarantee.

## Free to learn, but the certificate is paid

The learning can still be worth your time. The certificate is a separate purchase, membership benefit, or verified upgrade.

${paidRows}

${variedRows ? `\n## Certificate rules vary\n\n${variedRows}\n` : ''}
## No certificate listed

The absence of a certificate is not a defect. For project-based or advanced study, a working artifact and a clear write-up are often stronger evidence.

${noCertRows}

## Provider-by-provider rules

| Provider | Free to learn? | Free certificate? | What to watch for |
| --- | --- | --- | --- |
${matrixRows}

## Access briefing sources

These are the official pages used to check the changing rules above:

${accessResources
  .map(
    (resource) =>
      `- ${resourceLink(resource)} — ${resource.provider}; ${resource.time}. ${resource.description}`,
  )
  .join('\n')}

## The certificate fine print

${content.certificates.finePrint
  .map((item, index) => `${index + 1}. ${item}`)
  .join('\n')}

## How to share a certificate honestly

${content.certificates.sharingWarning}

Use language that names what you completed and what you can do:

${content.certificates.sharingExamples.map((example) => `- ${example}`).join('\n')}

Avoid "certified AI expert," "AI engineer," or a clinical, legal, or financial credential unless a separate recognized body has actually granted one.

## Should you pay for a certificate?

Maybe—later. A paid professional certificate or verified exam can be worth it when an employer asks for it, a specific credential is required, or you already know the subject is part of your direction. It is a poor first purchase when you are still deciding whether you enjoy the work. Start with a free-to-learn route, finish a small project, and check whether the credential changes a real decision.

${docFooter(content)}`;
}

export function renderPathsDoc(content) {
  const comparison = content.paths
    .map(
      (learningPath) =>
        `| ${learningPath.number} | [${learningPath.title}](#${learningPath.id}) | ${learningPath.level} | ${learningPath.duration} | ${learningPath.effort} |`,
    )
    .join('\n');
  const paths = content.paths
    .map((learningPath) => {
      const steps = learningPath.steps
        .map((step, index) => {
          const resources = step.resourceIds
            .map((id) => {
              const resource = content.resourceById.get(id);
              const cert =
                resource.certificate === 'free'
                  ? ' · Free certificate'
                  : resource.certificate === 'paid'
                    ? ' · Paid certificate'
                    : '';
              return `  - ${resourceLink(resource)} — ${resource.provider}; ${resource.time}; ${LEVEL_LABELS[resource.level]}${cert}.\n    ${resource.description}`;
            })
            .join('\n');
          return `${index + 1}. **${step.title}.** ${step.description}\n${resources}`;
        })
        .join('\n');
      return `<a id="${learningPath.id}"></a>

## ${learningPath.number}. ${learningPath.title}

**${learningPath.level} · ${learningPath.duration} · ${learningPath.effort}**

> ${learningPath.subtitle}

${learningPath.summary}

- **Best for:** ${learningPath.bestFor}
- **Prerequisites:** ${learningPath.prereqs}
- **Certificates:** ${learningPath.certificates}

### The route

${steps}

### The finish line: ${learningPath.project.title}

${learningPath.project.description}

**Proof of work:** ${learningPath.project.proof}

**Then what?** ${learningPath.after}
`;
    })
    .join('\n---\n\n');

  return `# Learning paths

> A route with a finish line.

[Guide home](README.md) · [Certificate guide](certificates.md) · [90-day plan](90-day-plan.md) · [Full library](full-library.md)

${content.pathsIntro}

| # | Path | Level | Time | Weekly effort |
| --- | --- | --- | --- | --- |
${comparison}

Every route uses free-to-learn resources. Some certificates cost money; each path states its certificate reality before you commit. Progress is not a race: start at the level that matches what you can already do.

${paths}
${docFooter(content)}`;
}

export function renderPlanDoc(content) {
  const { plan } = content;
  const phases = plan.phases
    .map((phase) => {
      const weeks = phase.weeks
        .map((week) => {
          const tasks = week.tasks
            .map((task) => {
              const resource = task.resourceId ? content.resourceById.get(task.resourceId) : null;
              const resourceLine = resource
                ? `\n  Resource: [${resource.title}](${resource.url}) (${resource.time}${resource.certificate === 'free' ? '; free certificate' : ''})`
                : '';
              return `- [ ] **${task.label}**\n  ${task.detail}${resourceLine}`;
            })
            .join('\n');
          return `### Week ${week.number}: ${week.title}

**${week.hours} · Focus:** ${week.focus}

${tasks}

**If you have extra time:** ${week.stretch}

**Keep this:** ${week.outcome}`;
        })
        .join('\n\n');
      return `## ${phase.days}: ${phase.title}

${phase.summary}

${weeks}

### ${phase.milestone.title}

${phase.milestone.description}

${phase.milestone.checks.map((check) => `- [ ] ${check}`).join('\n')}`;
    })
    .join('\n\n---\n\n');

  return `# ${plan.title}

> ${plan.subtitle}

[Guide home](README.md) · [Learning paths](learning-paths.md) · [Certificate guide](certificates.md) · [Full library](full-library.md)

${plan.intro}

**Standard pace:** ${plan.timeNote}

## House rules

${plan.rules.map((rule) => `- ${rule}`).join('\n')}

---

${phases}

---

## When the plan meets a hard week

${plan.fallback.map((item) => `### ${item.title}\n\n${item.text}`).join('\n\n')}

## Three projects worth making

${plan.projects.map((project) => `### ${project.title}\n\n${project.text}`).join('\n\n')}

## Day 90: the finish line

${plan.finishLine.map((item) => `- ${item}`).join('\n')}

The finish line is a thing you made, a clear write-up, and a realistic next step—not a certificate alone.

${docFooter(content)}`;
}

export function renderFullLibraryDoc(content) {
  const totals = getTotals(content);
  const categorySections = content.categories
    .map((category) => {
      const resources = categoryResources(content, category);
      const rows = resources
        .map(
          (resource) =>
            `| ${resourceLink(resource)} | ${tableCell(resource.provider)} | ${tableCell(TYPE_SINGULAR[resource.type])} | ${tableCell(LEVEL_LABELS[resource.level])} | ${tableCell(resource.time)} | ${tableCell(resource.cost)} | ${resource.type === 'course' ? certificateShort(resource) : '—'} | ${tableCell(resource.topics.join(', '))} |`,
        )
        .join('\n');
      return `## ${category.number}. ${category.navLabel}

${category.tagline}

| Resource | Provider | Type | Level | Time | Cost | Free certificate? | Topics |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}`;
    })
    .join('\n\n');

  return `# The full library

> ${totals.resources} official resources, one page, no mystery links.

[Guide home](README.md) · [Certificate guide](certificates.md) · [Learning paths](learning-paths.md) · [90-day plan](90-day-plan.md)

This is the complete catalog behind the guide: ${totals.courses} courses, ${totals.guides} official guides, ${totals.books} free books, and ${totals.channels} YouTube channels. All links go to the provider's own site. No affiliate or tracking links are used.

"Free certificate?" applies to courses. A dash means the item is a book, guide, or channel, not that it failed a certificate test. The [certificate guide](certificates.md) explains every free route and provider rule.

${categorySections}

${docFooter(content)}`;
}

export function renderMethodDoc(content) {
  return `# Sources and method

> The recipe behind the shelf.

[Guide home](README.md) · [Full library](full-library.md) · [Certificate guide](certificates.md)

## What this guide is

An independent, static learning guide to free-to-learn AI and technology courses, certificates, books, and official channels. It is written for beginners and early-intermediate learners who want accurate orientation without a sales funnel.

The emphasis is AI literacy, Python and data, machine learning, LLM applications and agents, MCP, and deep learning. Provider policy guides are included when they clarify what "free" actually means.

## How resources are selected

A resource has to clear all five bars:

1. **Official door.** The link goes to the provider's own domain—not a course mill, reseller, or affiliate landing page.
2. **Substantive learning.** It teaches something useful and the description says what you will actually do. A lead magnet is not a course.
3. **Honest access.** Free to learn, free certificate, paid certificate, and no certificate are labeled separately. A first-module preview is not described as a free full course.
4. **No monetized detour.** No affiliate links, tracking parameters, or third-party certificate sellers.
5. **Checked by hand.** Every URL and certificate claim was checked against the official page on ${content.meta.verifiedLabel}.

## Verification

- All ${content.resources.length} resource links returned an HTTP success response on ${content.meta.verifiedLabel}.
- Course pages were checked for access restrictions and certificate requirements.
- Free certificate claims were checked against the provider's own course, help, or policy page.
- The site is static and uses no analytics, ads, accounts, remote fonts, or third-party scripts.

Provider pages change. This guide records a date so you can judge freshness. On the day you enroll, the provider's page wins.

## What "free" means here

- **Free:** listed learning is available without payment, though an account may be required.
- **Free certificate:** the provider issues a completion record without payment, subject to its requirements.
- **Paid certificate:** learning may be free while the certificate costs money or requires membership.
- **Varies:** rules differ by cohort, platform, or access route.
- **No certificate:** no completion credential is offered for the listed resource.

A certificate is not an accredited degree, professional license, or guarantee of employment. This guide never describes one as more than a provider-issued record of completion.

## Privacy and accessibility

The website stores saved resources, done marks, and plan checkboxes in the visitor's browser using local storage. It does not send that state to a server. Search terms and reading history are not stored. The Markdown edition is plain text that can be read offline or printed.

The site includes keyboard-operable controls, visible focus styles, semantic headings, reduced-motion support, and print styles. It does not autoplay media or use pop-ups.

## Healthcare boundary

Healthcare examples are educational only. Nothing here is medical advice, clinical guidance, a diagnostic tool, or a substitute for professional standards or employer policy. Never put real patient information, identifiers, images, or confidential material into a consumer AI tool.

## Corrections and maintenance

Course catalogs and certificate policies are moving targets. To update this edition:

1. Check the provider's current page.
2. Update the relevant record in \`data/catalog.json\` or \`data/certificates.json\`.
3. Update \`meta.verifiedAt\` in \`data/catalog.json\`.
4. Run \`npm test\`, \`npm run test:browser\`, and \`npm run check-links\`.
5. Rebuild the Markdown and HTML with \`npm run build\`.

## Independence and credit

Built by **ASDALE DYNAMICS, LLC** in Indiana. Independent guide; not affiliated with or endorsed by any course provider. See the repository license for reuse terms.

${docFooter(content)}`;
}

export async function writeDocs(content) {
  const docsDir = path.join(ROOT, 'docs');
  await mkdir(docsDir, { recursive: true });
  const documents = new Map([
    ['README.md', renderDocsIndex(content)],
    ['certificates.md', renderCertificatesDoc(content)],
    ['learning-paths.md', renderPathsDoc(content)],
    ['90-day-plan.md', renderPlanDoc(content)],
    ['full-library.md', renderFullLibraryDoc(content)],
    ['sources-and-method.md', renderMethodDoc(content)],
  ]);
  content.categories.forEach((category) => {
    const file = DOC_FILES[category.id];
    if (file) documents.set(file, renderCategoryDoc(content, category));
  });
  await Promise.all(
    [...documents.entries()].map(([file, markdown]) => writeFile(path.join(docsDir, file), markdown)),
  );
  return [...documents.keys()];
}
