# Skills.md — Slash Command Reference

Slash commands (skills) are invoked inside a Claude Code session by typing `/skill-name`.
All skills live in `.claude/commands/`. The filename (without `.md`) is the command name.

---

## Available Skills

### `/analyze-site`

**File**: `.claude/commands/analyze-site.md`

Crawls the live Eventinterface website and inspects its structure: navigation items, forms,
headings, CTAs, responsiveness, and meta tags. Outputs a fully-populated `site.config.json`
plus an issues checklist of anything that should be fixed on the site.

**Usage**:
```
/analyze-site
/analyze-site https://www.eventinterface.com
```

**Output**:
- Updated `site.config.json` with all fields populated
- Issues checklist (missing meta description, broken links, no `<h1>`, etc.)

**When to use**: First-time setup, after a site redesign, or to verify config is still accurate.

---

### `/generate-full-suite`

**File**: `.claude/commands/generate-full-suite.md`

Analyzes the live site using `WebFetch` and generates a complete set of Playwright test
files covering all discovered pages and features. Creates or updates page objects in
`src/pages/` and writes spec files across all test categories.

**Usage**:
```
/generate-full-suite
```

**Output**:
- New or updated page objects in `src/pages/`
- Spec files in `tests/smoke/`, `tests/navigation/`, `tests/forms/`, `tests/functional/`,
  `tests/visual/`, `tests/responsive/`

**When to use**: Starting from scratch, or after a major site restructure that renders existing
selectors obsolete.

---

### `/run-smoke`

**File**: `.claude/commands/run-smoke.md`

Runs the `@smoke` test suite (`npm run test:smoke`) and reports results: pass/fail counts,
failure messages, and next-step suggestions for any failures.

**Usage**:
```
/run-smoke
```

**When to use**: Quick sanity check before a full test run, or after deployment to verify
the site is up and responding correctly.

---

### `/update-baseline`

**File**: `.claude/commands/update-baseline.md`

Runs `npm run baseline` to regenerate all `@visual` screenshot baselines. Intended for use
after an intentional design change where visual differences are expected and correct.

**Usage**:
```
/update-baseline
```

**After running**: Commit the updated snapshots from `__snapshots__/`:
```bash
git add __snapshots__
git commit -m "chore: update visual baselines — [describe what changed]"
```

**When to use**: After a designer changes colors, fonts, layout, or any other visual element.

---

### `/generate-report`

**File**: `.claude/commands/generate-report.md`

Parses `test-results/results.json` and renders a formatted summary table showing pass/fail
counts per test suite, details on any failed tests, and suggestions for flaky tests.

**Usage**:
```
/generate-report
```

**Prerequisite**: Run `npm test` first to generate `test-results/results.json`.

---

## Creating a New Skill

Add a `.md` file to `.claude/commands/`:

```markdown
# /your-skill-name

One-line description of what this skill does.

## Usage

```
/your-skill-name [optional-arg]
```

## What this command does

1. Step one — what it reads or fetches
2. Step two — what it generates or modifies
3. Step three — what it outputs or reports

## Output

What the skill produces: files created/modified, terminal output format, etc.
```

The filename (without `.md`) becomes the slash command.
For skills that need supporting files, use `.claude/skills/<name>/SKILL.md` instead.

---

## GitHub Actions Integration

Skills can also be invoked via the Claude Code GitHub Action. Mention `@claude` in any
PR or issue comment with the skill name:

```
@claude run /analyze-site and update site.config.json
@claude run /generate-full-suite for the new pricing page
```

See `.github/workflows/claude.yml` for the workflow configuration.
