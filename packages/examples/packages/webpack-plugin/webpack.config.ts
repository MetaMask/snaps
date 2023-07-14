import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type { Configuration } from 'webpack';

const config: Configuration = {
  entry: './src/index.ts',
  mode: 'production',
  devtool: 'source-map',
  stats: 'errors-only',

  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/u,
        use: {
          // For this example we use SWC, but you can use any transpiler you
          // like, such as Babel or TypeScript (`ts-loader`).
          loader: 'swc-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
    ],
  },
  plugins: [
    new SnapsWebpackPlugin({
      manifestPath: resolve(__dirname, 'snap.manifest.json'),
    }),
  ],
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};

export default config;
