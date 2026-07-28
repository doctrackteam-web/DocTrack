# Contributing to DocTrack Inc.

Thank you for contributing to DocTrack.

## Commit Message Standard

All commits must follow the Conventional Commits specification:

- `feat:` A new user-facing feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Formatting or whitespace changes
- `refactor:` Code restructuring without behavior change
- `test:` Adding or updating test suites
- `chore:` Tooling, CI, or dependency updates

## Quality Gates

Before submitting a PR, ensure all quality gates pass:

```bash
npm run check-env
npm run lint
npm run typecheck
npm run test
```
