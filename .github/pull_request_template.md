## Summary

<!-- What does this PR do? One sentence. -->

## Type of change

- [ ] New test(s)
- [ ] Updated selector(s) or page object(s)
- [ ] Bug fix in existing test
- [ ] Visual baseline update
- [ ] CI/CD or tooling change
- [ ] Documentation

## Test coverage

<!-- Which test categories are affected? -->

- [ ] `@smoke`
- [ ] `@navigation`
- [ ] `@forms`
- [ ] `@functional`
- [ ] `@visual`
- [ ] `@responsive`

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (or smoke/nav subset if full suite can't run locally)
- [ ] All new `test()` calls carry at least one `@tag`
- [ ] New page objects extend `BasePage`
- [ ] No `expect()` calls inside page object methods
- [ ] No hardcoded URLs (using `siteConfig.url`)
- [ ] No form submissions triggered
- [ ] Visual baselines updated if layout changed (`npm run baseline` + committed `__snapshots__/`)

## Notes for reviewers

<!-- Anything the reviewer should know: flaky areas, intentional skips, edge cases. -->
