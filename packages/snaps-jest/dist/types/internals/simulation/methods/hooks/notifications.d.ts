import type { NotifyParams } from '@metamask/snaps-sdk';
import type { RunSagaFunction } from '../../store';
/**
 * Get a method that can be used to show a native notification.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to show a native notification.
 */
export declare function getShowNativeNotificationImplementation(runSaga: RunSagaFunction): (args_0: string, args_1: NotifyParams) => Promise<any>;
/**
 * Get a method that can be used to show an in-app notification.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to show an in-app notification.
 */
export declare function getShowInAppNotificationImplementation(runSaga: RunSagaFunction): (args_0: string, args_1: NotifyParams) => Promise<any>;
