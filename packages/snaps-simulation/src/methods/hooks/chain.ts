import type { Hex } from '@metamask/utils';
import type { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';

import { setChain } from '../../store';
import type { RunSagaFunction } from '../../store';

/**
 * Set the current chain ID in state.
 *
 * @param chainId - The chain ID.
 * @yields Puts the chain ID in the store.
 * @returns `null`.
 */
function* setCurrentChainImplementation(chainId: Hex): SagaIterator {
  yield put(setChain(chainId));
  return null;
}

/**
 * Get a method that can be used to set the current chain.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to set the current chain.
 */
export function getSetCurrentChainImplementation(runSaga: RunSagaFunction) {
  return (...args: Parameters<typeof setCurrentChainImplementation>) => {
    return runSaga(setCurrentChainImplementation, ...args).result();
  };
}
