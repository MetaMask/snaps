/**
 * This file is auto generated.
 * Do not edit manually.
 */

import type { SnapController } from './SnapController';

/**
 * Initialise the SnapController.
 *
 * Currently this method sets up the controller and calls the `onStart` lifecycle hook for all
 * runnable Snaps.
 *
 * @param waitForPlatform - Whether to wait for the platform to be ready before returning.
 */
export type SnapControllerInitAction = {
  type: `SnapController:init`;
  handler: SnapController['init'];
};

/**
 * Trigger an update of the registry.
 *
 * This will _always_ check if preinstalled Snaps can be updated and whether any Snaps need to beblocked/unblocked.
 */
export type SnapControllerUpdateRegistryAction = {
  type: `SnapController:updateRegistry`;
  handler: SnapController['updateRegistry'];
};

/**
 * Enables the given snap. A snap can only be started if it is enabled. A snap
 * can only be enabled if it isn't blocked.
 *
 * @param snapId - The id of the Snap to enable.
 */
export type SnapControllerEnableSnapAction = {
  type: `SnapController:enableSnap`;
  handler: SnapController['enableSnap'];
};

/**
 * Disables the given snap. A snap can only be started if it is enabled.
 *
 * @param snapId - The id of the Snap to disable.
 * @returns A promise that resolves once the snap has been disabled.
 */
export type SnapControllerDisableSnapAction = {
  type: `SnapController:disableSnap`;
  handler: SnapController['disableSnap'];
};

/**
 * Stops the given snap, removes all hooks, closes all connections, and
 * terminates its worker.
 *
 * @param snapId - The id of the Snap to stop.
 * @param statusEvent - The Snap status event that caused the snap to be
 * stopped.
 */
export type SnapControllerStopSnapAction = {
  type: `SnapController:stopSnap`;
  handler: SnapController['stopSnap'];
};

/**
 * Stops all running snaps, removes all hooks, closes all connections, and
 * terminates their workers.
 *
 * @param statusEvent - The Snap status event that caused the snap to be
 * stopped.
 */
export type SnapControllerStopAllSnapsAction = {
  type: `SnapController:stopAllSnaps`;
  handler: SnapController['stopAllSnaps'];
};

/**
 * Returns whether the given snap is running.
 * Throws an error if the snap doesn't exist.
 *
 * @param snapId - The id of the Snap to check.
 * @returns `true` if the snap is running, otherwise `false`.
 */
export type SnapControllerIsSnapRunningAction = {
  type: `SnapController:isSnapRunning`;
  handler: SnapController['isSnapRunning'];
};

/**
 * Returns whether the given snap has been added to state.
 *
 * @param snapId - The id of the Snap to check for.
 * @returns `true` if the snap exists in the controller state, otherwise `false`.
 */
export type SnapControllerHasSnapAction = {
  type: `SnapController:hasSnap`;
  handler: SnapController['hasSnap'];
};

/**
 * Gets the snap with the given id if it exists, including all data.
 * This should not be used if the snap is to be serializable, as e.g.
 * the snap sourceCode may be quite large.
 *
 * @param snapId - The id of the Snap to get.
 * @returns The entire snap object from the controller state.
 */
export type SnapControllerGetSnapAction = {
  type: `SnapController:getSnap`;
  handler: SnapController['getSnap'];
};

/**
 * Updates the own state of the snap with the given id.
 * This is distinct from the state MetaMask uses to manage snaps.
 *
 * @param snapId - The id of the Snap whose state should be updated.
 * @param newSnapState - The new state of the snap.
 * @param encrypted - A flag to indicate whether to use encrypted storage or not.
 */
export type SnapControllerUpdateSnapStateAction = {
  type: `SnapController:updateSnapState`;
  handler: SnapController['updateSnapState'];
};

/**
 * Clears the state of the snap with the given id.
 * This is distinct from the state MetaMask uses to manage snaps.
 *
 * @param snapId - The id of the Snap whose state should be cleared.
 * @param encrypted - A flag to indicate whether to use encrypted storage or not.
 */
export type SnapControllerClearSnapStateAction = {
  type: `SnapController:clearSnapState`;
  handler: SnapController['clearSnapState'];
};

/**
 * Gets the own state of the snap with the given id.
 * This is distinct from the state MetaMask uses to manage snaps.
 *
 * @param snapId - The id of the Snap whose state to get.
 * @param encrypted - A flag to indicate whether to use encrypted storage or not.
 * @returns The requested snap state or null if no state exists.
 */
export type SnapControllerGetSnapStateAction = {
  type: `SnapController:getSnapState`;
  handler: SnapController['getSnapState'];
};

/**
 * Gets a static auxiliary snap file in a chosen file encoding.
 *
 * @param snapId - The id of the Snap whose state to get.
 * @param path - The path to the requested file.
 * @param encoding - An optional requested file encoding.
 * @returns The file requested in the chosen file encoding or null if the file is not found.
 */
export type SnapControllerGetSnapFileAction = {
  type: `SnapController:getSnapFile`;
  handler: SnapController['getSnapFile'];
};

/**
 * Determine if a given Snap ID supports a given minimum version of the Snaps platform
 * by inspecting the platformVersion in the Snap manifest.
 *
 * @param snapId - The Snap ID.
 * @param version - The version.
 * @returns True if the platform version is equal or greater to the passed version, false otherwise.
 */
export type SnapControllerIsMinimumPlatformVersionAction = {
  type: `SnapController:isMinimumPlatformVersion`;
  handler: SnapController['isMinimumPlatformVersion'];
};

/**
 * Completely clear the controller's state: delete all associated data,
 * handlers, event listeners, and permissions; tear down all snap providers.
 * Also re-initializes the controller after clearing the state.
 */
export type SnapControllerClearStateAction = {
  type: `SnapController:clearState`;
  handler: SnapController['clearState'];
};

/**
 * Removes the given snap from state, and clears all associated handlers
 * and listeners.
 *
 * @param snapId - The id of the Snap.
 * @returns A promise that resolves once the snap has been removed.
 */
export type SnapControllerRemoveSnapAction = {
  type: `SnapController:removeSnap`;
  handler: SnapController['removeSnap'];
};

/**
 * Stops the given snaps, removes them from state, and clears all associated
 * permissions, handlers, and listeners.
 *
 * @param snapIds - The ids of the Snaps.
 */
export type SnapControllerRemoveSnapsAction = {
  type: `SnapController:removeSnaps`;
  handler: SnapController['removeSnaps'];
};

/**
 * Disconnect the Snap from the given origin, meaning the origin can no longer
 * interact with the Snap until it is reconnected.
 *
 * @param origin - The origin from which to remove the Snap.
 * @param snapId - The id of the snap to remove.
 */
export type SnapControllerDisconnectOriginAction = {
  type: `SnapController:disconnectOrigin`;
  handler: SnapController['disconnectOrigin'];
};

/**
 * Checks if a list of permissions are dynamic and allowed to be revoked, if they are they will all be revoked.
 *
 * @param snapId - The snap ID.
 * @param permissionNames - The names of the permissions.
 * @throws If non-dynamic permissions are passed.
 */
export type SnapControllerRevokeDynamicSnapPermissionsAction = {
  type: `SnapController:revokeDynamicSnapPermissions`;
  handler: SnapController['revokeDynamicSnapPermissions'];
};

/**
 * Gets all snaps in their truncated format.
 *
 * @returns All installed snaps in their truncated format.
 */
export type SnapControllerGetAllSnapsAction = {
  type: `SnapController:getAllSnaps`;
  handler: SnapController['getAllSnaps'];
};

/**
 * Gets all runnable snaps.
 *
 * @returns All runnable snaps.
 */
export type SnapControllerGetRunnableSnapsAction = {
  type: `SnapController:getRunnableSnaps`;
  handler: SnapController['getRunnableSnaps'];
};

/**
 * Gets the serialized permitted snaps of the given origin, if any.
 *
 * @param origin - The origin whose permitted snaps to retrieve.
 * @returns The serialized permitted snaps for the origin.
 */
export type SnapControllerGetPermittedSnapsAction = {
  type: `SnapController:getPermittedSnaps`;
  handler: SnapController['getPermittedSnaps'];
};

/**
 * Installs the snaps requested by the given origin, returning the snap
 * object if the origin is permitted to install it, and an authorization error
 * otherwise.
 *
 * @param origin - The origin that requested to install the snaps.
 * @param requestedSnaps - The snaps to install.
 * @returns An object of snap ids and snap objects, or errors if a
 * snap couldn't be installed.
 */
export type SnapControllerInstallSnapsAction = {
  type: `SnapController:installSnaps`;
  handler: SnapController['installSnaps'];
};

/**
 * Passes a JSON-RPC request object to the RPC handler function of a snap.
 *
 * @param options - A bag of options.
 * @param options.snapId - The ID of the recipient snap.
 * @param options.origin - The origin of the RPC request.
 * @param options.handler - The handler to trigger on the snap for the request.
 * @param options.request - The JSON-RPC request object.
 * @returns The result of the JSON-RPC request.
 */
export type SnapControllerHandleRequestAction = {
  type: `SnapController:handleRequest`;
  handler: SnapController['handleRequest'];
};

/**
 * Set the active state of the client. This will trigger the `onActive` or
 * `onInactive` lifecycle hooks for all Snaps.
 *
 * @param active - A boolean indicating whether the client is active or not.
 */
export type SnapControllerSetClientActiveAction = {
  type: `SnapController:setClientActive`;
  handler: SnapController['setClientActive'];
};

/**
 * Union of all SnapController action types.
 */
export type SnapControllerMethodActions =
  | SnapControllerInitAction
  | SnapControllerUpdateRegistryAction
  | SnapControllerEnableSnapAction
  | SnapControllerDisableSnapAction
  | SnapControllerStopSnapAction
  | SnapControllerStopAllSnapsAction
  | SnapControllerIsSnapRunningAction
  | SnapControllerHasSnapAction
  | SnapControllerGetSnapAction
  | SnapControllerUpdateSnapStateAction
  | SnapControllerClearSnapStateAction
  | SnapControllerGetSnapStateAction
  | SnapControllerGetSnapFileAction
  | SnapControllerIsMinimumPlatformVersionAction
  | SnapControllerClearStateAction
  | SnapControllerRemoveSnapAction
  | SnapControllerRemoveSnapsAction
  | SnapControllerDisconnectOriginAction
  | SnapControllerRevokeDynamicSnapPermissionsAction
  | SnapControllerGetAllSnapsAction
  | SnapControllerGetRunnableSnapsAction
  | SnapControllerGetPermittedSnapsAction
  | SnapControllerInstallSnapsAction
  | SnapControllerHandleRequestAction
  | SnapControllerSetClientActiveAction;
