import type { GenericPermissionController } from '@metamask/permission-controller';
import {
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications,
  endowmentPermissionBuilders,
} from '@metamask/snaps-controllers';
import { DEFAULT_ENDOWMENTS } from '@metamask/snaps-utils';

import type { SimulationOptions } from '../options';
import type { RunSagaFunction } from '../store';
import {
  EXCLUDED_SNAP_ENDOWMENTS,
  EXCLUDED_SNAP_PERMISSIONS,
} from './constants';
import {
  getGetLocaleMethodImplementation,
  getClearSnapStateMethodImplementation,
  getGetSnapStateMethodImplementation,
  getUpdateSnapStateMethodImplementation,
  getShowDialogImplementation,
  getShowInAppNotificationImplementation,
  getShowNativeNotificationImplementation,
  encryptImplementation,
  decryptImplementation,
} from './hooks';

export type PermissionSpecificationsHooks = {
  /**
   * A hook that returns the user's secret recovery phrase.
   *
   * @returns The user's secret recovery phrase.
   */
  getMnemonic: () => Promise<Uint8Array>;
};

export type GetPermissionSpecificationsOptions = {
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
export function resolve(result: unknown) {
  return () => result;
}

/**
 * Get a function which resolves with the specified result.
 *
 * @param result - The result to return. If not specified, the function will
 * resolve with `undefined`.
 * @returns The function implementation.
 */
export function asyncResolve(result?: unknown) {
  return async () => result;
}

/**
 * Get the permission specifications for the Snap.
 *
 * @param options - The options.
 * @param options.hooks - The hooks.
 * @param options.runSaga - The function to run a saga outside the usual Redux
 * flow.
 * @param options.options - The simulation options.
 * @returns The permission specifications for the Snap.
 */
export function getPermissionSpecifications({
  hooks,
  runSaga,
  options,
}: GetPermissionSpecificationsOptions) {
  return {
    ...buildSnapEndowmentSpecifications(EXCLUDED_SNAP_ENDOWMENTS),
    ...buildSnapRestrictedMethodSpecifications(EXCLUDED_SNAP_PERMISSIONS, {
      // Shared hooks.
      ...hooks,

      // Encryption and decryption hooks.
      // TODO: Swap these out for the real implementations.
      encrypt: encryptImplementation,
      decrypt: decryptImplementation,

      // Snaps-specific hooks.
      clearSnapState: getClearSnapStateMethodImplementation(runSaga),
      getLocale: getGetLocaleMethodImplementation(options),
      getSnapState: getGetSnapStateMethodImplementation(runSaga),
      getUnlockPromise: asyncResolve(true),

      // TODO: Allow the user to specify the result of this function.
      isOnPhishingList: resolve(false),

      maybeUpdatePhishingList: asyncResolve(),
      showDialog: getShowDialogImplementation(runSaga),
      showInAppNotification: getShowInAppNotificationImplementation(runSaga),
      showNativeNotification: getShowNativeNotificationImplementation(runSaga),
      updateSnapState: getUpdateSnapStateMethodImplementation(runSaga),
    }),
  };
}

/**
 * Get the endowments for the Snap.
 *
 * @param permissionController - The permission controller.
 * @param snapId - The ID of the Snap.
 * @returns The endowments for the Snap.
 */
export async function getEndowments(
  permissionController: GenericPermissionController,
  snapId: string,
) {
  const allEndowments = await Object.keys(endowmentPermissionBuilders).reduce<
    Promise<string[]>
  >(async (promise, permissionName) => {
    const accumulator = await promise;
    if (permissionController.hasPermission(snapId, permissionName)) {
      const endowments = await permissionController.getEndowments(
        snapId,
        permissionName,
      );

      if (endowments) {
        return accumulator.concat(endowments as string[]);
      }
    }

    return accumulator;
  }, Promise.resolve([]));

  return [...new Set([...DEFAULT_ENDOWMENTS, ...allEndowments])];
}
