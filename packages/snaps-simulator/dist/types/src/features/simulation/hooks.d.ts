import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import type { DialogType, NotifyParams, Json, ComponentOrElement } from '@metamask/snaps-sdk';
import type { SagaIterator } from 'redux-saga';
/**
 * Show a dialog to the user.
 *
 * @param snapId - The ID of the Snap that created the alert.
 * @param type - The type of dialog to show.
 * @param id - The snap interface ID.
 * @param _placeholder - The placeholder text to show in the dialog.
 * @yields Selects the current state.
 * @returns True if the dialog was shown, false otherwise.
 */
export declare function showDialog(snapId: string, type: DialogType, id: string, _placeholder?: string): SagaIterator;
/**
 * Show a native notification to the user.
 *
 * @param _snapId - The ID of the Snap that created the alert.
 * @param args - The arguments to pass to the notification.
 * @param args.message - The message to show in the notification.
 * @yields Calls the Notification API.
 * @returns `null`.
 */
export declare function showNativeNotification(_snapId: string, { message }: NotifyParams): SagaIterator;
/**
 * Show an in-app notification to the user.
 *
 * @param _snapId - The ID of the Snap that created the alert.
 * @param args - The arguments to pass to the notification.
 * @param args.message - The message to show in the notification.
 * @yields Adds a notification to the notification list.
 * @returns `null`.
 */
export declare function showInAppNotification(_snapId: string, { message }: NotifyParams): SagaIterator;
/**
 * Updates the snap state in the simulation slice.
 *
 * @param _snapId - The snap id, unused for now.
 * @param newSnapState - The new state.
 * @param encrypted - A flag to signal whether to use the encrypted storage or not.
 * @yields Puts the newSnapState
 */
export declare function updateSnapState(_snapId: string, newSnapState: Record<string, Json> | null, encrypted: boolean): SagaIterator;
/**
 * Gets the snap state from the simulation slice.
 *
 * @param _snapId - The snap id, unused for now.
 * @param encrypted - A flag to signal whether to use the encrypted storage or not.
 * @returns The snap state.
 * @yields Selects the snap state from the simulation slice.
 */
export declare function getSnapState(_snapId: string, encrypted: boolean): SagaIterator;
/**
 * Gets a statically defined snap file.
 *
 * Usually these would be stored in the SnapController.
 *
 * @param path - The file path.
 * @param encoding - The requested file encoding.
 * @returns The file in hexadecimal if found, otherwise null.
 * @yields Selects the state from the simulation slice.
 */
export declare function getSnapFile(path: string, encoding?: AuxiliaryFileEncoding): SagaIterator;
/**
 * Creates a snap interface.
 *
 * @param snapId - The snap id.
 * @param content - The content of the interface.
 * @returns The snap interface ID.
 * @yields Creates the interface in the SnapInterfaceController.
 */
export declare function createInterface(snapId: string, content: ComponentOrElement): SagaIterator;
/**
 * Gets a snap interface.
 *
 * @param snapId - The snap id.
 * @param id - The interface id.
 * @returns The snap interface.
 * @yields Gets the interface from the SnapInterfaceController.
 */
export declare function getInterface(snapId: string, id: string): SagaIterator;
/**
 * Updates a snap interface.
 *
 * @param snapId - The snap id.
 * @param id - The interface id.
 * @param content - The new content of the interface.
 * @yields Updates the interface in the SnapInterfaceController.
 */
export declare function updateInterface(snapId: string, id: string, content: ComponentOrElement): SagaIterator;
/**
 * Gets the state of a snap interface.
 *
 * @param snapId - The snap id.
 * @param id - The interface id.
 * @returns The state of the interface.
 * @yields Gets the interface from the SnapInterfaceController.
 */
export declare function getInterfaceState(snapId: string, id: string): SagaIterator;
