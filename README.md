# i4g Mobile

Top-level workspace for native clients (iOS + Android). Mirrors the separation used by `core/` (Python), `ui/` (Next.js), and `infra/` (Terraform).

## Structure
- `ios/` — SwiftUI app skeleton and tooling.
- `android/` — Jetpack Compose app skeleton and tooling.
- `shared/` — Cross-platform assets (design tokens, API schemas).
- `docs/` — Mobile-specific PRD/TDD/roadmap (mirrors `planning/mobile` in core).

## Getting Started
- iOS: Xcode 15+, Swift 5.9+, `bundle install && bundle exec fastlane` (once added).
- Android: JDK 17, AGP 8.x, Gradle wrapper; build via `./gradlew assembleDebug`.

Next steps: fill in app modules, CI, and token/codegen wiring.
