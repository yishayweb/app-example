module.exports = function (api) {
  var currEnv = process.env.NODE_ENV;
  var isProd = currEnv === 'production';
  var isTest = currEnv === 'test';
  api.cache(true);
  babelConfig = {
    presets: [
      '@babel/preset-env',
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          version: '^7.16.3',
        },
      ],
      !isProd && !isTest && require.resolve('react-refresh/babel'),
    ].filter(Boolean),
  };

  return babelConfig;
};
