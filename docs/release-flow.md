# Release Flow

This document describes the future EAS submit flow. Prototype ships via internal distribution only (see developer-guide).

## Prototype distribution (current)

The I4G mobile prototype is distributed via **Expo internal distribution** (`.apk` / `.ipa` builds shared
directly with pilot testers). No App Store or Google Play submission is required at this stage.

To create a build:

```bash
cd mobile/app
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

Distribute the resulting artifacts via the Expo dashboard or share the install link directly.

## Future: EAS Submit flow (placeholder)

Once the prototype is approved for public release:

1. Configure `eas.json` `submit` profiles with store credentials.
2. Run `eas submit --platform ios` / `eas submit --platform android`.
3. Follow the App Store Connect / Google Play Console review process.

See [Expo EAS Submit docs](https://docs.expo.dev/submit/introduction/) for full details.
