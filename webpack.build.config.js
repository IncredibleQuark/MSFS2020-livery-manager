const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
require('dotenv').config();

const PackageJson = require('./package.json');

module.exports = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [['@babel/preset-env', { targets: { browsers: 'last 1 Electron version' } }], '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              '@babel/plugin-proposal-export-default-from',
              '@babel/plugin-proposal-export-namespace-from',
            ],
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
      },
    ],
  },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({ title: PackageJson.productName }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'bundle.css',
      chunkFilename: '[id].css',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
    process.env.SENTRY_AUTH_TOKEN
      ? new SentryWebpackPlugin({
          // sentry-cli configuration
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'gewoonjaap',
          project: 'msfs-api',

          // webpack specific configuration
          include: '.',
          ignore: ['node_modules', 'webpack.build.config.js', 'webpack.dev.config.js'],
        })
      : console.log('WARNING: NOT UPLOADING SOURCE MAPS TO SENTRY!\n\nMISSING API KEY!') && false,
  ].filter(Boolean),
  stats: {
    colors: true,
    children: false,
    chunks: true,
    modules: false,
  },
};
