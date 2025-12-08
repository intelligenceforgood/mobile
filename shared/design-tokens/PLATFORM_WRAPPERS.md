# Platform Wrapper Sketches

These sketches show how to consume the generated Style Dictionary outputs. Adjust names/paths to match your app projects.

## iOS (Swift)
- Input: `dist/ios/DesignTokens.swift`
- Approach: wrap in a theme struct and expose helpers for `Color`, `Font`, spacing.

```swift
import SwiftUI

struct MobileTheme {
    let colors = DesignTokens.Color.self
    let spacing = DesignTokens.Spacing.self

    var primaryText: Color { Color(hex: colors.textPrimary) }
    var surface: Color { Color(hex: colors.surfaceBase) }
    var paddingSm: CGFloat { CGFloat(spacing.sm) }
}

extension Color {
    init(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1.0)
    }
}
```

## Android (Jetpack Compose)
- Input: `dist/android/tokens.colors.xml` (plus other exports if added)
- Approach: load resources into a `ColorScheme` and spacing/radius objects.

```kotlin
import androidx.compose.material3.ColorScheme
import androidx.compose.ui.graphics.Color

object MobileTokens {
    val PrimaryText = Color(0xFF111111) // replace with generated values
    val Surface = Color(0xFFFFFFFF)
    val Spacing = SpacingTokens()
}

class SpacingTokens {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
}

val MobileColorScheme = ColorScheme(
    primary = MobileTokens.PrimaryText,
    onPrimary = Color.White,
    secondary = Color(0xFF1890FF),
    onSecondary = Color.White,
    surface = MobileTokens.Surface,
    onSurface = MobileTokens.PrimaryText,
    background = MobileTokens.Surface,
    onBackground = MobileTokens.PrimaryText,
    error = Color(0xFFB00020),
    onError = Color.White,
    primaryContainer = MobileTokens.PrimaryText,
    onPrimaryContainer = Color.White,
    secondaryContainer = Color(0xFF1890FF),
    onSecondaryContainer = Color.White,
    tertiary = Color(0xFF4F4F4F),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFF4F4F4F),
    onTertiaryContainer = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    outline = Color(0xFFB0B0B0),
    outlineVariant = Color(0xFFE0E0E0),
    scrim = Color(0x66000000),
    surfaceVariant = Color(0xFFF5F5F5),
    onSurfaceVariant = Color(0xFF4F4F4F),
    inverseSurface = Color(0xFF111111),
    inverseOnSurface = Color(0xFFF5F5F5),
    inversePrimary = Color(0xFF0050B3),
    surfaceTint = Color(0xFF0050B3)
)
```

## Web (CSS)
- Input: `dist/web/tokens.css`
- Approach: import CSS variables into your web app or Storybook to validate parity.

```css
:root {
  /* from generated CSS */
  --color-brand-primary: #0050b3;
}
```
