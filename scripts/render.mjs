import {
  CERTIFICATE_LABELS,
  LEVEL_LABELS,
  TYPE_LABELS,
  escapeAttribute,
  escapeHtml,
  hostOf,
} from './lib.mjs';

const icons = {
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.75 4.75A1.75 1.75 0 0 1 8.5 3h7A1.75 1.75 0 0 1 17.25 4.75v16L12 17.5l-5.25 3.25v-16Z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.4 4.4L19 7.3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.25"/><path d="M12 7.5v5l3.25 2"/></svg>`,
  search: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="m15.4 8.6-2.1 4.7-4.7 2.1 2.1-4.7 4.7-2.1Z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 16v3.5h15V16"/></svg>`,
  print: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 9V4.5h10V9M7 17H4.5V9h15v8H17M7 13h10v6.5H7V13Z"/></svg>`,
  reset: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 9.5A8 8 0 1 1 5 15m-.5-5.5V4.75M4.5 9.5h4.75"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8c.55 5.3 3.9 8.65 9.2 9.2-5.3.55-8.65 3.9-9.2 9.2-.55-5.3-3.9-8.65-9.2-9.2 5.3-.55 8.65-3.9 9.2-9.2Z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.2c2.1 1.6 4.4 2.4 7 2.5v5.4c0 4.5-2.8 7.9-7 9.7-4.2-1.8-7-5.2-7-9.7V5.7c2.6-.1 4.9-.9 7-2.5Z"/><path d="m8.8 12 2.1 2.1 4.4-4.5"/></svg>`,
  book: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h12.5v15H7a2.5 2.5 0 0 0-2.5 2.5v-15Z"/><path d="M4.5 5.5v16H19"/></svg>`,
};

const navItems = [
  { key: 'library', href: 'library.html', label: 'Library' },
  { key: 'paths', href: 'paths.html', label: 'Learning paths' },
  { key: 'certificates', href: 'certificates.html', label: 'Certificates' },
  { key: 'plan', href: 'plan.html', label: '90-day plan', cta: true },
  { key: 'about', href: 'about.html', label: 'About' },
];

function initials(value) {
  return value
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function renderHeader(activePage) {
  const links = navItems
    .map((item) => {
      const classes = [item.cta ? 'nav-plan' : '', item.key === activePage ? 'is-active' : ''].filter(Boolean).join(' ');
      const current = item.key === activePage ? ' aria-current="page"' : '';
      return `<a class="${classes}" href="${item.href}"${current}>${escapeHtml(item.label)}</a>`;
    })
    .join('');
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="index.html">
      <span class="brand-mark" aria-hidden="true">${icons.spark}</span>
      <span class="brand-words"><strong>Learn AI</strong><span>for free</span></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
    <nav class="primary-nav" id="primary-nav" aria-label="Primary navigation">${links}</nav>
  </div>
</header>`;
}

export function renderFooter(meta, totals) {
  return `
<footer class="site-footer">
  <div class="shell footer-grid">
    <div class="footer-intro">
      <a class="brand brand--footer" href="index.html">
        <span class="brand-mark" aria-hidden="true">${icons.spark}</span>
        <span class="brand-words"><strong>Learn AI</strong><span>for free</span></span>
      </a>
      <p>A warm, no-hype route through ${totals.resources} official free resources. Start small. Make something. Check your work.</p>
      <p class="footer-stamp">Links verified ${escapeHtml(meta.verifiedLabel)}</p>
    </div>
    <div class="footer-links">
      <h2>Explore</h2>
      <a href="library.html">The library</a>
      <a href="paths.html">Learning paths</a>
      <a href="certificates.html">The certificate map</a>
      <a href="plan.html">The 90-day plan</a>
      <a href="about.html">About this guide</a>
    </div>
    <div class="footer-fineprint">
      <h2>The fine print</h2>
      <p>Independent guide. Not affiliated with or endorsed by the course providers.</p>
      <p>Education only—not medical, legal, or financial advice. Never put patient information or secrets into an AI tool.</p>
      <p>No accounts, analytics, ads, or affiliate links. Progress stays in this browser.</p>
    </div>
  </div>
  <div class="shell footer-bottom">
    <p>Built for the ${escapeHtml(meta.authorOrg)} learning shelf.</p>
    <p><a href="${escapeAttribute(meta.hubUrl)}" target="_blank" rel="noopener noreferrer">More plain-English AI <span class="external-mark">${icons.arrow}<span class="visually-hidden"> (opens in a new tab)</span></span></a></p>
  </div>
</footer>`;
}

function certificateTag(resource) {
  if (!resource.certificate || resource.certificate === 'na') return '';
  const label = CERTIFICATE_LABELS[resource.certificate];
  if (!label) return '';
  return `<span class="cert-tag cert-tag--${resource.certificate}">${escapeHtml(label)}</span>`;
}

export function renderResourceCard(resource) {
  const typeLabel = TYPE_LABELS[resource.type];
  const title = escapeHtml(resource.title);
  const provider = escapeHtml(resource.provider);
  const level = LEVEL_LABELS[resource.level];
  const topics = resource.topics.slice(0, 3).map((topic) => `<span class="topic" role="listitem">${escapeHtml(topic)}</span>`).join('');
  const host = hostOf(resource.url);
  const searchText = [
    resource.title,
    resource.provider,
    resource.description,
    resource.format,
    resource.categoryLabel,
    ...resource.topics,
  ]
    .join(' ')
    .toLowerCase();
  return `
<article class="resource-card resource-card--${resource.type}${resource.featured ? ' is-featured' : ''}" id="resource-${escapeAttribute(resource.id)}" data-resource-card data-resource-id="${escapeAttribute(resource.id)}" data-type="${escapeAttribute(resource.type)}" data-level="${escapeAttribute(resource.level)}" data-provider="${escapeAttribute(resource.providerGroup)}" data-certificate="${escapeAttribute(resource.certificate)}" data-category="${escapeAttribute(resource.categoryId)}" data-title="${escapeAttribute(resource.title)}" data-search="${escapeAttribute(searchText)}">
  <div class="resource-card__top">
    <span class="resource-type">${escapeHtml(typeLabel)}</span>
    <span class="category-chip">${escapeHtml(resource.categoryLabel)}</span>
    ${certificateTag(resource)}
  </div>
  <div class="provider-line">
    <span class="provider-mark" aria-hidden="true">${escapeHtml(initials(resource.provider))}</span>
    <span class="provider-name">${provider}</span>
    <span class="meta-separator" aria-hidden="true">·</span>
    <span class="resource-format">${escapeHtml(resource.format)}</span>
  </div>
  <h3 class="resource-title"><a href="${escapeAttribute(resource.url)}" target="_blank" rel="noopener noreferrer">${title}<span class="title-arrow">${icons.arrow}<span class="visually-hidden"> (opens in a new tab)</span></span></a></h3>
  <p class="resource-description">${escapeHtml(resource.description)}</p>
  <div class="resource-meta">
    <span>${icons.clock}<span>${escapeHtml(resource.time)}</span></span>
    <span>${escapeHtml(level)}</span>
    <span class="resource-host">${escapeHtml(host)}</span>
  </div>
  <div class="resource-topics" role="list" aria-label="Topics">${topics}</div>
  <div class="resource-actions">
    <button class="text-button save-button" type="button" data-save-id="${escapeAttribute(resource.id)}" data-item-title="${escapeAttribute(resource.title)}" aria-pressed="false" aria-label="Save ${escapeAttribute(resource.title)} for later">
      ${icons.bookmark}<span>Save</span>
    </button>
    <button class="text-button done-button" type="button" data-done-id="${escapeAttribute(resource.id)}" data-item-title="${escapeAttribute(resource.title)}" aria-pressed="false" aria-label="Mark ${escapeAttribute(resource.title)} as done">
      ${icons.check}<span>Done</span>
    </button>
  </div>
</article>`;
}

export function renderFeaturedResources(resources) {
  return resources.filter((resource) => resource.featured).map(renderResourceCard).join('\n');
}

export function renderTypeCounts(resources) {
  const types = [
    ['all', 'All', resources.length],
    ['course', 'Courses', resources.filter((resource) => resource.type === 'course').length],
    ['guide', 'Guides', resources.filter((resource) => resource.type === 'guide').length],
    ['book', 'Books', resources.filter((resource) => resource.type === 'book').length],
    ['channel', 'YouTube', resources.filter((resource) => resource.type === 'channel').length],
  ];
  return types
    .map(
      ([key, label, count], index) => `
      <button class="filter-tab" type="button" data-type-filter="${key}" aria-pressed="${index === 0 ? 'true' : 'false'}">
        ${label}<span>${count}</span>
      </button>`,
    )
    .join('\n');
}

export function renderProviderOptions(resources) {
  const counts = new Map();
  resources.forEach((resource) => {
    counts.set(resource.providerGroup, (counts.get(resource.providerGroup) || 0) + 1);
  });
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([provider, count]) => `<option value="${escapeAttribute(provider)}">${escapeHtml(provider)} (${count})</option>`,
    )
    .join('\n');
}

export function renderCategoryOptions(categories, resources) {
  return categories
    .map((category) => {
      const count = resources.filter((resource) => resource.categoryId === category.id).length;
      return `<option value="${escapeAttribute(category.id)}">${escapeHtml(category.navLabel)} (${count})</option>`;
    })
    .join('\n');
}

export function renderLibraryCards(resources) {
  return resources.map(renderResourceCard).join('\n');
}

function pathResources(learningPath) {
  return [...new Set(learningPath.steps.flatMap((step) => step.resourceIds))];
}

export function renderPathTeasers(paths) {
  return paths
    .map(
      (path) => `
      <a class="path-teaser path-teaser--${escapeAttribute(path.accent)}" href="paths.html#${escapeAttribute(path.id)}">
        <span class="eyebrow">Path ${escapeHtml(path.number)} · ${escapeHtml(path.level)}</span>
        <h3>${escapeHtml(path.title)}</h3>
        <p>${escapeHtml(path.subtitle)}</p>
        <span class="path-teaser__meta">${escapeHtml(path.duration)} · ${escapeHtml(path.effort)}</span>
        <span class="text-link">See the route ${icons.arrow}</span>
      </a>`,
    )
    .join('\n');
}

function renderRouteResource(resource) {
  return `
  <div class="route-resource" data-route-resource-id="${escapeAttribute(resource.id)}">
    <div class="route-resource__copy">
      <span class="route-resource__provider">${escapeHtml(resource.provider)}</span>
      <a href="${escapeAttribute(resource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.title)}${icons.arrow}<span class="visually-hidden"> (opens in a new tab)</span></a>
      <span class="route-resource__meta">${escapeHtml(resource.time)} · ${escapeHtml(LEVEL_LABELS[resource.level])}${resource.certificate === 'free' ? ' · Free certificate' : ''}</span>
    </div>
    <button class="mini-done" type="button" data-done-id="${escapeAttribute(resource.id)}" data-item-title="${escapeAttribute(resource.title)}" aria-pressed="false" aria-label="Mark ${escapeAttribute(resource.title)} as done">
      ${icons.check}<span>Done</span>
    </button>
  </div>`;
}

export function renderPathsPage(content) {
  return content.paths
    .map((learningPath) => {
      const uniqueResources = pathResources(learningPath);
      const steps = learningPath.steps
        .map(
          (step, index) => `
          <li class="path-step">
            <span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
            <div class="step-body">
              <h3>${escapeHtml(step.title)}</h3>
              <p>${escapeHtml(step.description)}</p>
              <div class="route-resources">
                ${step.resourceIds.map((id) => renderRouteResource(content.resourceById.get(id))).join('')}
              </div>
            </div>
          </li>`,
        )
        .join('\n');
      return `
      <article class="path-card path-card--${escapeAttribute(learningPath.accent)}" id="${escapeAttribute(learningPath.id)}" data-path-block data-path-resources="${escapeAttribute(uniqueResources.join(','))}">
        <header class="path-card__header">
          <div class="path-card__index" aria-hidden="true">${escapeHtml(learningPath.number)}</div>
          <div class="path-card__intro">
            <span class="eyebrow">${escapeHtml(learningPath.eyebrow)}</span>
            <h2>${escapeHtml(learningPath.title)}</h2>
            <p class="path-subtitle">${escapeHtml(learningPath.subtitle)}</p>
            <p class="path-summary">${escapeHtml(learningPath.summary)}</p>
          </div>
          <div class="path-card__progress">
            <span class="path-progress-label" data-path-count>0 of ${uniqueResources.length} resources done</span>
            <div class="progress-bar" data-path-bar role="progressbar" aria-label="${escapeAttribute(learningPath.title)} progress" aria-valuemin="0" aria-valuemax="${uniqueResources.length}" aria-valuenow="0"><span></span></div>
          </div>
        </header>
        <div class="path-facts">
          <div><span>Level</span><strong>${escapeHtml(learningPath.level)}</strong></div>
          <div><span>Time</span><strong>${escapeHtml(learningPath.duration)}</strong></div>
          <div><span>Weekly effort</span><strong>${escapeHtml(learningPath.effort)}</strong></div>
          <div><span>Best for</span><strong>${escapeHtml(learningPath.bestFor)}</strong></div>
          <div><span>Prerequisites</span><strong>${escapeHtml(learningPath.prereqs)}</strong></div>
          <div><span>Certificates</span><strong>${escapeHtml(learningPath.certificates)}</strong></div>
        </div>
        <ol class="path-steps">
          ${steps}
        </ol>
        <aside class="path-finish">
          <div class="finish-icon" aria-hidden="true">${icons.compass}</div>
          <div>
            <span class="eyebrow">The finish line</span>
            <h3>${escapeHtml(learningPath.project.title)}</h3>
            <p>${escapeHtml(learningPath.project.description)}</p>
            <p class="proof"><strong>Proof of work:</strong> ${escapeHtml(learningPath.project.proof)}</p>
            <p class="path-after"><strong>Then what?</strong> ${escapeHtml(learningPath.after)}</p>
          </div>
        </aside>
      </article>`;
    })
    .join('\n');
}

export function renderPathQuickNav(paths) {
  return paths
    .map(
      (path) =>
        `<a href="#${escapeAttribute(path.id)}"><span>${escapeHtml(path.number)}</span>${escapeHtml(path.title)}</a>`,
    )
    .join('');
}

export function renderPlanPreview(plan) {
  return plan.phases
    .map(
      (phase) => `
      <div class="phase-preview phase-preview--${escapeAttribute(phase.accent)}">
        <span class="phase-preview__days">${escapeHtml(phase.days)}</span>
        <h3>${escapeHtml(phase.title)}</h3>
        <p>${escapeHtml(phase.summary)}</p>
      </div>`,
    )
    .join('');
}

export function renderPlanPage(content) {
  const { plan, resourceById } = content;
  const phaseMarkup = plan.phases
    .map((phase) => {
      const weeks = phase.weeks
        .map(
          (week) => `
          <article class="plan-week" id="week-${week.number}" data-week-card data-week-number="${week.number}">
            <header class="plan-week__header">
              <div class="week-kicker">
                <span class="week-number">Week ${week.number}</span>
                <span class="time-pill">${icons.clock}${escapeHtml(week.hours)}</span>
              </div>
              <h3>${escapeHtml(week.title)}</h3>
              <p class="week-focus">${escapeHtml(week.focus)}</p>
            </header>
            <ul class="task-list">
              ${week.tasks
                .map((task) => {
                  const resource = task.resourceId ? resourceById.get(task.resourceId) : null;
                  return `
                  <li class="plan-task">
                    <label class="task-check" for="task-${escapeAttribute(task.id)}">
                      <input type="checkbox" id="task-${escapeAttribute(task.id)}" data-plan-task="${escapeAttribute(task.id)}" data-task-label="${escapeAttribute(task.label)}">
                      <span class="check-indicator" aria-hidden="true">${icons.check}</span>
                      <span class="task-copy">
                        <span class="task-label">${escapeHtml(task.label)}</span>
                        <span class="task-detail">${escapeHtml(task.detail)}</span>
                      </span>
                    </label>
                    ${resource ? `<a class="task-resource" href="${escapeAttribute(resource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.title)}${icons.arrow}<span class="visually-hidden"> (opens in a new tab)</span></a>` : ''}
                  </li>`;
                })
                .join('\n')}
            </ul>
            <p class="stretch-note"><span class="stretch-label">If you have extra time</span>${escapeHtml(week.stretch)}</p>
            <p class="week-outcome"><span class="outcome-label">Keep this</span>${escapeHtml(week.outcome)}</p>
          </article>`,
        )
        .join('\n');
      const milestoneChecks = phase.milestone.checks.map((check) => `<li>${escapeHtml(check)}</li>`).join('');
      return `
      <section class="plan-phase plan-phase--${escapeAttribute(phase.accent)}" id="${escapeAttribute(phase.id)}" data-phase="${escapeAttribute(phase.id)}">
        <header class="phase-header">
          <div>
            <span class="eyebrow">${escapeHtml(phase.days)}</span>
            <h2>${escapeHtml(phase.title)}</h2>
            <p>${escapeHtml(phase.summary)}</p>
          </div>
          <div class="phase-progress">
            <span data-phase-count>0 of ${phase.weeks.flatMap((week) => week.tasks).length} tasks</span>
            <div class="progress-bar" data-phase-bar role="progressbar" aria-label="Phase progress: ${escapeAttribute(phase.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
          </div>
        </header>
        <div class="plan-weeks">
          ${weeks}
        </div>
        <aside class="milestone">
          <div class="milestone__mark" aria-hidden="true">${icons.spark}</div>
          <div>
            <span class="eyebrow">${escapeHtml(phase.milestone.title)}</span>
            <p class="milestone__description">${escapeHtml(phase.milestone.description)}</p>
            <ul class="milestone-checks">${milestoneChecks}</ul>
          </div>
        </aside>
      </section>`;
    })
    .join('\n');
  return phaseMarkup;
}

export function renderPlanRules(plan) {
  return plan.rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join('');
}

export function renderPlanFallback(plan) {
  return plan.fallback
    .map(
      (item) => `
      <div class="fallback-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </div>`,
    )
    .join('');
}

export function renderPlanProjects(plan) {
  return plan.projects
    .map(
      (project) => `
      <div class="project-card">
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.text)}</p>
      </div>`,
    )
    .join('');
}

export function renderPlanFinishLine(plan) {
  return plan.finishLine.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

export function renderFreeCertificateRoutes(resources) {
  return resources
    .filter((resource) => resource.certificate === 'free')
    .map(
      (resource) => `
      <li class="cert-route">
        <span class="provider-mark" aria-hidden="true">${escapeHtml(initials(resource.provider))}</span>
        <div class="cert-route__body">
          <span class="cert-route__provider">${escapeHtml(resource.provider)}</span>
          <a href="${escapeAttribute(resource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.title)}${icons.arrow}<span class="visually-hidden"> (opens in a new tab)</span></a>
          <span class="cert-route__meta">${escapeHtml(resource.time)} · ${escapeHtml(LEVEL_LABELS[resource.level])}</span>
        </div>
        <span class="cert-route__badge">Free certificate</span>
      </li>`,
    )
    .join('');
}

export function renderCertificateMatrix(rows) {
  return `
  <table>
    <caption class="visually-hidden">Free learning and certificate rules by provider</caption>
    <thead>
      <tr>
        <th scope="col">Provider</th>
        <th scope="col">Free to learn?</th>
        <th scope="col">Free certificate?</th>
        <th scope="col">What to watch for</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) => `
          <tr>
            <th scope="row"><a href="${escapeAttribute(row.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.provider)}${icons.arrow}<span class="visually-hidden"> (opens in a new tab)</span></a></th>
            <td data-label="Free to learn?">${escapeHtml(row.learnFree)}</td>
            <td data-label="Free certificate?"><span class="${row.freeCertificate.toLowerCase().startsWith('yes') ? 'table-yes' : 'table-no'}">${escapeHtml(row.freeCertificate)}</span></td>
            <td data-label="What to watch for">${escapeHtml(row.watchOut)} <a class="table-source" href="${escapeAttribute(row.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.linkLabel)}${icons.arrow}<span class="visually-hidden"> (opens in a new tab)</span></a></td>
          </tr>`,
        )
        .join('')}
    </tbody>
  </table>`;
}

export function renderCertificateFinePrint(items) {
  return items.map((item, index) => `<li><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(item)}</p></li>`).join('');
}

export function renderSharingExamples(examples) {
  return examples.map((example) => `<li>${escapeHtml(example)}</li>`).join('');
}
