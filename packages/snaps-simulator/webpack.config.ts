import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
// eslint-disable-next-line import/default
import CopyPlugin from 'copy-webpack-plugin';
import express from 'express';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import type { Configuration } from 'webpack';
import {
  ProvidePlugin,
  DllPlugin,
  DllReferencePlugin,
  EnvironmentPlugin,
  NormalModuleReplacementPlugin,
} from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { merge } from 'webpack-merge';

import packageJson from './package.json';

const vendor = Object.entries(packageJson.dependencies)
  .filter(([, version]) => !version.startsWith('workspace:'))
  .map(([name]) => name);

// This is purposefully not in the `dist` folder, as it will be copied to the
// `dist` folder by the `CopyPlugin` below. This avoids including it twice in
// the final package.
const VENDOR_PATH = resolve(__dirname, 'vendor');
const VENDOR_MANIFEST_PATH = resolve(VENDOR_PATH, 'vendor-manifest.json');

const baseConfig: Configuration = {
  stats: 'errors-only',
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
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
    /* eslint-disable @typescript-eslint/naming-convention */
    fallback: {
      assert: false,
      child_process: false,
      constants: false,
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
    /* eslint-enable @typescript-eslint/naming-convention */
  },
  plugins: [
    new ProvidePlugin({
      // These Node.js modules are used in some of the stream libs used.
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
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

const vendorConfig: Configuration = merge(baseConfig, {
  name: 'vendor',
  devtool: false,
  entry: {
    vendor,
  },
  output: {
    path: VENDOR_PATH,
    filename: '[name].js',
    library: '[name]_[fullhash]',
  },
  module: {
    rules: [
      {
        test: /\.css$/u,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
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
  ],
});

const baseAppConfig = merge<Configuration & DevServerConfiguration>(
  baseConfig,
  {
    entry: './src/entry.tsx',
    module: {
      rules: [
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
      fallback: {
        assert: require.resolve('assert/'),
        constants: require.resolve('constants-browserify'),
      },
    },
    /* eslint-enable @typescript-eslint/naming-convention */
    plugins: [
      new DllReferencePlugin({
        manifest: VENDOR_MANIFEST_PATH,
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
  },
);

const mainConfig = merge(baseAppConfig, {
  name: 'main',
  output: {
    path: resolve(__dirname, 'dist', 'webpack', 'main'),
  },
  plugins: [
    new EnvironmentPlugin({
      SNAPS_TEST: false,
    }),
  ],
});

const testConfig = merge(baseAppConfig, {
  name: 'test',
  devtool: false,
  output: {
    path: resolve(__dirname, 'dist', 'webpack', 'test'),
  },
  plugins: [
    new EnvironmentPlugin({
      SNAPS_TEST: true,
    }),
  ],
});

const configs = [mainConfig, testConfig, vendorConfig];
export default configs;
