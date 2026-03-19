# Copilot Instructions for i4g/mobile

**Unified Workspace Context:** This repository is part of the `i4g` multi-root workspace. Shared coding standards, routines, and platform context live in the `copilot/` repo. These instructions contain only repo-specific context.

## Purpose

This repo contains the mobile design token system for the I4G Platform. Design tokens are the single source of truth for colors, spacing, typography, and other visual values across iOS, Android, and web.

## Structure

```
mobile/
└── shared/
    └── design-tokens/
        ├── tokens/tokens.json      # Token source of truth
        ├── scripts/
        │   ├── build.js            # Token build script
        │   └── export.js           # Platform export script
        └── wrappers/
            ├── ios/MobileTokens.swift
            ├── android/MobileTokens.kt
            └── web/
```

## Conventions

- All styling values must come from design tokens in `shared/design-tokens/` — never hard-code colors or spacing.
- TypeScript: `camelCase` for variables/functions, `PascalCase` for types/components.
- Swift: follow Apple naming conventions (camelCase methods, PascalCase types).
- Kotlin: follow Android naming conventions.

## Build Tokens

```bash
cd shared/design-tokens
node scripts/build.js     # Builds all platform outputs
```

