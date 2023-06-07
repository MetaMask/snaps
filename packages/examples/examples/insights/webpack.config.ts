import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';

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
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
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

export default config;
