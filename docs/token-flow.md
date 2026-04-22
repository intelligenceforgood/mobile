# Design Token Flow

This document describes how design tokens flow from the shared source of truth into the mobile app.

## Source of truth

`mobile/shared/design-tokens/tokens/tokens.json` — a single JSON file that defines all colours,
spacing, typography, and other visual values for the I4G design system.

## Build pipeline

The build script at `mobile/shared/design-tokens/scripts/build.js` uses **Style Dictionary** to
transform `tokens.json` into platform-specific outputs:

| Output     | Location                                      | Consumer                      |
| ---------- | --------------------------------------------- | ----------------------------- |
| TypeScript | `mobile/shared/design-tokens/dist/tokens.ts`  | mobile app via symlink / copy |
| Swift      | `mobile/app/wrappers/ios/MobileTokens.swift`  | iOS native (future)           |
| Kotlin     | `mobile/app/wrappers/android/MobileTokens.kt` | Android native (future)       |

Run the build:

```bash
cd mobile/shared/design-tokens
npm run build
```

## Integration in the app

The generated `tokens.ts` is copied into `mobile/app/src/design/tokens.ts` by `make tokens`
(run from the `mobile/` root). **Do not edit `src/design/tokens.ts` manually** — changes will
be overwritten on the next build.

The app consumes tokens through the `useTheme()` hook:

```tsx
import { useTheme } from "@/design/theme";

function MyComponent() {
  const theme = useTheme();
  return <View style={{ backgroundColor: theme.color.surface }} />;
}
```

## Adding or changing tokens

1. Edit `tokens/tokens.json`.
2. Run `npm run build` from `mobile/shared/design-tokens/`.
3. Run `make tokens` from `mobile/` to copy the output into the app.
4. Verify with `pnpm typecheck` in `mobile/app/`.
5. Commit both `tokens.json` and the updated `src/design/tokens.ts`.
