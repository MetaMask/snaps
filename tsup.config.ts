import { builtinModules } from 'module';
import type { Options } from 'tsup';

const config: Options = {
  // Clean the dist folder before bundling.
  clean: true,

  // The entry to bundle.
  entry: [
    'src/**/*.ts',
    '!src/**/__fixtures__/**/*',
    '!src/**/__mocks__/**/*',
    '!src/**/__test__/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/__snapshots__/**/*',
    '!src/**/test-utils/**/*',
    '!src/**/*.test.ts',
    '!src/**/*.test-d.ts',
    '!src/**/*.test.*.ts',
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

  // Hide unnecessary logs from the console. Warnings and errors will still be
  // shown.
  silent: true,

  // Generate sourcemaps as separate files.
  // https://tsup.egoist.dev/#generate-sourcemap-file
  sourcemap: true,

  // Split the output into chunks. This is useful for tree-shaking.
  // https://tsup.egoist.dev/#code-splitting
  splitting: true,

  esbuildOptions: (options, { format }) => {
    if (format === 'cjs') {
      options.define = {
        // Using `import.meta` in Node.js without ESM is a syntax error, so
        // we replace `import.meta.url` with `__filename` in CommonJS bundles.
        // This only works with the `getDirname` function in `snaps-utils`.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'import.meta.url': '__filename',
      };
    }
  },
};

export default config;
