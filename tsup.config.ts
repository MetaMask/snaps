import type { Options } from 'tsup';

const config: Options = {
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

  // The output formats. We want to generate both CommonJS and ESM bundles.
  // https://tsup.egoist.dev/#bundle-formats
  format: ['cjs', 'esm'],

  // Generate sourcemaps as separate files.
  // https://tsup.egoist.dev/#generate-sourcemap-file
  sourcemap: true,

  // Clean the dist folder before bundling.
  clean: true,

  // Enables shimming of `__dirname` and `import.meta.url`, so that they work
  // in both CommonJS and ESM.
  // https://tsup.egoist.dev/#inject-cjs-and-esm-shims
  shims: true,

  // Hide unnecessary logs from the console. Warnings and errors will still be
  // shown.
  silent: true,

  // Split the output into chunks. This is useful for tree-shaking.
  // https://tsup.egoist.dev/#code-splitting
  splitting: true,
};

export default config;
