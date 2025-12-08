import SwiftUI

// Lightweight wrapper around generated tokens. Replace literal values by reading dist/tokens.json at build time if desired.
public struct MobileTokens {
    public static let colorBrandPrimary = Color(hex: "#0050b3")
    public static let colorBrandSecondary = Color(hex: "#1890ff")
    public static let colorSurfaceBase = Color(hex: "#ffffff")
    public static let colorSurfaceMuted = Color(hex: "#f5f5f5")
    public static let colorTextPrimary = Color(hex: "#111111")
    public static let colorTextMuted = Color(hex: "#4f4f4f")

    public struct Spacing {
        public let xs: CGFloat = 4
        public let sm: CGFloat = 8
        public let md: CGFloat = 12
        public let lg: CGFloat = 16
        public let xl: CGFloat = 24
    }

    public static let spacing = Spacing()
}

public extension Color {
    init(hex: String) {
        let sanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1.0)
    }
}
