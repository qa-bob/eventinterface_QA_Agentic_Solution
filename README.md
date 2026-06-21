# Eventinterface — QA Agentic Solution

Playwright + TypeScript regression test suite for [Eventinterface](https://www.eventinterface.com) — an end-to-end meeting and event planning platform.

This framework is designed for **agentic execution by Claude Code** and uses a **Page Object Model (POM)** architecture with full OOP principles (inheritance, encapsulation, abstraction, polymorphism).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Slash Commands](#slash-commands)
- [CI/CD](#cicd)
- [Contributing](#contributing)

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Playwright](https://playwright.dev/) | ^1.44 | Browser automation and assertions |
| TypeScript | ^5.4 | Strongly-typed test code (strict mode) |
| Node.js | 18+ | Runtime |
| GitHub Actions | — | CI/CD pipeline + Claude Code integration |
| Claude Code | latest | Agentic test generation and maintenance |

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **Git** — [git-scm.com](https://git-scm.com/)
- **Claude Code CLI** (optional, for agentic workflows) — install per [code.claude.com](https://code.claude.com)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/eventinterface_QA_Agentic_Solution.git
cd eventinterface_QA_Agentic_Solution
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install --with-deps chromium
```

For all browsers (required for full suite):

```bash
npx playwright install --with-deps
```

### 4. Configure environment (optional)

```bash
cp .env.example .env
# Edit .env to override SITE_URL if needed for a staging environment
```

### 5. Verify setup

```bash
npm run typecheck   # Must pass — TypeScript compiles cleanly
npm run lint        # Must pass — ESLint clean
npm run test:smoke  # Quick sanity check against the live site
```

---

## Running Tests

```bash
# Run all tests (all tags, all browser projects)
npm test

# Run by test category
npm run test:smoke         # @smoke — site loads, HTTPS, title present
npm run test:navigation    # @navigation — nav links, mobile menu, routing
npm run test:forms         # @forms — contact form structure and validation
npm run test:visual        # @visual — screenshot regression
npm run test:responsive    # @responsive — mobile/tablet layout

# Run with browser visible (useful for debugging)
npm run test:headed

# Open Playwright UI mode (interactive runner)
npx playwright test --ui

# Run a specific test file
npx playwright test tests/smoke/site-availability.spec.ts

# Run on a specific browser project
npx playwright test --project=chromium-desktop
npx playwright test --project=mobile-chrome
npx playwright test --project=tablet

# Show last HTML report
npm run report
```

### Visual baseline management

Visual tests compare against stored baseline screenshots. Run before the first visual test run or after intentional design changes:

```bash
npm run baseline           # Regenerate all visual baselines
git add __snapshots__
git commit -m "chore: update visual baselines"
```

---

## Project Structure

```
eventinterface_QA_Agentic_Solution/
│
├── site.config.json              # Site URL, name, feature flags
├── playwright.config.ts          # Playwright config (projects, reporters)
├── global-setup.ts               # Pre-suite reachability check
├── tsconfig.json                 # TypeScript strict mode + path aliases
│
├── src/
│   ├── pages/                    # Page Object Model classes
│   │   ├── base.page.ts          # BasePage — shared navigation, screenshot, helpers
│   │   ├── home.page.ts          # HomePage — hero, CTAs, headings
│   │   ├── navigation.page.ts    # NavigationPage — links, mobile menu, reachability
│   │   ├── contact.page.ts       # ContactFormPage — form fields, labels, validation
│   │   └── features.page.ts      # FeaturesPage — product features, pricing, CTAs
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom Playwright fixtures (pre-built page objects)
│   ├── utils/
│   │   ├── link-checker.ts       # HTTP HEAD reachability checks
│   │   └── visual-helper.ts      # Cookie banner dismissal, viewport helpers
│   └── types/
│       └── site-config.types.ts  # SiteConfig interface and JSON loader
│
├── tests/
│   ├── smoke/
│   │   └── site-availability.spec.ts   # @smoke — availability, HTTPS, title
│   ├── navigation/
│   │   └── nav-links.spec.ts           # @navigation — nav links, mobile menu
│   ├── forms/
│   │   └── contact-form.spec.ts        # @forms — form structure, labels, validation
│   ├── functional/
│   │   ├── homepage.spec.ts            # @functional — homepage features and CTAs
│   │   ├── features.spec.ts            # @functional — product feature pages
│   │   └── pricing.spec.ts             # @functional — pricing page, plans
│   ├── visual/
│   │   └── visual-regression.spec.ts   # @visual — screenshot regression
│   └── responsive/
│       └── layout.spec.ts              # @responsive — mobile/tablet layout
│
├── .claude/
│   ├── agents/
│   │   ├── site-analyzer.md            # Sub-agent: crawls site, generates config
│   │   └── test-generator.md           # Sub-agent: generates site-specific tests
│   └── commands/                       # Slash command definitions (skills)
│       ├── analyze-site.md             # /analyze-site
│       ├── generate-full-suite.md      # /generate-full-suite
│       ├── run-smoke.md                # /run-smoke
│       ├── update-baseline.md          # /update-baseline
│       └── generate-report.md          # /generate-report
│
├── .github/
│   ├── workflows/
│   │   ├── playwright.yml              # Playwright CI on PRs and main
│   │   └── claude.yml                  # Claude Code @claude mention handler
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md               # Bug report template
│   │   └── test_request.md             # New test request template
│   ├── pull_request_template.md        # PR checklist
│   └── CODEOWNERS                      # Auto-assign reviewers
│
├── AGENTS.md                           # Sub-agent reference for other AI tools
├── Skills.md                           # Slash command reference for contributors
└── CLAUDE.md                           # Claude Code project instructions (authoritative)
```

---

## Architecture

### Page Object Model (POM)

Every page or major site section has a dedicated class in `src/pages/`. This separates selectors and interactions from test assertions, making tests readable and resilient to UI changes.

```
BasePage
  navigate()            — goes to site root
  waitForLoad()         — waits for networkidle
  getTitle()            — returns <title> text
  isResponsive()        — checks for horizontal overflow
  takeScreenshot()      — full-page screenshot to buffer
  checkNoConsoleErrors() — returns JS errors from page
  getLinkElements()     — all <a href> on the page
  getFormElements()     — all <form> elements

  └── HomePage extends BasePage
        getHeroText()       — above-the-fold hero text
        getCTAButtons()     — primary call-to-action elements
        getMainHeading()    — first <h1> or <h2>
        isLoaded()          — heading + nav + text present

  └── NavigationPage extends BasePage
        isNavVisible()      — nav/[role="navigation"] visible
        getNavLinks()       — [{text, href}] from primary nav
        clickNavItem()      — click nav link by text
        getMobileMenuToggle() — hamburger button or null
        openMobileMenu()    — opens mobile nav
        checkAllNavLinksReachable() — HEAD requests per link

  └── ContactFormPage extends BasePage
        findContactForm()   — Locator | null
        getFormFields()     — [{name, type, required}]
        hasEmailField()     — boolean
        hasNameField()      — boolean
        hasSubmitButton()   — boolean
        fillForm()          — fills fields WITHOUT submitting
        validateFormPresence() — email field + submit present

  └── FeaturesPage extends BasePage
        getFeatureSections()   — product feature areas
        getFeatureCards()      — individual feature cards
        getPricingTiers()      — pricing plan containers
        getCTAsForTier()       — CTAs within a pricing tier
        hasFeatureComparison() — comparison table present
        navigateToFeatures()   — goes to /features or similar
        navigateToPricing()    — goes to /pricing or similar
```

### OOP Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Inheritance** | All page objects extend `BasePage` — shared `navigate()`, `waitForLoad()`, screenshot utilities, and console error capture flow down |
| **Encapsulation** | Selectors are private to page objects; tests call public action methods, never raw `page.locator()` |
| **Abstraction** | Tests describe *what* to verify (`navigationPage.isNavVisible()`) not *how* to find elements |
| **Polymorphism** | `navigate()` calls `this.url` which each subclass can override for page-specific paths |

### Custom Fixtures

`src/fixtures/site.fixture.ts` extends Playwright's base `test` with pre-constructed page objects. All test files import from here:

```typescript
import { test, expect } from '@fixtures/site.fixture';
```

Available fixtures:

| Fixture | Type | Auto-navigates |
|---------|------|---------------|
| `siteConfig` | `SiteConfig` | — |
| `homePage` | `HomePage` | Yes (to root URL) |
| `navigationPage` | `NavigationPage` | No |
| `contactPage` | `ContactFormPage` | No |
| `featuresPage` | `FeaturesPage` | No |

### TypeScript Path Aliases

| Alias | Resolves to |
|-------|------------|
| `@pages/*` | `src/pages/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@utils/*` | `src/utils/*` |
| `@types/*` | `src/types/*` |

### Test Tags

Every test must carry at least one tag. Tags are used to run subsets:

| Tag | `npm run` | When to use |
|-----|-----------|-------------|
| `@smoke` | `test:smoke` | Site loads, HTTPS, title, no critical JS errors |
| `@navigation` | `test:navigation` | Nav structure, link reachability, mobile menu |
| `@forms` | `test:forms` | Form fields, labels, HTML5 validation (no submission) |
| `@functional` | — | Business features: event tools, pricing, CTAs, search |
| `@visual` | `test:visual` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | `test:responsive` | Layout at 390px (mobile), 768px (tablet), 1280px (desktop) |

---

## Slash Commands

Run these inside a Claude Code session (`claude` in your terminal):

| Command | What it does |
|---------|-------------|
| `/analyze-site` | Crawls the live site, extracts nav, forms, headings, CTAs. Outputs a populated `site.config.json` + issues checklist. |
| `/generate-full-suite` | Analyzes the live site and generates complete POM classes and test specs covering all discovered pages. |
| `/run-smoke` | Runs `@smoke` tests and reports results with failure details and suggestions. |
| `/update-baseline` | Runs `npm run baseline` to regenerate visual regression snapshots after an intentional design change. |
| `/generate-report` | Parses `test-results/results.json` and displays a formatted table of pass/fail counts per suite. |

---

## CI/CD

### On pull requests — `playwright.yml`

Triggers on: `pull_request` to `main` or `develop`

1. Installs Node 20 + Playwright browsers
2. Runs `npm run typecheck` and `npm run lint`
3. Runs `@smoke` and `@navigation` tests on `chromium-desktop`
4. Uploads HTML report as artifact (retained 30 days)

### On push to `main` — `playwright.yml`

Runs the full test suite across all three browser projects:
- `chromium-desktop` (1280×720)
- `mobile-chrome` (390×844)
- `tablet` (768×1024)

### Claude Code integration — `claude.yml`

Mention `@claude` in any PR or issue comment to trigger Claude Code:

```
@claude why is this test failing and how should I fix it?
@claude add @functional tests for the demo request page
@claude update the contact form selectors after the redesign
@claude run /analyze-site and update site.config.json
```

### Required secrets

Add to your repository's **Settings → Secrets and variables → Actions**:

| Secret | Required for |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Claude Code GitHub Action |

---

## Contributing

### Rules (from CLAUDE.md — read this first)

- **Never submit forms** — tests interact with fields but never click Submit in a way that sends data
- **Never hardcode URLs** — always use `siteConfig.url` from the fixture
- **Never put `expect()` inside page objects** — assertions belong in test files only
- **Always extend `BasePage`** — for any new page object
- **Always tag tests** — every `test()` needs at least one `@tag`
- **Always run `typecheck`** — `npm run typecheck` must pass before committing

### Adding a new page

1. Create `src/pages/<name>.page.ts` extending `BasePage`
2. Add `readonly` Locator properties to the class
3. Add action methods (no assertions)
4. Register it in `src/fixtures/site.fixture.ts`
5. Write tests in `tests/<category>/<name>.spec.ts`
6. Run `npm run typecheck && npm run lint`

### Selector strategy (preference order)

1. `getByRole('button', { name: /text/i })` — semantic, accessible
2. `getByLabel()` / `getByPlaceholder()` — form fields
3. `getByText(/text/i)` — visible text
4. `locator('[data-testid="..."]')` — explicit test IDs
5. `locator('CSS selector')` — last resort; avoid dynamic class names

### Committing visual baselines

After any intentional UI change:

```bash
npm run baseline
git add __snapshots__
git commit -m "chore: update visual baselines — [describe what changed]"
```

### Pull request checklist

See `.github/pull_request_template.md` — it's pre-loaded when you open a PR.

Key items:

- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] New page objects extend `BasePage`
- [ ] No assertions inside page object methods
- [ ] No hardcoded URLs
- [ ] No form submissions
- [ ] Visual baselines updated if layout changed
- [ ] All new tests carry at least one `@tag`

---

*QA Agentic Solution — Powered by Playwright + TypeScript + Claude Code*
