import type { Infer } from 'superstruct';
import {
  boolean,
  create,
  defaulted,
  number,
  object,
  optional,
  string,
  type,
} from 'superstruct';

const SnapsEnvironmentOptionsStruct = type({
  executionEnvironmentUrl: optional(string()),
  simulatorUrl: optional(string()),
  keepAlive: defaulted(boolean(), false),

  server: defaulted(
    object({
      enabled: defaulted(boolean(), true),
      port: defaulted(number(), 0),
      root: defaulted(string(), process.cwd()),
    }),
    {},
  ),

  browser: defaulted(
    object({
      headless: defaulted(boolean(), true),
    }),
    {},
  ),
});

/**
 * The options for the environment. These can be specified in the Jest
 * configuration under `testEnvironmentOptions`.
 *
 * @example
 * ```json
 * {
 *   "testEnvironment": "@metamask/snaps-jest",
 *   "testEnvironmentOptions": {
 *     "executionEnvironmentUrl": "http://localhost:8080",
 *     "server": {
 *       "port": 8080,
 *       /* ... *\/
 *     }
 *   }
 * }
 * ```
 * @property executionEnvironmentUrl - The URL of the execution environment. If
 * this is not provided, the execution environment will be served from the
 * built-in HTTP server.
 * @property simulatorUrl - The URL of the simulator. If this is not provided,
 * the simulator will be served from the built-in HTTP server.
 * @property keepAlive - Whether to keep the browser open after the tests have
 * finished. This is useful for debugging. Defaults to `false`.
 * @property server - The options for the built-in HTTP server.
 * @property server.enabled - Whether to run the built-in HTTP server. Defaults
 * to `true`.
 * @property server.port - The port to use for the built-in HTTP server. If this
 * is not provided, a random available port will be used.
 * @property server.root - The root directory to serve from the built-in HTTP
 * server. Defaults to the current working directory. This is assumed to be the
 * directory containing the snap manifest and `dist` files. If this is a
 * relative path, it will be resolved relative to the current working directory.
 * @property browser - The options for the browser.
 * @property browser.headless - Whether to run the browser in headless mode.
 * Defaults to `true`.
 */
export type SnapsEnvironmentOptions = Infer<
  typeof SnapsEnvironmentOptionsStruct
>;

/**
 * Get the environment options. This validates the options, and returns the
 * default options if none are provided.
 *
 * @param testEnvironmentOptions - The test environment options as defined in
 * the Jest configuration.
 * @returns The environment options.
 */
export function getOptions(testEnvironmentOptions: Record<string, unknown>) {
  return create(testEnvironmentOptions, SnapsEnvironmentOptionsStruct);
}
