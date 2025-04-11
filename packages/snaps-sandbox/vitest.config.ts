// eslint-disable-next-line import-x/no-nodejs-modules
import { createRequire } from 'module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

export default defineConfig({
  test: {
    // Alias for the Monaco editor. This is required for the Monaco editor to
    // work with Vitest.
    alias: [
      {
        find: /^monaco-editor$/u,
        replacement: require.resolve('monaco-editor/esm/vs/editor/editor.api'),
      },
    ],

    // Enable processing of CSS files.
    css: true,

    // The test environment to use. We use `happy-dom` to test React components.
    environment: 'happy-dom',

    // Vitest enables watch mode by default. We disable it here, so it can be
    // explicitly enabled with `yarn test --watch`.
    watch: false,

    // The files to include in the test run.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],

    // The setup files to run before tests.
    setupFiles: ['./vitest.setup.ts'],

    coverage: {
      enabled: true,

      thresholds: {
        autoUpdate: true,

        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },

      // Configure the coverage provider.
      provider: 'v8',

      // The files to include in the coverage report.
      include: ['src/**/*.ts', 'src/**/*.tsx'],

      // The files to exclude from the coverage report.
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/test-utils/**',
      ],
    },
  },
});
