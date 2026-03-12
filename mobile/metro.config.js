const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Prefer "main" over "exports" to avoid ESM resolution issues with @react-navigation/bottom-tabs
config.resolver.unstable_enablePackageExports = false;

// Explicit resolution for @expo/vector-icons (avoids "Unable to resolve" with custom metro config)
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@expo/vector-icons': path.resolve(__dirname, 'node_modules/@expo/vector-icons'),
};

// Exclude Android build dirs from Metro (avoids ENOENT when CMake creates/deletes .cxx during build)
config.resolver.blockList = [
  /.*\/android\/app\/\.cxx\/.*/,
  /.*\/android\/\.gradle\/.*/,
  /.*\/android\/build\/.*/,
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
];

module.exports = withNativeWind(config, { input: './global.css' });
