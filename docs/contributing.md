# Contributing to i4g/mobile

## Branching

- Branch off `main` for all work: `git checkout -b feat/<slug>` or `fix/<slug>`.
- Keep commits atomic and descriptive. Squash merge into `main` via PR.
- Branch names must be kebab-case. No personal names in branch names.

## Pull requests

- Fill in the PR template (description, test evidence, checklist).
- Every PR must pass CI: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Design changes must include a screenshot or screen recording.
- Tag a reviewer from the mobile channel before merging.

## Code standards

This repo follows the cross-repo conventions in [`copilot/docs/`](../../copilot/docs/) — specifically:

- **TypeScript**: full type annotations, no `any` except in test utilities.
- **React Native**: no hard-coded colours or spacing — use `useTheme()` from `@/design/theme`.
- **Design tokens**: all styling values come from `mobile/shared/design-tokens/` via the generated
  `src/design/tokens.ts`. Run `make tokens` from `mobile/` to regenerate after token changes.
- **No `console.log` of PII** — use `logger` from `@/lib/logger` which auto-redacts.
- **No raw `fetch()`** outside `src/api/` — go through the API client.

## Running locally

See [`developer-guide.md`](./developer-guide.md) for full environment setup.

```bash
cd mobile/app
pnpm install
pnpm start          # Expo dev server
pnpm test           # Jest unit/component tests
pnpm lint           # ESLint
pnpm typecheck      # TypeScript
```
