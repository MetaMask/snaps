import type { Component, SnapId } from '@metamask/snaps-sdk';

import type { RootControllerMessenger } from '../../controllers';

/**
 * Get the implementation of the `createInterface` hook.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @returns The implementation of the `createInterface` hook.
 */
export function getCreateInterfaceImplementation(
  controllerMessenger: RootControllerMessenger,
) {
  return async (snapId: SnapId, content: Component) =>
    controllerMessenger.call(
      'SnapInterfaceController:createInterface',
      snapId,
      content,
    );
}

/**
 * Get the implementation of the `getInterface` hook.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @returns The implementation of the `getInterface` hook.
 */
export function getGetInterfaceImplementation(
  controllerMessenger: RootControllerMessenger,
) {
  return (snapId: SnapId, id: string) =>
    controllerMessenger.call(
      'SnapInterfaceController:getInterface',
      snapId,
      id,
    );
}
