module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'commonjs'
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: { version: 3, proposals: true },
      helpers: true,
      regenerator: true,
      useESModules: false,
      version: '^7.26.0'
    }],
  ],
};
