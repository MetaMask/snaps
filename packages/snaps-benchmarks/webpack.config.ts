import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration, HotModuleReplacementPlugin } from 'webpack';
import WebpackBarPlugin from 'webpackbar';

const config: Configuration = {
  mode: 'development',
  entry: ['webpack-hot-middleware/client', './src/Root.tsx'],
  stats: 'errors-warnings',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/u,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: resolve(__dirname, 'tsconfig.build.json'),
            projectReferences: true,
          },
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
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
  },
  /* eslint-enable @typescript-eslint/naming-convention */
  plugins: [
    new HotModuleReplacementPlugin(),
    new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new WebpackBarPlugin(),
  ],
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};

export default config;
