import StyleDictionary from 'style-dictionary';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensPath = path.join(__dirname, '..', 'tokens', 'tokens.json');

StyleDictionary.extend({
  source: [tokensPath],
  platforms: {
    json: {
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json',
        },
      ],
    },
    iosSwift: {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios/',
      files: [
        {
          destination: 'DesignTokens.swift',
          format: 'ios-swift/class.swift',
          className: 'DesignTokens',
        },
      ],
    },
    androidXml: {
      transformGroup: 'android',
      buildPath: 'dist/android/',
      files: [
        {
          destination: 'tokens.colors.xml',
          format: 'android/resources',
        },
      ],
    },
    webCss: {
      transformGroup: 'css',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
}).buildAllPlatforms();
