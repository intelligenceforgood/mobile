# Mobile Design Tokens

This package builds platform-ready design tokens for iOS, Android, and web consumers. It reads the planning token stub and emits platform-specific artifacts using Style Dictionary.

## Layout

- `tokens/` — source tokens (JSON).
- `scripts/` — build scripts.
- `dist/` — generated outputs (ignored in VCS).

## Usage

```bash
npm install
# Pull tokens from planning stub (override with SOURCE_TOKENS_PATH as needed)
npm run export
# Generate platform outputs
npm run build
# Run lint + build (CI helper)
npm run ci
```

By default, the export script reads `../../../../planning/mobile/tokens.json` relative to this package; set `SOURCE_TOKENS_PATH` to point at the canonical `ui/` tokens once available.

See `PLATFORM_WRAPPERS.md` for Swift/Compose sketches and `wrappers/` for starter helper modules (iOS, Android, web) backed by the current stub tokens.
