.DEFAULT_GOAL := help

SIMULATOR_APP := /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app

# ── Simulator lifecycle ────────────────────────────────────────────────────────

.PHONY: sim-open sim-close sim-list sim-kill

sim-open: ## Boot the iOS Simulator (opens last-used device)
	open $(SIMULATOR_APP)

sim-close: ## Shut down all running simulators and quit Simulator.app (full stop, like Android emulator)
	xcrun simctl shutdown all
	-killall Simulator 2>/dev/null; true

sim-list: ## List available simulator devices
	xcrun simctl list devices available

# ── App development ───────────────────────────────────────────────────────────

.PHONY: ios-build ios ios-fresh ios-url android-build android android-fresh android-url sync-ip tokens install

ios-url: ## Patch .env.local API URL → http://localhost:8000 (iOS Simulator host) — auto-called by ios targets
	@sed -i '' 's|EXPO_PUBLIC_API_BASE_URL=.*|EXPO_PUBLIC_API_BASE_URL=http://localhost:8000|' app/.env.local
	@echo "→ EXPO_PUBLIC_API_BASE_URL=http://localhost:8000"

android-url: ## Patch .env.local API URL → http://10.0.2.2:8000 (Android Emulator host) — auto-called by android targets
	@sed -i '' 's|EXPO_PUBLIC_API_BASE_URL=.*|EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000|' app/.env.local
	@echo "→ EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000"

ios-build: ios-url ## FIRST TIME ONLY — compile native Xcode project and install on Simulator (~5-10 min)
	cd app && pnpm run run:ios

ios: ios-url ## Start Metro + connect to installed dev build (run ios-build first if not yet installed)
	cd app && pnpm run dev:ios

ios-fresh: ios-url ## Like ios, but kills any running Metro first and clears cache (use after config changes)
	-pkill -f "expo start" 2>/dev/null; true
	cd app && pnpm expo start --dev-client --ios --clear

android-build: android-url ## FIRST TIME ONLY — compile native Android project and install on Emulator
	cd app && pnpm run run:android

android: android-url ## Start Metro + connect to installed dev build (run android-build first if not yet installed)
	cd app && pnpm run dev:android

android-fresh: android-url ## Like android, but kills any running Metro first and clears cache
	-pkill -f "expo start" 2>/dev/null; true
	cd app && pnpm expo start --dev-client --android --clear

sync-ip: ## Update .env.local API URL to current LAN IP (for physical device testing — overrides ios-url/android-url)
	$(eval LAN_IP := $(shell ipconfig getifaddr en0))
	@sed -i '' 's|EXPO_PUBLIC_API_BASE_URL=.*|EXPO_PUBLIC_API_BASE_URL=http://$(LAN_IP):8000|' app/.env.local
	@echo "Set EXPO_PUBLIC_API_BASE_URL=http://$(LAN_IP):8000"

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

# ── Android Demo Image (Linux x86_64, for offline demo kits) ─────────────────
#
# iOS Simulator cannot be containerised — it is macOS + Xcode exclusive.
# For browser-based iOS-like coverage on Linux, use the `web-demo` target below.
#
# Workflow:
#   1. make build-android-apk    — build a self-contained APK (needs eas-cli)
#   2. make build-android-demo   — bake APK into a linux/amd64 Docker image
#   3. make publish-android-demo — gzip + upload to Google Drive (needs rclone)
#
# Running the published image on a Linux host (KVM strongly recommended):
#   docker load < i4g-android-demo.tar.gz
#   docker run --rm -d --device /dev/kvm -p 6080:6080 i4g-android-demo
#   # Open http://localhost:6080 in a browser.

GDRIVE_FOLDER_ID     := 0AMtQF72E2PBAUk9PVA
ANDROID_DEMO_IMAGE   := i4g-android-demo
ANDROID_DEMO_APK     := docker/android-demo/app.apk
ANDROID_DEMO_TARBALL := i4g-android-demo.tar.gz

.PHONY: build-android-apk build-android-demo publish-android-demo web-demo

build-android-apk: ## Build a self-contained debug APK via EAS local (requires: npm i -g eas-cli)
	@command -v eas >/dev/null 2>&1 || { echo "❌ eas-cli not found. Install: npm install -g eas-cli"; exit 1; }
	@mkdir -p docker/android-demo
	cd app && eas build --platform android --profile dev --local --output ../$(ANDROID_DEMO_APK)
	@echo "✅ APK saved to $(ANDROID_DEMO_APK). Run 'make build-android-demo' next."

build-android-demo: ## Build the Android emulator Docker image for linux/amd64 (run build-android-apk first)
	@[[ -f $(ANDROID_DEMO_APK) ]] || { echo "❌ APK not found at $(ANDROID_DEMO_APK). Run 'make build-android-apk' first."; exit 1; }
	docker buildx build --platform linux/amd64 \
		-f docker/android-demo.Dockerfile \
		-t $(ANDROID_DEMO_IMAGE) .
	@echo "✅ Image $(ANDROID_DEMO_IMAGE) built. Run 'make publish-android-demo' to upload to Google Drive."

publish-android-demo: ## Save the Android demo image and upload to Google Drive (same folder as local AIO)
	@command -v rclone >/dev/null 2>&1 || { echo "❌ rclone not found. Install: brew install rclone && rclone config (add a remote named 'gdrive')"; exit 1; }
	@echo "📦 Saving image to $(ANDROID_DEMO_TARBALL) (this takes a few minutes)..."
	docker save $(ANDROID_DEMO_IMAGE) | gzip > $(ANDROID_DEMO_TARBALL)
	@echo "📤 Uploading to Google Drive..."
	rclone copyto $(ANDROID_DEMO_TARBALL) gdrive:$(ANDROID_DEMO_TARBALL) --drive-root-folder-id=$(GDRIVE_FOLDER_ID) --progress
	@ls -lh $(ANDROID_DEMO_TARBALL)
	@echo "✅ Upload complete."

web-demo: ## Build the Expo web bundle — Linux-friendly alternative for iOS-like demo coverage
	@echo "→ Patching .env.local API URL for web demo (localhost:8000)..."
	@sed -i '' 's|EXPO_PUBLIC_API_BASE_URL=.*|EXPO_PUBLIC_API_BASE_URL=http://localhost:8000|' app/.env.local 2>/dev/null || \
		sed -i 's|EXPO_PUBLIC_API_BASE_URL=.*|EXPO_PUBLIC_API_BASE_URL=http://localhost:8000|' app/.env.local
	cd app && pnpm exec expo export --platform web --output-dir ../dist/web
	@echo "✅ Web bundle in dist/web — serve with: npx serve dist/web"

# ── Help ──────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
