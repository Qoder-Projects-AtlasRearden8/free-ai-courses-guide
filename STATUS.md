# STATUS

**Project:** Learn AI for Free — a categorized guide to legitimate free AI and tech courses and certificates
**Owner:** Asdale Dynamics, LLC
**Date:** October 22, 2026
**State:** Complete. Built, tested, and committed locally. Not pushed or published.

## What was built

A beginner-to-advanced guide, delivered as generated Markdown and a static website from one shared data source.

### Content

- **54 resources:** 29 courses, 7 guides, 6 books, and 12 official YouTube channels.
- **6 categories:** Foundations; Python & Data; Machine Learning; LLMs, Agents & MCP; Deep Learning; Access Briefings.
- **12 free certificate routes**, plus a provider-by-provider certificate map covering free, paid, varies, and no-certificate cases, with fine print and sharing guidance.
- **4 learning paths** with sequencing, projects, time estimates, and finish lines: AI literacy, Python and data, building with agents, and deep learning.
- **90-day plan:** 3 phases, 12 weeks, 37 small tasks, 3 projects, low-energy fallbacks, and review checkpoints.
- **11 Markdown guides** in `docs/` (~19,400 words), including a full library, certificate guide, learning paths, plan, and sources-and-method notes.

Every resource has an official provider link, level, time estimate, format, cost label, certificate status, and a plain-English description of what it covers.

### Website

Six static pages in `site/`:

- **Home** with featured resources, path teasers, plan preview, and editorial standards.
- **Library** with search, category/provider/level/certificate/type filters, saved and done states, and 54 resource cards.
- **Learning paths** with progress tracking and anchored deep links.
- **Certificates** with free routes, provider matrix, fine print, and sharing examples.
- **90-day plan** with persistent checkboxes, progress, JSON export, print, and safe reset.
- **About** with editorial rules, privacy details, accessibility notes, and healthcare boundaries.

The site is fully local: local CSS/JavaScript, local favicon, no accounts, no analytics, no ads, no remote fonts, no third-party scripts, and no external network requests. Saved resources and plan progress live in `localStorage`. A restrictive Content Security Policy is applied by the included static server.

### Engineering

- Content validation for official HTTPS hosts, forbidden tracking parameters, duplicate URLs, category coverage, certificate explanations, learning-path integrity, and plan structure.
- One source of truth in `data/`; Markdown and HTML are generated so they cannot drift.
- Dependency-free static server with MIME types, traversal protection, 404/405 handling, directory index, clean `.html` fallbacks, and security headers.
- Link checker for local files, fragments, CSS assets, and live external URLs.
- 28 content/build tests and 8 Playwright browser tests, including axe WCAG 2.1 A/AA scans on every page.
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

Run on October 22, 2026 after the last code and styling changes:

| Check | Result |
| --- | --- |
| `npm test` | **28/28 pass** |
| `npm run test:browser` | **8/8 pass**, all six pages load without page errors or external requests |
| axe WCAG 2.1 A/AA scans | **0 violations** on all six pages |
| `npm run check-links -- --concurrency=4` | **57 external URLs, 0 failures; 0 local issues** |
| Build | Six site pages and eleven Markdown guides generated cleanly |
| Server smoke test | `/`, `/library.html`, CSS, and JS return 200; missing page returns 404; POST returns 405; CSP present; path traversal blocked |
| Visual QA | Desktop (1440px) and mobile (390px) screenshots reviewed; oversized path-teaser arrow icons were found and fixed; certificate and library tables scroll internally without page-wide horizontal overflow |
| Secret scan | No API keys, tokens, or credentials found in source, data, docs, or generated output |

## Known gaps and caveats

- **Point-in-time content.** Links and certificate rules were checked October 22, 2026. Providers can change access, pricing, certificate terms, and URLs at any time. The site shows the verification date and says to confirm details at the source.
- **No affiliation or accreditation claim.** Completion certificates and badges are not accredited degrees or licenses. The guide separates learning access from credential access and makes no job promise.
- **Browser tests need local Chrome.** The suite uses `playwright-core` with the system browser rather than downloading one. External link checks need network access; `--offline` checks only local links.
- **Progress is per browser.** Saved resources and plan checkboxes are stored locally. Clearing site data resets them. There is no account or sync, by design.
- **Static site scope.** Search and filtering run client-side over the 54 resources. There is no backend, CMS, or database.
- **No deployment.** In line with the task constraints, no remote repository was created, nothing was pushed, and nothing was published. `site/.nojekyll` and relative links make the output ready for static hosting when desired.
- **No CI configuration.** All checks are runnable locally through `npm run verify` and `npm run check-links`.
- **Scope choices.** The catalog favors free-to-learn resources from established providers and English-language material. Paid-only programs and unofficial course resellers are intentionally excluded.

## Key files

- `data/catalog.json` — resource catalog
- `data/certificates.json` — certificate matrix and fine print
- `data/learning-paths.json`, `data/plan.json` — routes and 90-day plan
- `docs/README.md` — guide index
- `site/index.html` — built site entry point
- `scripts/build.mjs` — build pipeline
- `tests/` — content, build, and browser tests
- `LICENSE` — Asdale Dynamics, LLC terms
- `README.md` — repository overview and commands
