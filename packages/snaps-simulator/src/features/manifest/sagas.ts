import { SnapManifest, VirtualFile } from '@metamask/snaps-utils';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';

import { getIcon, getSourceCode } from '../simulation';
import {
  ManifestStatus,
  setResults,
  setValid,
  validateManifest,
  ValidationResult,
} from './slice';
import { validators } from './validators';

/**
 * Validate the snap manifest.
 *
 * @param action - The action with the snap manifest.
 * @param action.payload - The snap manifest.
 * @yields Selects the state, calls the validators, and dispatches the results.
 */
export function* validationSaga({
  payload: manifest,
}: PayloadAction<VirtualFile<SnapManifest>>): SagaIterator {
  const sourceCode: VirtualFile<string> = yield select(getSourceCode);
  const icon: VirtualFile<string> = yield select(getIcon);

  const results: ValidationResult[] = [];

  for (const { validator, name, manifestName } of validators) {
    const result = yield call(validator, manifest, {
      sourceCode,
      icon,
    });

    const message = typeof result === 'string' ? result : undefined;
    const isValid = typeof result === 'boolean' ? result : false;

    results.push({
      name,
      manifestName,
      isValid,
      message,
    });
  }

  const isValid = results.every(({ isValid: valid }) => valid);
  const status = isValid ? ManifestStatus.Valid : ManifestStatus.Invalid;

  yield put(setResults(results));
  yield put(setValid(status));
}

/**
 * Root saga for the manifest feature.
 *
 * @yields The validation saga.
 */
export function* manifestSaga() {
  yield all([takeLatest(validateManifest, validationSaga)]);
}
