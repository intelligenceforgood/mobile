# Gemini Code Assist Context for i4g/mobile

**Unified Workspace Context:** This repository is part of the unified `i4g` parent workspace. Shared coding standards, routines, and platform context live in the `gemini` repo's styles directory (symlinked at the parent root). GCA will implicitly apply this file's context whenever you work within the `mobile/` directory.

## GCA Framework & Workflows

- **Agent Mode Management:** Keep Agent Mode **OFF** for standard queries, isolated code reviews, and planning to conserve quota. Toggle **ON** strictly for autonomous multi-file execution or terminal tasks.
- **Standardized Prompts:** Use the standard VSCode snippets (`gca-plan`, `gca-prd`, `gca-impl`, `gca-work`) to trigger routine workflows.
- **Global Standards:** Broad coding conventions are referenced from `.gemini/styles/` (symlinked to the `gemini` repository).

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
