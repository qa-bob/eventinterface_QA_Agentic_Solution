# AGENTS.md — Eventinterface QA Agentic Solution

> **Claude Code users**: Claude Code reads `CLAUDE.md`, not this file.
> This file documents sub-agents and project conventions for AI tools that use `AGENTS.md` (Copilot Agents, OpenAI Codex, etc.).
> For full project rules, see `CLAUDE.md`.

---

## Project Purpose

This repository is a **Playwright + TypeScript regression test suite** for
[Eventinterface](https://www.eventinterface.com) — an end-to-end meeting and event
planning platform. It uses a **Page Object Model (POM)** architecture and is
structured for agentic execution.

**Target site**: defined in `site.config.json` (`url` field)
**Do not**: submit forms, create accounts, hardcode URLs, or put assertions inside page objects.

---

## Available Sub-Agents

### `site-analyzer`

**File**: `.claude/agents/site-analyzer.md`
**Invoke with**: `/analyze-site`

Crawls the live Eventinterface website and produces a fully-populated `site.config.json`.

**Inputs**

| Input | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Site URL to analyze |
| `companyName` | No | Override for company name |

**Output**: A valid `site.config.json` with all fields populated from live site inspection, plus an issues checklist.

**When to invoke**:
- Onboarding a new company repo
- Verifying `site.config.json` is accurate after a site redesign
- Running `/analyze-site` slash command

---

### `test-generator`

**File**: `.claude/agents/test-generator.md`
**Invoke with**: `/generate-full-suite`

Reads a populated `site.config.json` and generates site-specific Playwright TypeScript test files.

**Inputs**

| Input | Required | Description |
|-------|----------|-------------|
| `siteConfig` | Yes | Populated `site.config.json` |
| `testScenarios` | No | Specific scenarios to cover |
| `pagesToTest` | No | List of page paths (e.g., `/pricing`) |

**Output**: TypeScript spec files in `tests/custom/` or the appropriate category directory.

**When to invoke**:
- Site has unique functionality beyond the shared test suites
- After `site-analyzer` discovers new pages or features
- Generating regression tests for a recently discovered bug

---

## Conventions for All Agents

Any agent generating or modifying code in this repository must follow these rules:

### Imports

```typescript
// Always import from the custom fixture — never from @playwright/test directly
import { test, expect } from '@fixtures/site.fixture';
```

### Page Object Model

- All new page classes extend `BasePage` from `@pages/base.page`
- Selectors are `readonly Locator` properties on the class
- Methods represent user actions — no `expect()` inside page objects
- Register new page objects in `src/fixtures/site.fixture.ts`

### Tests

- Tag every test with at least one: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- Use `siteConfig.url` from fixtures — never hardcode URLs
- Never submit forms
- Use `waitForSelector` or Playwright auto-waiting — never `waitForTimeout()`

### TypeScript

- Strict mode is on — no `as any` without an explicit comment explaining why
- Run `npx tsc --noEmit` before completing any code generation task

### File naming

- Page objects: `src/pages/<kebab-case>.page.ts`
- Test files: `tests/<category>/<kebab-case>.spec.ts`
- Custom site-specific tests: `tests/custom/<description>.spec.ts`

---

## Test Tag Reference

| Tag | npm script | What to cover |
|-----|-----------|---------------|
| `@smoke` | `test:smoke` | Site loads, title, HTTPS, no critical JS errors |
| `@navigation` | `test:navigation` | Nav links, routing, mobile menu |
| `@forms` | `test:forms` | Form fields, labels, HTML5 validation — no submit |
| `@functional` | — | Business features: pricing, event tools, CTAs |
| `@visual` | `test:visual` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | `test:responsive` | Layout at 390px, 768px, 1280px |

---

## Project Structure Reference

```
src/pages/          Page Object Model classes (extend BasePage)
src/fixtures/       Custom Playwright test fixtures
src/utils/          Shared helpers (link checker, visual helper)
src/types/          TypeScript interfaces
tests/smoke/        @smoke tests
tests/navigation/   @navigation tests
tests/forms/        @forms tests
tests/functional/   @functional tests
tests/visual/       @visual tests
tests/responsive/   @responsive tests
tests/custom/       Site-specific generated tests
.claude/agents/     Sub-agent definitions
.claude/commands/   Slash command definitions (skills)
```

See `README.md` for full setup, run instructions, and contribution guide.
See `CLAUDE.md` for authoritative architecture rules and agent behavior.
