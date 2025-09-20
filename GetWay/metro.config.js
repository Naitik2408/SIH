const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for React Native compatibility
config.resolver.alias = {
  'react-dom': 'react-native',
  'react-dom/client': 'react-native',
};

// Ensure certain packages are resolved correctly
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;
