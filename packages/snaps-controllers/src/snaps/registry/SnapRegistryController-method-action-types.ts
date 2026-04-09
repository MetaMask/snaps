/**
 * This file is auto generated.
 * Do not edit manually.
 */

import type { SnapRegistryController } from './SnapRegistryController';

/**
 * Triggers an update of the registry database.
 *
 * If an existing update is in progress this function will await that update.
 *
 * @returns True if an update was performed, otherwise false.
 */
export type SnapRegistryControllerRequestUpdateAction = {
  type: `SnapRegistryController:requestUpdate`;
  handler: SnapRegistryController['requestUpdate'];
};

export type SnapRegistryControllerGetAction = {
  type: `SnapRegistryController:get`;
  handler: SnapRegistryController['get'];
};

/**
 * Find an allowlisted version within a specified version range. Otherwise return the version range itself.
 *
 * @param snapId - The ID of the snap we are trying to resolve a version for.
 * @param versionRange - The version range.
 * @param refetch - An optional flag used to determine if we are refetching the registry.
 * @returns An allowlisted version within the specified version range if available otherwise returns the input version range.
 */
export type SnapRegistryControllerResolveVersionAction = {
  type: `SnapRegistryController:resolveVersion`;
  handler: SnapRegistryController['resolveVersion'];
};

/**
 * Get metadata for the given snap ID, if available, without updating registry.
 *
 * @param snapId - The ID of the snap to get metadata for.
 * @returns The metadata for the given snap ID, or `null` if the snap is not
 * verified.
 */
export type SnapRegistryControllerGetMetadataAction = {
  type: `SnapRegistryController:getMetadata`;
  handler: SnapRegistryController['getMetadata'];
};

/**
 * Union of all SnapRegistryController action types.
 */
export type SnapRegistryControllerMethodActions =
  | SnapRegistryControllerRequestUpdateAction
  | SnapRegistryControllerGetAction
  | SnapRegistryControllerResolveVersionAction
  | SnapRegistryControllerGetMetadataAction;
