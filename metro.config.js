const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Enable minification for smaller bundle size
  // TEMPORARILY DISABLED FOR DEBUGGING
  /*
  transformer: {
    minifierPath: require.resolve('metro-minify-terser'),
    minifierConfig: {
      // Optimize for smaller bundle size
      ecma: 8,
      keep_fnames: false,
      mangle: {
        keep_fnames: false,
      },
      compress: {
        drop_console: false, // Keep console logs for debugging, set to true for production
      },
    },
  },
  
  // Optimize resolver for better tree shaking
  resolver: {
    // Enable tree shaking for better dead code elimination
    unstable_enablePackageExports: true,
  },
  */
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
