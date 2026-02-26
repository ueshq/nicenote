/* eslint-disable no-undef */
module.exports = {
  presets: ['@react-native/babel-preset'],
  // Required for Zod v4 which uses `export * as namespace` syntax
  plugins: ['@babel/plugin-transform-export-namespace-from'],
}
