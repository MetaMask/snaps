import type { Json } from '@metamask/utils';
import type { RunSagaFunction } from '../../store';
/**
 * Get the implementation of the `getSnapState` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `getSnapState` hook.
 */
export declare function getGetSnapStateMethodImplementation(runSaga: RunSagaFunction): (_snapId: string, encrypted?: boolean | undefined) => any;
/**
 * Get the implementation of the `updateSnapState` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `updateSnapState` hook.
 */
export declare function getUpdateSnapStateMethodImplementation(runSaga: RunSagaFunction): (_snapId: string, newState: Record<string, Json>, encrypted?: boolean | undefined) => void;
/**
 * Get the implementation of the `clearSnapState` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `clearSnapState` hook.
 */
export declare function getClearSnapStateMethodImplementation(runSaga: RunSagaFunction): (_snapId: string, encrypted?: boolean | undefined) => Promise<void>;
