const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const path = require('path')

// Find the monorepo root
const monorepoRoot = path.resolve(__dirname, '../..')

const defaultConfig = getDefaultConfig(__dirname)

const config = {
  // Watch all packages in the monorepo
  watchFolders: [monorepoRoot],

  resolver: {
    // Ensure Metro can resolve workspace packages
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    // Disable package exports resolution to avoid issues with workspace:* packages
    unstable_enablePackageExports: false,
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}

module.exports = mergeConfig(defaultConfig, config)
