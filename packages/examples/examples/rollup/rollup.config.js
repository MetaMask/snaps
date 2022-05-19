const { babel } = require('@rollup/plugin-babel');
const snaps = require('@metamask/rollup-plugin-snaps').default;
const execute = require('rollup-plugin-execute');

/**
 * @type {import('rollup').RollupOptions}
 */
const snapConfig = {
  input: './src/snap.ts',
  output: {
    file: './dist/snap.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    babel({ babelHelpers: 'bundled', extensions: ['.ts'] }),
    snaps(),
    execute(['yarn manifest', 'yarn eval']),
  ],
};

/**
 * @type {import('rollup').RollupOptions}
 */
const webConfig = {
  input: './src/index.ts',
  output: {
    file: './dist/main.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [babel({ babelHelpers: 'bundled', extensions: ['.ts'] })],
};

module.exports = [snapConfig, webConfig];
