module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    // TEMPORARILY DISABLED OPTIMIZATIONS FOR DEBUGGING
    /*
    // Optimize imports for smaller bundle size
    ['@babel/plugin-transform-runtime', {
      helpers: false,
      regenerator: false,
    }],
    // Remove console.log statements in production builds
    ['transform-remove-console', {
      exclude: ['error', 'warn']
    }]
    */
  ],
  env: {
    production: {
      plugins: [
        // TEMPORARILY DISABLED FOR DEBUGGING
        /*
        // More aggressive optimizations for production
        ['transform-remove-console'],
        ['@babel/plugin-transform-react-inline-elements'],
        ['@babel/plugin-transform-react-constant-elements']
        */
      ]
    }
  }
};
