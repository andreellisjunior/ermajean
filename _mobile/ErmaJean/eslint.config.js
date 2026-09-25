// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    // Expo 57 adds compiler advisory rules; existing async loaders and Animated refs remain valid.
    rules: {'react-hooks/set-state-in-effect':'warn','react-hooks/refs':'warn'},
  },
]);
