import { createRequire } from 'node:module';

const nodeRequire = createRequire(__filename);

/**
 * The Vitest configuration for testing MetaMask Snaps. Spread this into the
 * `test` section of your Vitest configuration:
 *
 * @example
 * import { defineConfig } from 'vitest/config';
 * import { snapsVitestPreset } from '@metamask/snaps-vitest';
 *
 * export default defineConfig({
 *   test: {
 *     ...snapsVitestPreset,
 *   },
 * });
 */
export const snapsVitestPreset = {
  // These are resolved lazily, so that importing the package entrypoint does
  // not require the built environment and setup files to exist.
  get environment() {
    return nodeRequire.resolve('./environment.mjs');
  },
  get setupFiles() {
    return [nodeRequire.resolve('./setup.mjs')];
  },

  // End-to-end tests can take longer than usual to run, so we set the test
  // timeout to 30 seconds by default.
  testTimeout: 30_000,
};

export type SnapsVitestPreset = typeof snapsVitestPreset;

/**
 * Get a complete Vitest configuration for testing MetaMask Snaps, including
 * the JSX runtime configuration required for Snap UI components in tests.
 *
 * @example
 * import { defineConfig } from 'vitest/config';
 * import { getSnapsVitestConfig } from '@metamask/snaps-vitest';
 *
 * export default defineConfig(
 *   getSnapsVitestConfig({
 *     globals: true,
 *     environmentOptions: {
 *       server: { root: process.cwd() },
 *     },
 *   }),
 * );
 * @param test - Additional or overridden Vitest test options.
 * @returns The Vitest configuration.
 */
export function getSnapsVitestConfig(
  test: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: '@metamask/snaps-sdk',
      jsxDev: false,
    },
    test: {
      ...snapsVitestPreset,
      ...test,
    },
  };
}
