import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';
import { bytesToHex } from '@metamask/utils';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration, ProvidePlugin } from 'webpack';

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
      {
        test: /\.wasm$/u,
        type: 'asset/inline',
        generator: {
          dataUrl: (content: any) => {
            return bytesToHex(content);
          },
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
      eval: false,
    }),
    new ProvidePlugin({
      Buffer: ['buffer/', 'Buffer'],
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
