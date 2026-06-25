# i4g Mobile

[![Mobile CI](https://github.com/intelligenceforgood/mobile/actions/workflows/mobile-ci.yml/badge.svg)](https://github.com/intelligenceforgood/mobile/actions/workflows/mobile-ci.yml)
[![Design Tokens CI](https://github.com/intelligenceforgood/mobile/actions/workflows/design-tokens-ci.yml/badge.svg)](https://github.com/intelligenceforgood/mobile/actions/workflows/design-tokens-ci.yml)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK_56-black.svg?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactnative.dev)
[![Style Dictionary](https://img.shields.io/badge/Style_Dictionary-v5.4-orange.svg?style=flat&logo=style-dictionary&logoColor=white)](https://styledictionary.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v22_LTS-339933.svg?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![JDK](https://img.shields.io/badge/JDK-21-red.svg?logo=oracle&logoColor=white)](https://openjdk.org)
[![iOS Target](https://img.shields.io/badge/iOS-15.1%2B-blue.svg?logo=apple&logoColor=white)](https://developer.apple.com/ios/)
[![Android Target](https://img.shields.io/badge/Android-SDK_34%2B-green.svg?logo=android&logoColor=white)](https://developer.android.com/about/versions/14)

Top-level workspace for native clients (iOS + Android). Mirrors the separation used by `core/` (Python), `ui/` (Next.js), and `infra/` (Terraform).

## Structure
- `app/ios/` — SwiftUI app skeleton and native tooling.
- `app/android/` — Jetpack Compose app skeleton and native tooling.
- `shared/` — Cross-platform assets (design tokens, API schemas).
- `docs/` — Mobile-specific PRD/TDD/roadmap (mirrors `planning/mobile` in core).

## Getting Started

### Prerequisites
- **Node.js:** `22` LTS or higher
- **Package Manager:** `pnpm` `9`+ or `11`+
- **JDK:** Java Development Kit `21`

### Build Environments
- **iOS:** macOS, Xcode `16`+, Swift `5.10`+, CocoaPods; run `pod install` in `app/ios/` and launch.
- **Android:** Android SDK `34`+ (compileSdk `36`); build via `./gradlew assembleDebug` inside `app/android/`.

Next steps: fill in app modules, CI, and token/codegen wiring.
