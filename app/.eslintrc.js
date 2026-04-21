module.exports = {
  extends: 'expo',
  rules: {
    // No severity overrides needed beyond what expo config provides.
    // Keep aligned with ui/.eslintrc.json (which extends next/core-web-vitals).
    //
    // Disable import/no-unresolved for the cross-directory design-tokens path
    // (TypeScript tsc handles this correctly; the ESLint resolver cannot follow
    // relative paths that escape the mobile/app/ package boundary).
    'import/no-unresolved': 'off',
  },
};
