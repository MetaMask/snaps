import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
// eslint-disable-next-line import/default
import CopyPlugin from 'copy-webpack-plugin';
import express from 'express';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import {
  Configuration,
  ProvidePlugin,
  DllPlugin,
  DllReferencePlugin,
  EnvironmentPlugin,
  NormalModuleReplacementPlugin,
} from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';

import packageJson from './package.json';

const vendor = Object.entries(packageJson.dependencies)
  .filter(([, version]) => !version.startsWith('workspace:'))
  .map(([name]) => name);

// This is purposefully not in the `dist` folder, as it will be copied to the
// `dist` folder by the `CopyPlugin` below. This avoids including it twice in
// the final package.
const VENDOR_PATH = resolve(__dirname, 'vendor');
const VENDOR_MANIFEST_PATH = resolve(VENDOR_PATH, 'vendor-manifest.json');

const vendorConfig: Configuration = {
  name: 'vendor',
  stats: 'errors-only',
  devtool: false,
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
    path: VENDOR_PATH,
    filename: '[name].js',
    library: '[name]_[fullhash]',
  },
  plugins: [
    new DllPlugin({
      path: VENDOR_MANIFEST_PATH,
      name: '[name]_[fullhash]',
    }),
    new MonacoEditorWebpackPlugin({
      languages: ['json', 'typescript'],
      features: ['bracketMatching', 'clipboard', 'hover'],
    }),
    new NodePolyfillPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
    ],
  },
};

const config: Configuration & Record<'devServer', DevServerConfiguration> = {
  name: 'app',
  entry: './src/entry.tsx',
  stats: 'errors-only',
  devtool: 'source-map',
  output: {
    path: resolve(
      __dirname,
      'dist',
      'webpack',
      // eslint-disable-next-line node/no-process-env
      process.env.SNAPS_TEST ? 'test' : 'main',
    ),
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

      './NodeProcessExecutionService': false,
      './NodeThreadExecutionService': false,
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
      manifest: VENDOR_MANIFEST_PATH,
    }),
    new ProvidePlugin({
      // These Node.js modules are used in some of the stream libs used
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new EnvironmentPlugin({
      SNAPS_TEST: false,
    }),
    new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new FaviconsWebpackPlugin('./src/assets/favicon.svg'),

    // Copy the Webpack vendor files to the output folder.
    new CopyPlugin({
      patterns: [
        {
          from: VENDOR_PATH,
          to: 'vendor',
          toType: 'dir',
        },
      ],
    }),

    // Stop attempting to bundle the Node.js execution services. They are
    // not used in the browser, and attempting to bundle them causes
    // errors.
    new NormalModuleReplacementPlugin(
      /.*services\/node.*/u,
      resolve(__dirname, 'src', 'stub.ts'),
    ),
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
      app?.use('/vendor', express.static(VENDOR_PATH));

      return middlewares;
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
    ],
  },
};

const configs = [config, vendorConfig];
export default configs;
