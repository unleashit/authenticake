module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // debug: true,
        targets: '> .5%, not ie <= 11',
        useBuiltIns: 'usage',
        corejs: '3.6.5',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
