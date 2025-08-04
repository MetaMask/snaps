import { getTrackErrorImplementation } from './track-error';
import { createStore } from '../../store';
import { getMockOptions } from '../../test-utils';

describe('getTrackErrorImplementation', () => {
  it('returns the implementation of the `trackError` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getTrackErrorImplementation(runSaga);

    expect(fn(new Error('foo'))).toBeNull();
    expect(store.getState().trackables.errors).toStrictEqual([
      {
        name: 'Error',
        message: 'foo',
        stack: expect.any(String),
        cause: null,
      },
    ]);
  });
});
