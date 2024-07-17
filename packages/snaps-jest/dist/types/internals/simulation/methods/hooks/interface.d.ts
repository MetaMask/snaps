import type { Component, InterfaceContext, SnapId } from '@metamask/snaps-sdk';
import type { RootControllerMessenger } from '../../controllers';
/**
 * Get the implementation of the `createInterface` hook.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @returns The implementation of the `createInterface` hook.
 */
export declare function getCreateInterfaceImplementation(controllerMessenger: RootControllerMessenger): (snapId: SnapId, content: Component, context?: InterfaceContext) => Promise<string>;
/**
 * Get the implementation of the `getInterface` hook.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @returns The implementation of the `getInterface` hook.
 */
export declare function getGetInterfaceImplementation(controllerMessenger: RootControllerMessenger): (snapId: SnapId, id: string) => import("@metamask/snaps-controllers").StoredInterface;
