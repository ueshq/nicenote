const { makeMetroConfig, exclusionList } = require('@rnx-kit/metro-config')

const fs = require('fs')
const path = require('path')

const rnwPath = fs.realpathSync(
  path.resolve(require.resolve('react-native-windows/package.json'), '..'),
)

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * Uses @rnx-kit/metro-config for pnpm monorepo support:
 * - Automatically resolves @babel/runtime via metro-runtime chain
 * - Adds watchFolders for all workspace packages
 * - Resolves unique copies of react, react-native, react-native-windows, etc.
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = makeMetroConfig({
  resolver: {
    // Required for workspace packages that expose `exports` instead of `main`
    unstable_enablePackageExports: true,
    // When Metro follows symlinks into workspace packages (e.g. packages/database/src/),
    // the resolver searches from that real path and misses app-level node_modules.
    // Adding the app's node_modules here ensures transitive deps are always found.
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    blockList: exclusionList([
      // Prevent metro from watching the Windows build output directory
      new RegExp(`${path.resolve(__dirname, 'windows').replace(/[/\\]/g, '/')}.*`),
      // Prevent EBUSY errors from msbuild artifacts
      new RegExp(`${rnwPath}/build/.*`),
      new RegExp(`${rnwPath}/target/.*`),
      /.*\.ProjectImports\.zip/,
    ]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
})
