import { getStartTraceImplementation } from './start-trace';
import { createStore } from '../../store';
import { getMockOptions } from '../../test-utils';

describe('getStartTraceImplementation', () => {
  it('returns the implementation of the `startTrace` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getStartTraceImplementation(runSaga);

    expect(
      fn({
        name: 'Test Trace',
      }),
    ).toStrictEqual({
      /* eslint-disable @typescript-eslint/naming-convention */
      _traceId: 'test-trace-id',
      _spanId: 'test-span-id',
      /* eslint-enable @typescript-eslint/naming-convention */
    });

    expect(store.getState().trackables.pendingTraces).toHaveLength(1);
    expect(store.getState().trackables.pendingTraces[0]).toStrictEqual({
      name: 'Test Trace',
    });
  });
});
