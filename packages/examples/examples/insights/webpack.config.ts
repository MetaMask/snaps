import { resolve } from 'path';
import * as process from 'process';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration, ProgressPlugin } from 'webpack';

const IS_CI = Boolean(process.env.CI);

const config: Configuration = {
  entry: './src/index.ts',
  mode: 'production',
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
          loader: 'swc-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
    ],
  },
  plugins: IS_CI ? [] : [new ProgressPlugin()],
};

export default config;
