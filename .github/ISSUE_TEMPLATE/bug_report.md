---
name: Bug report
about: A test is failing, flaky, or producing incorrect results
title: "[BUG] "
labels: bug
assignees: ''
---

## Test failing

<!-- File path and test name -->

```
tests/<category>/<file>.spec.ts — "<test name>"
```

## Environment

- Browser project: <!-- chromium-desktop / mobile-chrome / tablet -->
- Branch: <!-- main / feature/... -->
- CI run URL (if applicable): <!-- paste link -->

## Failure output

```
<!-- paste the error message or screenshot diff here -->
```

## Expected behavior

<!-- What should this test verify? -->

## Actual behavior

<!-- What is it doing instead? -->

## Possible cause

<!-- Your hypothesis: selector changed? site change? timing issue? -->

## Steps to reproduce locally

```bash
npx playwright test "<test name>" --project=chromium-desktop --headed
```

---

> Ask Claude Code for help: `@claude analyze this test failure and suggest a fix`
