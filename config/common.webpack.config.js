/*jslint node: true */
'use strict';

const path = require('path');
const merge = require('merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const failPlugin = require('webpack-fail-plugin');

/**
 * Reads the name field of package.json.
 * Removes "blackbaud-sky-pages-spa-" and wraps in "/".
 * @name getAppName
 * @returns {String} appName
 */
const getAppBase = () => {
  const name = require(path.join(process.cwd(), 'package.json')).name;
  return '/' + name.replace(/blackbaud-sky-pages-spa-/gi, '') + '/';
};

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) => {

  const assetLoader = path.resolve(__dirname, '..', 'sky-pages-asset-loader');
  const moduleLoader = path.resolve(__dirname, '..', 'sky-pages-module-loader');
  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules')
  ];

  // Merge in our defaults
  const appConfig = merge(skyPagesConfig['blackbaud-sky-pages-out-skyux2'].app, {
    template: path.resolve(__dirname, '..', 'src', 'main.ejs'),
    base: getAppBase(),
    inject: false
  });

  return {
    entry: {
      polyfills: [path.resolve(__dirname, '..', 'src', 'polyfills.ts')],
      vendor: [path.resolve(__dirname, '..', 'src', 'vendor.ts')],
      app: [path.resolve(__dirname, '..', 'src', 'main.ts')]
    },
    output: {
      path: path.join(process.cwd(), 'dist'),
      publicPath: appConfig.base,
      // libraryTarget: 'umd'
    },
    externals: [
      // 'skyux'
      // /^@angular/
      // {
      //   '@angular/core': true,
      //   '@angular/common': true,
      //   '@angular/http': true,
      //   '@angular/router': true,
      //   'rxjs/Subscription': true,
      //   'rxjs/Observable': true,
      //   'blackbaud-skyux2/dist/core': true
      // }
    ],
    // externals: {
    //   '@angular/core': '@angular/core',
    //   '@angular/common': '@angular/common',
    //   '@angular/http': '@angular/http',
    //   '@angular/router': '@angular/router',
    //   'rxjs/Subscription': 'rxjs/Subscription'
    // },
    resolveLoader: {
      root: resolves
    },
    resolve: {
      root: resolves,
      // alias: {
      //   'blackbaud-skyux2': path.resolve(__dirname,
      //     '..', 'node_modules', 'blackbaud-skyux2', 'dist', 'core.js')
      // },
      extensions: [
        '',
        '.js',
        '.ts'
      ],
    },
    module: {
      preLoaders: [
        {
          test: /sky-pages\.module\.ts$/,
          loader: moduleLoader
        },
        {
          test: /app\.component\.html$/,
          loader: assetLoader,
          query: {
            key: 'appComponentTemplate'
          }
        },
        {
          test: /app\.component\.scss$/,
          loader: assetLoader,
          query: {
            key: 'appComponentStyles'
          }
        }
      ],
      loaders: [
        {
          test: /\.ts$/,
          loaders: [
            'ts-loader?silent=true',
            'angular2-template-loader'
          ]
        },
        {
          test: /\.s?css$/,
          loader: 'raw-loader!sass-loader'
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        }
      ]
    },
    SKY_PAGES: skyPagesConfig,
    plugins: [
      new HtmlWebpackPlugin(appConfig),
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: ['app', 'vendor', 'polyfills']
      // }),
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        mangle: { screw_ie8: true, keep_fnames: true }
      }),
      new webpack.DefinePlugin({
        'SKY_PAGES': JSON.stringify(skyPagesConfig)
      }),
      new ProgressBarPlugin(),
      new WebpackMd5Hash(),
      failPlugin
    ]
  };
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
