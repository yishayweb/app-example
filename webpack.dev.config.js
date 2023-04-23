const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const dotenv = require('dotenv');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const openBrowser = require('react-dev-utils/openBrowser');
const webpack = require('webpack');
const path = require('path');

module.exports = (env) => {
  const envKeys = dotenv?.config()?.parsed;
  return {
    entry: './src/index.tsx',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, './build'),
      publicPath: '/',
    },
    mode: process.env.NODE_ENV,
    devServer: {
      static: path.join(__dirname, 'build'),
      historyApiFallback: true,
      port: 4000,
      // this option will open a new tab in the browser anytime we run the webpack dev server
      // it is in comment because we use the openBrowser in the onAfterSetupMiddleware
      // open: true,
      hot: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          router: () => 'http://localhost:8101',
        },
      },
      onAfterSetupMiddleware: () => {
        // this will reuse an existing opned tab in the browser that is on http://localhost:4000
        // notice that if you have multiple tabs open on http://localhost:4000 it will reuse
        // the first one in the tabs order
        openBrowser('http://localhost:4000');
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              envName: process.env.NODE_ENV,
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
              },
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: true,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        // the aliases solve the issue with npm/yarn link
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        react: require.resolve('react'),
        // we need this alias because the calendar package uses component-lib as a peer dependency and
        // because of that, when we yarn link the calendar package it uses the copy of
        // the component-lib it has under its node_modules. this causes an issue
        // with @emotion/react having a double copy. this alias instruct it to use
        // the component-lib copy that we use in the app (the one that is directlry
        // in node_modules/@atbay)
        '@atbay/component-lib': path.resolve(
          './node_modules/@atbay/component-lib',
        ),
        // this alias is for the same reason as the previous one just for when
        // we link component-lib and use the remote package of theming
        '@atbay/theming': path.resolve('./node_modules/@atbay/theming'),
        // since we use the theming package we also need to make an alias for @emotion/react when we
        // make a link to component-lib or theming (when we link both it works without this alias)
        '@emotion/react': path.resolve('./node_modules/@emotion/react'),
        // '@mui/material': path.resolve('./node_modules/@mui/material'), // only needed if material ui is a dependency
      },
    },
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        favicon: './assets/images/favicon.png',
        inject: 'body',
      }),
      new CleanWebpackPlugin(),
      new ReactRefreshWebpackPlugin(),
      new webpack.DefinePlugin({
        process: {
          env: envKeys ? JSON.stringify(envKeys) : JSON.stringify({}),
        },
      }),
      env.ts_check &&
        new ForkTsCheckerWebpackPlugin({
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
            mode: 'write-references',
          },
        }),
    ].filter(Boolean),
  };
};
