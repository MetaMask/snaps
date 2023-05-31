import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import express from 'express';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { resolve } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import {
  Configuration,
  ProvidePlugin,
  DllPlugin,
  DllReferencePlugin,
} from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import WebpackBarPlugin from 'webpackbar';

import packageJson from './package.json';

const vendor = Object.entries(packageJson.dependencies)
  .filter(([, version]) => !version.startsWith('workspace:'))
  .map(([name]) => name);

const vendorConfig: Configuration = {
  name: 'vendor',
  entry: {
    vendor,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/u,
        use: {
          loader: 'swc-loader',
        },
      },
      {
        test: /\.css$/u,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
  },
  output: {
    path: resolve(__dirname, 'dist', 'vendor'),
    filename: '[name].js',
    library: '[name]_[fullhash]',
  },
  plugins: [
    new DllPlugin({
      path: resolve(__dirname, 'dist', 'vendor', '[name]-manifest.json'),
      name: '[name]_[fullhash]',
    }),
    new MonacoEditorWebpackPlugin({
      languages: ['json', 'typescript'],
      features: ['bracketMatching', 'clipboard', 'hover'],
    }),
    new NodePolyfillPlugin(),
  ],
};

const config: Configuration & Record<'devServer', DevServerConfiguration> = {
  name: 'app',
  entry: './src/index.tsx',
  stats: 'errors-warnings',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/u,
        use: {
          loader: 'swc-loader',
        },
      },
      {
        test: /\.m?js$/u,
        include: /node_modules/u,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/u,
        type: 'asset',
      },
      {
        test: /\.woff2?$/u,
        type: 'asset/resource',
      },
      {
        test: /\.css$/u,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  /* eslint-disable @typescript-eslint/naming-convention */
  externals: {
    'node:module': 'commonjs module',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      assert: require.resolve('assert/'),
      child_process: false,
      constants: require.resolve('constants-browserify'),
      crypto: false,
      fs: false,
      http: false,
      https: false,
      module: false,
      stream: require.resolve('stream-browserify'),
      _stream_transform: require.resolve(
        'readable-stream/lib/_stream_transform.js',
      ),
      os: false,
      path: false,
      util: false,
      worker_threads: false,
      zlib: false,
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
  },
  /* eslint-enable @typescript-eslint/naming-convention */
  plugins: [
    new DllReferencePlugin({
      manifest: resolve(__dirname, 'dist', 'vendor', 'vendor-manifest.json'),
    }),
    new ProvidePlugin({
      // These Node.js modules are used in some of the stream libs used
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new WebpackBarPlugin(),
    new FaviconsWebpackPlugin('./src/assets/favicon.svg'),
  ],
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  devServer: {
    port: 8000,
    historyApiFallback: true,
    setupMiddlewares: (middlewares, { app }) => {
      app?.use('/vendor', express.static(resolve(__dirname, 'dist', 'vendor')));
      return middlewares;
    },
  },
};

const configs = [config, vendorConfig];
export default configs;
