module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    // Optimize imports for smaller bundle size
    ['@babel/plugin-transform-runtime', {
      helpers: false,
      regenerator: false,
    }],
    // Remove console.log statements in production builds
    ['transform-remove-console', {
      exclude: ['error', 'warn']
    }]
  ],
  env: {
    production: {
      plugins: [
        // More aggressive optimizations for production
        ['transform-remove-console'],
        ['@babel/plugin-transform-react-inline-elements'],
        ['@babel/plugin-transform-react-constant-elements']
      ]
    }
  }
};
