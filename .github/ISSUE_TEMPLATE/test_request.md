---
name: Test request
about: Request new tests for a page, feature, or regression scenario
title: "[TEST] "
labels: test-request
assignees: ''
---

## What needs to be tested?

<!-- Describe the page, feature, or user flow to cover. -->

## Page or URL path

```
<!-- e.g., /pricing, /features/attendee-management, /blog -->
```

## Suggested test scenarios

<!-- List what should be verified. Claude Code will implement these. -->

- [ ] ...
- [ ] ...
- [ ] ...

## Test category

- [ ] `@smoke` — availability check
- [ ] `@navigation` — nav links or routing
- [ ] `@forms` — form fields and validation
- [ ] `@functional` — business feature logic
- [ ] `@visual` — screenshot regression
- [ ] `@responsive` — mobile/tablet layout

## Context

<!-- Why is this test needed? Bug regression? New feature? Client request? -->

## Do not

<!-- List anything Claude must not do in these tests -->

- [ ] Submit the form
- [ ] Create an account
- [ ] Enter real credentials

---

> To generate these tests automatically: `@claude add @functional tests for [page/feature]`
