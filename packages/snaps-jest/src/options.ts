import type { Infer } from '@metamask/superstruct';
import {
  boolean,
  create,
  defaulted,
  number,
  object,
  string,
  type,
} from '@metamask/superstruct';

const SnapsEnvironmentOptionsStruct = type({
  server: defaulted(
    object({
      enabled: defaulted(boolean(), true),
      port: defaulted(number(), 0),
      root: defaulted(string(), process.cwd()),
    }),
    {},
  ),
});

/**
 * The options for the environment. These can be specified in the Jest
 * configuration under `testEnvironmentOptions`.
 *
 * @example
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
 * @property server - The options for the built-in HTTP server.
 * @property server.enabled - Whether to run the built-in HTTP server. Defaults
 * to `true`.
 * @property server.port - The port to use for the built-in HTTP server. If this
 * is not provided, a random available port will be used.
 * @property server.root - The root directory to serve from the built-in HTTP
 * server. Defaults to the current working directory. This is assumed to be the
 * directory containing the snap manifest and `dist` files. If this is a
 * relative path, it will be resolved relative to the current working directory.
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
