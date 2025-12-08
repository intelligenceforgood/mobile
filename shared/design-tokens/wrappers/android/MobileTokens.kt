package com.i4g.design.tokens

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// Lightweight wrapper around generated tokens. Replace literal values with a parser over dist/tokens.json if desired.
object MobileTokens {
    object ColorTokens {
        val BrandPrimary = Color(0xFF0050B3)
        val BrandSecondary = Color(0xFF1890FF)
        val SurfaceBase = Color(0xFFFFFFFF)
        val SurfaceMuted = Color(0xFFF5F5F5)
        val TextPrimary = Color(0xFF111111)
        val TextMuted = Color(0xFF4F4F4F)
    }

    object Spacing {
        val xs = 4.dp
        val sm = 8.dp
        val md = 12.dp
        val lg = 16.dp
        val xl = 24.dp
    }
}
