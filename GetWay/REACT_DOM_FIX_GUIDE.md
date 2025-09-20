# 🔧 Fix: "Unable to resolve react-dom" Error

## ❌ Error Message
```
Unable to resolve "react-dom" from "node_modules/@clerk/clerk-react/dist/index.js"
```

## 🔍 Root Cause
- `@clerk/clerk-expo` has peer dependencies on `react-dom`
- React Native doesn't use `react-dom` (it uses native components)
- Metro bundler couldn't resolve the dependency

## ✅ Solution Applied

### 1. Install react-dom
```bash
npm install react-dom@18.2.0 --legacy-peer-deps
```

### 2. Create Metro Configuration
Created `metro.config.js` to handle React Native compatibility:
```javascript
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
```

### 3. Restart Metro with Clear Cache
```bash
npx expo start --clear
```

## 🎯 What This Fixes

1. **Dependency Resolution**: Metro can now resolve `react-dom` imports
2. **Platform Compatibility**: Maps web-specific imports to React Native equivalents
3. **Clerk Integration**: Allows `@clerk/clerk-expo` to work properly
4. **Build Process**: Eliminates bundling errors

## 🔄 Alternative Solutions

### Option 1: Use React DOM Shims
If you prefer a more minimal approach:
```javascript
// metro.config.js
config.resolver.alias = {
  'react-dom': require.resolve('react-native-web/dist/cjs/react-dom'),
};
```

### Option 2: Mock react-dom
Create a mock file:
```javascript
// react-dom-mock.js
module.exports = require('react-native');
```

Then alias it in metro.config.js:
```javascript
config.resolver.alias = {
  'react-dom': path.resolve(__dirname, 'react-dom-mock.js'),
};
```

## 📋 Verification Steps

1. ✅ Metro server starts without errors
2. ✅ QR code displays for development
3. ✅ App builds successfully
4. ✅ Clerk authentication works
5. ✅ No more "react-dom" resolution errors

## 🚨 Prevention Tips

1. **Check Dependencies**: Always verify React Native compatibility
2. **Use Correct Packages**: Use `@clerk/clerk-expo` not `@clerk/clerk-react`
3. **Metro Configuration**: Set up aliases for web-only dependencies
4. **Version Matching**: Keep React and React DOM versions aligned

## 📦 Final Package State

```json
{
  "dependencies": {
    "@clerk/clerk-expo": "^2.15.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.72.10"
  }
}
```

## 🔗 Related Files
- `metro.config.js` - Metro bundler configuration (created)
- `package.json` - Updated dependencies
- `node_modules/@clerk/clerk-expo` - Now resolves correctly

---

**✅ Issue Resolved**: React DOM dependency conflicts are now handled properly, and Clerk authentication works in React Native.
