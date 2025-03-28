import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],

  optimizeDeps: {
    include: ['@lavamoat/lavatube'],

    esbuildOptions: {
      plugins: [
        // @ts-expect-error: Incompatibility between Vite versions.
        NodeModulesPolyfillPlugin(),

        // @ts-expect-error: Incompatibility between Vite versions.
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },

  test: {
    // Vitest enables watch mode by default. We disable it here, so it can be
    // explicitly enabled with `yarn test:watch`.
    watch: false,

    // The files to include in the test run.
    include: ['src/**/*.test.browser.ts'],

    server: {
      deps: {
        inline: ['@lavamoat/lavatube'],
      },
    },

    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },

    coverage: {
      enabled: true,

      reportsDirectory: 'coverage/vite',

      // Configure the coverage provider. We can't use `istanbul` because it
      // changes functions, which breaks SES.
      provider: 'v8',

      // The files to include in the coverage report.
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.js',
        'src/**/*.jsx',
        'src/**/*.mjs',
      ],

      // The files to exclude from the coverage report.
      exclude: [
        'src/**/index.ts',
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/test-utils/**',
      ],
    },

    // These break SES lockdown.
    printConsoleTrace: false,
    includeTaskLocation: false,
  },
});
