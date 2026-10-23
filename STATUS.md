# STATUS

**Project:** Learn AI for Free — a categorized guide to legitimate free AI and tech courses and certificates
**Owner:** Asdale Dynamics, LLC
**Date:** October 23, 2026
**State:** Complete. Built, tested, and committed locally. Not pushed or published.

## What was built

A beginner-to-advanced guide delivered twice from one shared data source: readable Markdown and a dependency-free static website.

### Content

- **59 resources:** 33 courses, 8 guides, 6 books, and 12 official YouTube channels.
- **6 categories:** Foundations; Python & Data; Machine Learning; LLMs, Agents & MCP; Deep Learning; Access Briefings.
- **14 free certificate routes**, plus a provider-by-provider matrix covering free, paid, varies, and no-certificate cases, with fine print and sharing guidance.
- **5 learning paths** with sequencing, projects, time estimates, and finish lines: AI literacy; Python and data; building with agents; free AI coding and local models; deep learning.
- **90-day plan:** 3 phases, 12 weeks, 37 small tasks, 3 projects, low-energy fallbacks, and review checkpoints.
- **11 Markdown guides** in `docs/` (~21,600 words), including a full library, certificate guide, learning paths, plan, and sources-and-method notes.

Every resource has an official provider link, level, time commitment, format, cost label, certificate status, and a plain-English description of what it covers. The catalog includes newer practical routes for GitHub Foundations, GitHub Copilot, Ollama local models, Databricks generative AI, and Google's AI-for-educators course, alongside established offerings from Kaggle, freeCodeCamp, Microsoft, Hugging Face, Google, DeepLearning.AI, and others.

### Website

Six static pages in `site/`:

- **Home** with featured resources, path teasers, plan preview, and editorial standards.
- **Library** with search plus category, level, time-bucket, provider, certificate, and format filters; saved and done states; and 59 resource cards.
- **Learning paths** with progress tracking and anchored deep links across five routes.
- **Certificates** with free routes, provider matrix, fine print, and sharing examples.
- **90-day plan** with persistent checkboxes, progress, JSON export, print, and safe reset.
- **About** with editorial rules, privacy details, accessibility notes, and healthcare boundaries.

The site is fully local: local CSS/JavaScript, local favicon, no accounts, analytics, ads, remote fonts, or third-party scripts. Saved resources and plan progress live in `localStorage`. A restrictive Content Security Policy is applied by the included static server.

### Engineering

- Content validation for official HTTPS hosts, forbidden tracking parameters and URL credentials, duplicate IDs and URLs, exact one-category membership, certificate explanations, learning-path integrity, plan structure, provider groups, and matrix coverage.
- Time commitments use five explicit buckets: under 1 hour, 1–5 hours, 6–20 hours, 20+ hours / multi-week, and reference / ongoing. The library filter exposes them directly.
- One source of truth in `data/`; Markdown and HTML are generated so the two deliverables cannot drift.
- Dependency-free static server with MIME types, traversal protection, 404/405 handling, directory index, clean `.html` fallbacks, and security headers.
- Link checker for local files, fragments, CSS assets, and live external URLs.
- 29 content/build tests and 8 Playwright browser tests, including axe WCAG 2.1 A/AA scans on every page.
- No secrets or API keys. No personal data collected.

## How to run

Requires Node.js 20+ and npm.

```bash
npm install
npm start
```

Open **http://localhost:4173**. `npm start` builds both deliverables, then serves the site.

```bash
npm run build          # regenerate docs/ and site/
npm run serve          # serve the built site on port 4173 (PORT overrides)
npm test               # content + build tests
npm run test:browser   # Playwright interactions, layout, and axe scans
npm run check-links    # local + external link checks (--offline for local only)
npm run verify         # npm test + browser suite
```

Browser tests expect Chrome at `/usr/bin/google-chrome`; set `CHROME_PATH` to override.

## Final verification

Run on October 23, 2026 after the last content, documentation, and styling changes:

| Check | Result |
| --- | --- |
| `npm test` | **29/29 pass** |
| `npm run test:browser` | **8/8 pass**, all six pages load without page errors or external requests |
| axe WCAG 2.1 A/AA scans | **0 violations** on all six pages |
| `npm run check-links -- --concurrency=4` | **62 external URLs, 0 failures; 0 local issues** |
| Build | Six site pages and eleven Markdown guides generated cleanly |
| Server smoke test | `/`, `/library.html`, CSS, and JS return 200; missing page returns 404; POST returns 405; CSP present; path traversal blocked |
| Visual QA | Desktop (1440px) and mobile (390px) screenshots reviewed; library time filter and the five-path layout confirmed |
| Secret scan | No API keys, tokens, or credentials found in source, data, docs, or generated output |

## Known gaps and caveats

- **Point-in-time content.** Links and certificate rules were checked October 23, 2026. Providers can change access, pricing, certificate terms, and URLs at any time. The site shows the verification date and says to confirm details at the source.
- **No affiliation or accreditation claim.** Completion certificates and badges are not accredited degrees or licenses. The guide separates learning access from credential access and makes no job promise.
- **Browser tests need local Chrome.** The suite uses `playwright-core` with the system browser rather than downloading one. External link checks need network access; `--offline` checks only local links.
- **Progress is per browser.** Saved resources and plan checkboxes are stored locally. Clearing site data resets them. There is no account or sync, by design.
- **Static site scope.** Search and filtering run client-side over the 59 resources. There is no backend, CMS, or database.
- **No deployment or CI.** In line with the task constraints, no remote repository was created, nothing was pushed, and nothing was published. `site/.nojekyll` and relative links make the output ready for static hosting when desired. All checks run locally through `npm run verify` and `npm run check-links`.
- **Scope choices.** The catalog favors free-to-learn, English-language resources from established providers. Paid-only programs and unofficial resellers are excluded. IBM SkillsBuild was considered but left out because its direct course URLs redirect to a generic catalog rather than a specific course.
- **Editorial time estimates.** The time buckets are practical planning aids, not provider guarantees.

## Key files

- `data/catalog.json` — resource catalog and verification date
- `data/certificates.json` — certificate matrix and fine print
- `data/learning-paths.json`, `data/plan.json` — routes and 90-day plan
- `docs/README.md` — guide index
- `site/index.html` — built site entry point
- `scripts/build.mjs` — build pipeline
- `tests/` — content, build, and browser tests
- `LICENSE` — Asdale Dynamics, LLC terms
- `README.md` — repository overview, commands, verification, and limits
