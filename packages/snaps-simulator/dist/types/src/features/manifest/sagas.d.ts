import type { SnapManifest, VirtualFile } from '@metamask/snaps-utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
/**
 * Validate the snap manifest.
 *
 * @param action - The action with the snap manifest.
 * @param action.payload - The snap manifest.
 * @yields Selects the state, calls the validators, and dispatches the results.
 */
export declare function validationSaga({ payload: manifest, }: PayloadAction<VirtualFile<SnapManifest>>): SagaIterator;
/**
 * Root saga for the manifest feature.
 *
 * @yields The validation saga.
 */
export declare function manifestSaga(): Generator<import("redux-saga/effects").AllEffect<import("redux-saga/effects").ForkEffect<never>>, void, unknown>;
