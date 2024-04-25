import { builtinModules } from 'module';
import type { Options } from 'tsup';

// `Plugin` is not exported from `tsup`, so we have to define it ourselves.
type Plugin = Options['plugins'][number];

const DIRNAME_SHIM = `import { fileURLToPath } from 'url'
import path from 'path'

const getFilename = () => fileURLToPath(import.meta.url)
const getDirname = () => path.dirname(getFilename())

export const __dirname = /* @__PURE__ */ getDirname()`;

/**
 * A `tsup` plugin that adds a `__dirname` shim to the beginning of each chunk
 * that uses `__dirname`. This is necessary because `__dirname` is not available
 * in ESM, so we have to use `import.meta.url` and `fileURLToPath` to get the
 * dirname of the current file.
 *
 * Note: This breaks source maps in the files that use `__dirname`.
 */
const dirnameShimPlugin: Plugin = {
  name: 'dirname-shim-plugin',

  renderChunk(code, info) {
    if (
      info.type !== 'chunk' ||
      this.format === 'cjs' ||
      !code.includes('__dirname')
    ) {
      return undefined;
    }

    return { code: `${DIRNAME_SHIM}\n${code}`, map: info.map };
  },
};

const config: Options = {
  // Clean the dist folder before bundling.
  clean: true,

  // The entry to bundle.
  entry: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/__fixtures__/**/*',
    '!src/**/__mocks__/**/*',
    '!src/**/__test__/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/__snapshots__/**/*',
    '!src/**/test-utils/**/*',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.test-d.ts',
    '!src/**/*.test.*.ts',
    '!src/**/*.test.*.tsx',
  ],

  // External modules that should not be processed by `tsup`. We want to
  // exclude built-in Node.js modules from the bundle.
  // https://tsup.egoist.dev/#excluding-packages
  external: builtinModules,

  // The output formats. We want to generate both CommonJS and ESM bundles.
  // https://tsup.egoist.dev/#bundle-formats
  format: ['cjs', 'esm'],

  // The platform to target when generating the bundles. `neutral` means that
  // the bundles will work in both Node.js and browsers.
  platform: 'neutral',

  // The plugins to use when bundling. We add a plugin that adds a `__dirname`
  // shim to the beginning of each chunk that uses `__dirname`.
  plugins: [dirnameShimPlugin],

  // Hide unnecessary logs from the console. Warnings and errors will still be
  // shown.
  silent: true,

  // Generate sourcemaps as separate files.
  // https://tsup.egoist.dev/#generate-sourcemap-file
  sourcemap: true,

  // Split the output into chunks. This is useful for tree-shaking.
  // https://tsup.egoist.dev/#code-splitting
  splitting: true,
};

export default config;
