import type { Infer } from '@metamask/superstruct';
declare const SnapsEnvironmentOptionsStruct: import("@metamask/superstruct").Struct<{
    server: {
        port: number;
        enabled: boolean;
        root: string;
    };
}, {
    server: import("@metamask/superstruct").Struct<{
        port: number;
        enabled: boolean;
        root: string;
    }, {
        enabled: import("@metamask/superstruct").Struct<boolean, null>;
        port: import("@metamask/superstruct").Struct<number, null>;
        root: import("@metamask/superstruct").Struct<string, null>;
    }>;
}>;
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
export declare type SnapsEnvironmentOptions = Infer<typeof SnapsEnvironmentOptionsStruct>;
/**
 * Get the environment options. This validates the options, and returns the
 * default options if none are provided.
 *
 * @param testEnvironmentOptions - The test environment options as defined in
 * the Jest configuration.
 * @returns The environment options.
 */
export declare function getOptions(testEnvironmentOptions: Record<string, unknown>): {
    server: {
        port: number;
        enabled: boolean;
        root: string;
    };
};
export {};
