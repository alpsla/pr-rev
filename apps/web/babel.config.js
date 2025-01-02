module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          useBuiltIns: false,
          corejs: false
        }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true
    }],
    '@babel/plugin-transform-class-static-block'
  ]
};
