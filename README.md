# Learn AI for Free

### A no-hype field guide to legitimate free AI and tech courses, certificates, books, and official channels.

**54 resources · 12 free certificate routes · 6 categories · 4 learning paths · a 12-week, 37-task plan**

This project ships the same guide twice, from one source of truth:

- **Markdown docs** in [`docs/`](docs/) for reading, printing, or reusing offline.
- **A static website** in [`site/`](site/) with search and filters, saved resources, learning-path progress, and a checkable 90-day plan.

It is written for adults learning around real life: nurses, writers, small-business owners, career changers, and anyone who wants a plain-English route through AI without being sold a fantasy. The tone follows *The Massive AI Manual*: step by step, warm, and never condescending.

A project of **ASDALE DYNAMICS, LLC**.

## What the guide covers

| Category | What it helps you do | Level |
| --- | --- | --- |
| Foundations | Understand what AI and generative AI are, where they fail, and how to keep your judgment | Beginner |
| Python & data | Read, run, and modify real code, then inspect a dataset honestly | Beginner to intermediate |
| Machine learning | Go from a first decision tree to project-level judgment | Beginner to intermediate |
| LLMs & agents | Build a small, constrained program that can call tools safely | Intermediate |
| Deep learning | Connect neural-network code to the math and document reproducible results | Intermediate to advanced |
| Access briefings | Short official policy and access pages rather than courses | Reference |

Every entry is linked at the provider's own site and labeled with:

- what the resource actually covers
- level and honest time commitment
- whether it is free to learn, offers a free certificate, charges for the certificate, varies by route, or offers no certificate

Twelve resources currently lead to a free completion certificate or badge. The guide deliberately separates **free to learn**, **free certificate**, and **accredited credential**. They are not interchangeable, and no certificate here promises a job.

## Quick start

Requires **Node.js 20 or newer** and npm. There are no runtime dependencies.

```bash
npm install
npm start
```

`npm start` builds the Markdown and site, then serves the site at **http://localhost:4173**.

To build without serving:

```bash
npm run build
```

The generated output is [`docs/`](docs/) and [`site/`](site/). Both are rebuilt from scratch. Edit the data and templates, not the generated files.

### Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Regenerate all Markdown docs and the six-page static site |
| `npm run serve` | Serve the existing `site/` folder on port 4173 (set `PORT` to override) |
| `npm start` | Build, then serve |
| `npm test` | Validate content and run build-level tests (no browser needed) |
| `npm run test:browser` | Run Playwright interaction, layout, link-safety, and axe accessibility tests |
| `npm run check-links` | Probe every external course link and every local link; add `--offline` to skip network probes |
| `npm run verify` | `npm test` plus the browser suite |

Browser tests use the system Chrome at `/usr/bin/google-chrome`. Set `CHROME_PATH` to another Chrome or Chromium executable if needed.

## Project structure

```text
data/
  catalog.json          Every resource, its URL, level, time, certificate status, and notes
  categories.json       Six categories and their exact resource membership
  certificates.json     Provider-by-provider certificate matrix and fine print
  learning-paths.json   Four sequenced routes with finish lines
  plan.json             Three phases, 12 weeks, 37 tasks, projects, and fallbacks
src/site/
  *.html                Section templates for each page
  assets/               Local CSS and JavaScript only
scripts/
  build.mjs             Clears and regenerates docs/ and site/
  docs.mjs              Markdown generation from the same data
  render.mjs            HTML rendering and escaping
  lib.mjs               Content loading, validation, and shared helpers
  serve.mjs             Dependency-free static server with security headers
  check-links.mjs       Local and external link checker with fragment validation
tests/
  content.test.mjs      Content integrity, official hosts, certificate claims
  build.test.mjs        Generated output, links, counts, and structure
  browser.test.mjs      Real-browser interactions, persistence, mobile layout, axe scans
docs/                   Generated Markdown (11 guides)
site/                   Generated static site (6 pages plus local assets)
artifacts/              Local screenshots from browser tests (gitignored)
```

The data files are the source of truth. Both deliverables are generated from them so the Markdown and the website cannot drift apart.

## How resources get in

1. **Official door.** Links go to the provider's own domain, never a reseller or link farm.
2. **Substantive learning.** No lead magnets; each entry says what you will actually do.
3. **Honest access.** Free, free certificate, paid certificate, varies, and no certificate are separate labels.
4. **No monetized detour.** No affiliate links, tracking parameters, or mystery course mills.
5. **Checked by hand.** Links and certificate rules were last checked **October 22, 2026**. Provider terms change, so confirm on the course page before enrolling.

The guide is independent and not affiliated with or endorsed by any course provider.

## Privacy and boundaries

- No analytics, advertising, affiliate links, account system, remote fonts, or third-party scripts.
- Saved resources, done marks, and plan checkboxes live only in your browser's `localStorage`. Nothing is sent to a server.
- The site runs under a restrictive Content Security Policy and loads only local assets.
- Healthcare-related examples are **education only**, never medical advice, clinical guidance, or a diagnostic tool.
- Never put real patient information, client records, passwords, or other sensitive data into a consumer AI tool. Use fabricated scenarios and follow your employer's policy and professional obligations.
- The guide is not legal, financial, or medical advice.

## Reading order

- Start with [the guide index](docs/README.md) for the categorized shelf and free-certificate routes.
- Browse [the full library](docs/full-library.md) or pick [a learning path](docs/learning-paths.md).
- Ready to plan? Use [the 90-day plan](docs/90-day-plan.md).
- Want the reasoning? Read [sources and method](docs/sources-and-method.md).

The website mirrors all of it: `library.html`, `paths.html`, `certificates.html`, `plan.html`, and `about.html`.

## License

Copyright (c) 2026 Asdale Dynamics, LLC. All rights reserved.

The guide, site, and data may be read, linked to, and shared unmodified for personal, noncommercial learning. No republishing, resale, or derivative use without prior written permission. See [LICENSE](LICENSE) for the full terms.

Third-party course names, trademarks, and linked content belong to their respective owners. Link inclusion does not imply affiliation or endorsement.

## Credits

Built by **ASDALE DYNAMICS, LLC** — an independent education studio in Indiana, founded by Dylan Asdale, registered nurse turned AI author. Find the companion book *The Massive AI Manual* and more plain-English AI work at [dylanasdale.github.io](https://dylanasdale.github.io/).
