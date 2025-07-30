import { getEndTraceImplementation } from './end-trace';
import { createStore, startTrace } from '../../store';
import { getMockOptions } from '../../test-utils';

describe('getEndTraceImplementation', () => {
  it('returns the implementation of the `endTrace` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    store.dispatch(
      startTrace({
        name: 'Test Trace',
        id: 'test-trace-id',
      }),
    );

    const fn = getEndTraceImplementation(runSaga);

    expect(
      fn({
        name: 'Test Trace',
        id: 'test-trace-id',
      }),
    ).toBeNull();

    expect(store.getState().trackables.pendingTraces).toHaveLength(0);
    expect(store.getState().trackables.traces).toHaveLength(1);
    expect(store.getState().trackables.traces[0]).toStrictEqual({
      name: 'Test Trace',
      id: 'test-trace-id',
    });
  });
});
