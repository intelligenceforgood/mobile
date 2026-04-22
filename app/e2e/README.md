# E2E Tests — Maestro

The `e2e/flows/` directory contains [Maestro](https://maestro.mobile.dev/) flow files for end-to-end smoke testing against a running `i4g-local` instance.

## Prerequisites

1. Install the Maestro CLI:

   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

   See [Maestro installation docs](https://maestro.mobile.dev/getting-started/installing-maestro) for full instructions.

2. Start `i4g-local` (see `core/docs/runbooks/local-aio.md`).

3. Build and run the dev app on a simulator or device:
   ```bash
   cd mobile/app
   pnpm dev:ios   # or pnpm dev:android
   ```

## Running a flow

```bash
maestro test e2e/flows/happy-path.yaml
```

## Flow inventory

| File              | Coverage                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `happy-path.yaml` | Launch → sign in as local analyst → Dashboard metrics visible → Queue tab visible with rows |

## CI integration

Maestro CI wiring is planned for Sprint 5. The YAML files are present so they can be validated locally today.
