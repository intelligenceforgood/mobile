.DEFAULT_GOAL := help

SIMULATOR_APP := /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app

# ── Simulator lifecycle ────────────────────────────────────────────────────────

.PHONY: sim-open sim-close sim-list

sim-open: ## Boot the iOS Simulator (opens last-used device)
	open $(SIMULATOR_APP)

sim-close: ## Shut down all running simulators
	xcrun simctl shutdown all

sim-list: ## List available simulator devices
	xcrun simctl list devices available

# ── App development ───────────────────────────────────────────────────────────

.PHONY: ios android tokens install

ios-build: ## FIRST TIME ONLY — compile native Xcode project and install on Simulator (~5-10 min)
	cd app && pnpm run run:ios

ios: ## Start Metro + connect to installed dev build (run ios-build first if not yet installed)
	cd app && pnpm run dev:ios

ios-fresh: ## Like ios, but kills any running Metro first and clears cache (use after config changes)
	-pkill -f "expo start" 2>/dev/null; true
	cd app && pnpm expo start --dev-client --ios --clear

android-build: ## FIRST TIME ONLY — compile native Android project and install on Emulator
	cd app && pnpm run run:android

android: ## Start Metro + connect to installed dev build (run android-build first if not yet installed)
	cd app && pnpm run dev:android

android-fresh: ## Like android, but kills any running Metro first and clears cache
	-pkill -f "expo start" 2>/dev/null; true
	cd app && pnpm expo start --dev-client --android --clear

tokens: ## Rebuild design tokens (generates dist/tokens.ts)
	cd shared/design-tokens && node scripts/build.js

install: ## Install app dependencies
	cd app && pnpm install

# ── Quality ───────────────────────────────────────────────────────────────────

.PHONY: lint typecheck test metro-check check

lint: ## Run ESLint
	cd app && pnpm run lint

typecheck: ## Run TypeScript type check
	cd app && pnpm run typecheck

test: ## Run Jest tests
	cd app && pnpm run test

metro-check: ## Dry-run Metro resolver — catches import errors without launching simulator
	cd app && pnpm expo export --platform ios --output-dir /tmp/metro-check-output 2>&1 | grep -E '^(error|Error|✗|×).*:(Cannot|Unable|Failed|bundling failed)' || echo "✓ No bundle errors"
	@rm -rf /tmp/metro-check-output

android-logs: ## Print last Android crash from emulator (requires adb in PATH)
	adb logcat -d | grep -A 20 "FATAL EXCEPTION" | tail -60

check: lint typecheck test ## Run all quality checks (no simulator needed)

# ── Help ──────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
