import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration, ProgressPlugin } from 'webpack';

const IS_CI = Boolean(process.env.CI);

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
          loader: 'swc-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    /* eslint-disable @typescript-eslint/naming-convention */
    alias: {
      '@metamask/permission-controller': false,
      'is-svg': false,
    },
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
    ...(IS_CI ? [] : [new ProgressPlugin()]),
  ],
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};

export default config;
