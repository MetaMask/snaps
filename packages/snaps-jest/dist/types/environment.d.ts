import type { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import NodeEnvironment from 'jest-environment-node';
import type { InstalledSnap, InstallSnapOptions } from './internals';
declare global {
    const snapsEnvironment: SnapsEnvironment;
}
export declare class SnapsEnvironment extends NodeEnvironment {
    #private;
    /**
     * Constructor.
     *
     * @param options - The environment options.
     * @param context - The environment context.
     */
    constructor(options: JestEnvironmentConfig, context: EnvironmentContext);
    /**
     * Set up the environment. This starts the built-in HTTP server, and creates a
     * new browser instance.
     */
    setup(): Promise<void>;
    /**
     * Tear down the environment. This closes the browser, and stops the built-in
     * HTTP server.
     */
    teardown(): Promise<void>;
    /**
     * Install a Snap in the environment. This will terminate any previously
     * installed Snaps, and run the Snap code in a new execution service.
     *
     * @param snapId - The ID of the Snap to install.
     * @param options - The options to use when installing the Snap.
     * @param options.executionService - The execution service to use.
     * @param options.executionServiceOptions - The options to use when creating the
     * execution service, if any. This should only include options specific to the
     * provided execution service.
     * @param options.options - The simulation options.
     * @template Service - The type of the execution service.
     * @returns The installed Snap.
     */
    installSnap<Service extends new (...args: any[]) => InstanceType<typeof AbstractExecutionService>>(snapId?: string, options?: Partial<InstallSnapOptions<Service>>): Promise<InstalledSnap>;
    /**
     * Get the snap ID for the current environment, which is used if no snap ID is
     * passed to {@link installSnap}. This assumes that the built-in server is
     * running.
     *
     * @returns The snap ID.
     * @throws If the server is not running.
     */
    get snapId(): string;
}
export default SnapsEnvironment;
