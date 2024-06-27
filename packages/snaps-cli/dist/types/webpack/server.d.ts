import type { SnapManifest } from '@metamask/snaps-utils';
import type { Server } from 'http';
import type { ProcessedConfig } from '../config';
/**
 * Get the allowed paths for the static server. This includes the output file,
 * the manifest file, and any auxiliary/localization files.
 *
 * @param config - The config object.
 * @param manifest - The Snap manifest object.
 * @returns An array of allowed paths.
 */
export declare function getAllowedPaths(config: ProcessedConfig, manifest: SnapManifest): string[];
/**
 * Get a static server for development purposes.
 *
 * Note: We're intentionally not using `webpack-dev-server` here because it
 * adds a lot of extra stuff to the output that we don't need, and it's
 * difficult to customize.
 *
 * @param config - The config object.
 * @returns An object with a `listen` method that returns a promise that
 * resolves when the server is listening.
 */
export declare function getServer(config: ProcessedConfig): {
    listen: (port?: number) => Promise<{
        port: number;
        server: Server;
        close: () => Promise<void>;
    }>;
};
