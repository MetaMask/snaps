import { getSetCurrentChainImplementation } from './chain';
import { createStore } from '../../store';
import { getMockOptions } from '../../test-utils';

describe('getSetCurrentChainImplementation', () => {
  it('returns the implementation of the `setCurrentChain` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());

    expect(store.getState().chain.chainId).toBe('0x1');

    const fn = getSetCurrentChainImplementation(runSaga);

    expect(fn('0x2')).toBeNull();

    expect(store.getState().chain.chainId).toBe('0x2');
  });
});
