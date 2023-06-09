import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration, ProgressPlugin } from 'webpack';

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
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@metamask/permission-controller': false,
    },
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
    ],
  },
  plugins: [
    new ProgressPlugin(),
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
