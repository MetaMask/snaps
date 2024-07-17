import type { GenericPermissionController } from '@metamask/permission-controller';
import type { SnapId } from '@metamask/snaps-sdk';
import type { RootControllerMessenger } from '../controllers';
import type { SimulationOptions } from '../options';
import type { RunSagaFunction } from '../store';
export declare type PermissionSpecificationsHooks = {
    /**
     * A hook that returns the user's secret recovery phrase.
     *
     * @returns The user's secret recovery phrase.
     */
    getMnemonic: () => Promise<Uint8Array>;
};
export declare type GetPermissionSpecificationsOptions = {
    controllerMessenger: RootControllerMessenger;
    hooks: PermissionSpecificationsHooks;
    runSaga: RunSagaFunction;
    options: SimulationOptions;
};
/**
 * Get a function which resolves with the specified result.
 *
 * @param result - The result to return.
 * @returns The function implementation.
 */
export declare function resolve(result: unknown): () => unknown;
/**
 * Get a function which resolves with the specified result.
 *
 * @param result - The result to return. If not specified, the function will
 * resolve with `undefined`.
 * @returns The function implementation.
 */
export declare function asyncResolve(result?: unknown): () => Promise<unknown>;
/**
 * Get the permission specifications for the Snap.
 *
 * @param options - The options.
 * @param options.controllerMessenger - The controller messenger.
 * @param options.hooks - The hooks.
 * @param options.runSaga - The function to run a saga outside the usual Redux
 * flow.
 * @param options.options - The simulation options.
 * @returns The permission specifications for the Snap.
 */
export declare function getPermissionSpecifications({ controllerMessenger, hooks, runSaga, options, }: GetPermissionSpecificationsOptions): {
    [x: string]: import("@metamask/permission-controller").PermissionSpecificationConstraint;
};
/**
 * Get the endowments for the Snap.
 *
 * @param permissionController - The permission controller.
 * @param snapId - The ID of the Snap.
 * @returns The endowments for the Snap.
 */
export declare function getEndowments(permissionController: GenericPermissionController, snapId: SnapId): Promise<string[]>;
