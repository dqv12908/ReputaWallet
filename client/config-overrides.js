const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallbacks for node core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    util: require.resolve('util/'),
    assert: require.resolve('assert/'),
  };

  // Add plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'process.version': JSON.stringify(process.version),
      'process.platform': JSON.stringify(process.platform),
      'process.browser': true,
    }),
  ];

  // Add alias for process/browser
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser'),
  };

  // Add process polyfill to entry points
  if (Array.isArray(config.entry)) {
    config.entry = ['process/browser', ...config.entry];
  } else if (typeof config.entry === 'object') {
    Object.keys(config.entry).forEach(key => {
      if (Array.isArray(config.entry[key])) {
        config.entry[key] = ['process/browser', ...config.entry[key]];
      }
    });
  }

  // Add module rules for process/browser
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
}; 