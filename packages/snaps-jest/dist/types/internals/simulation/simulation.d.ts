import type { ActionConstraint, EventConstraint } from '@metamask/base-controller';
import { ControllerMessenger } from '@metamask/base-controller';
import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import type { SnapId, AuxiliaryFileEncoding, Component, InterfaceState } from '@metamask/snaps-sdk';
import type { FetchedSnapFiles } from '@metamask/snaps-utils';
import type { RootControllerMessenger } from './controllers';
import type { SimulationOptions, SimulationUserOptions } from './options';
import type { RunSagaFunction, Store } from './store';
/**
 * Options for the execution service, without the options that are shared
 * between all execution services.
 *
 * @template Service - The type of the execution service, i.e., the class that
 * creates the execution service.
 */
export declare type ExecutionServiceOptions<Service extends new (...args: any[]) => any> = Omit<ConstructorParameters<Service>[0], keyof ConstructorParameters<typeof AbstractExecutionService<unknown>>[0]>;
/**
 * The options for running a Snap in a simulated environment.
 *
 * @property executionService - The execution service to use.
 * @property executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @property options - The simulation options.
 * @template Service - The type of the execution service.
 */
export declare type InstallSnapOptions<Service extends new (...args: any[]) => InstanceType<typeof AbstractExecutionService<unknown>>> = ExecutionServiceOptions<Service> extends Record<string, never> ? {
    executionService: Service;
    executionServiceOptions?: ExecutionServiceOptions<Service>;
    options?: SimulationUserOptions;
} : {
    executionService: Service;
    executionServiceOptions: ExecutionServiceOptions<Service>;
    options?: SimulationUserOptions;
};
export declare type InstalledSnap = {
    snapId: SnapId;
    store: Store;
    executionService: InstanceType<typeof AbstractExecutionService>;
    controllerMessenger: ControllerMessenger<ActionConstraint, EventConstraint>;
    runSaga: RunSagaFunction;
};
export declare type MiddlewareHooks = {
    /**
     * A hook that returns the user's secret recovery phrase.
     *
     * @returns The user's secret recovery phrase.
     */
    getMnemonic: () => Promise<Uint8Array>;
    /**
     * A hook that returns the Snap's auxiliary file for the given path.
     *
     * @param path - The path of the auxiliary file to get.
     * @param encoding - The encoding to use when returning the file.
     * @returns The Snap's auxiliary file for the given path.
     */
    getSnapFile: (path: string, encoding: AuxiliaryFileEncoding) => Promise<string | null>;
    /**
     * A hook that returns whether the client is locked or not.
     *
     * @returns A boolean flag signaling whether the client is locked.
     */
    getIsLocked: () => boolean;
    createInterface: (content: Component) => Promise<string>;
    updateInterface: (id: string, content: Component) => Promise<void>;
    getInterfaceState: (id: string) => InterfaceState;
};
/**
 * Install a Snap in a simulated environment. This will fetch the Snap files,
 * create a Redux store, set up the controllers and JSON-RPC stack, register the
 * Snap, and run the Snap code in the execution service.
 *
 * @param snapId - The ID of the Snap to install.
 * @param options - The options to use when installing the Snap.
 * @param options.executionService - The execution service to use.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @template Service - The type of the execution service.
 */
export declare function handleInstallSnap<Service extends new (...args: any[]) => InstanceType<typeof AbstractExecutionService>>(snapId: SnapId, { executionService, executionServiceOptions, options: rawOptions, }?: Partial<InstallSnapOptions<Service>>): Promise<InstalledSnap>;
/**
 * Get the hooks for the simulation.
 *
 * @param options - The simulation options.
 * @param snapFiles - The Snap files.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger.
 * @returns The hooks for the simulation.
 */
export declare function getHooks(options: SimulationOptions, snapFiles: FetchedSnapFiles, snapId: SnapId, controllerMessenger: RootControllerMessenger): MiddlewareHooks;
/**
 * Register mocked action handlers.
 *
 * @param controllerMessenger - The controller messenger.
 */
export declare function registerActions(controllerMessenger: RootControllerMessenger): void;
