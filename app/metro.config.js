// metro.config.js
// Extends Metro's watch root to include mobile/ so that imports from
// ../../../shared/design-tokens/dist/tokens (i.e. outside mobile/app/) resolve at runtime.
// See: https://docs.expo.dev/guides/monorepos/#metro-bundler

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname; // mobile/app/
const mobileRoot = path.resolve(projectRoot, '../'); // mobile/

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Watch the whole mobile/ tree so cross-package imports resolve.
config.watchFolders = [mobileRoot];

// Prefer node_modules in mobile/app/ first, then fall back to mobile/.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(mobileRoot, 'node_modules'),
];

module.exports = config;
