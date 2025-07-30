import { getTrackEventImplementation } from './track-event';
import { createStore } from '../../store';
import { getMockOptions } from '../../test-utils';

describe('getTrackEventImplementation', () => {
  it('returns the implementation of the `trackEvent` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getTrackEventImplementation(runSaga);

    expect(
      fn({
        event: 'Test Event',
        properties: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          test_property: 'test value',
        },
      }),
    ).toBeNull();

    expect(store.getState().trackables.events).toStrictEqual([
      {
        event: 'Test Event',
        properties: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          test_property: 'test value',
        },
      },
    ]);
  });
});
