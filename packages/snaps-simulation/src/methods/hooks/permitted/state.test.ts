import { createStore, getState, setState } from '../../../store';
import { getMockOptions } from '../../../test-utils';
import {
  getPermittedClearSnapStateMethodImplementation,
  getPermittedGetSnapStateMethodImplementation,
  getPermittedUpdateSnapStateMethodImplementation,
} from './state';

describe('getPermittedGetSnapStateMethodImplementation', () => {
  it('returns the implementation of the `getSnapState` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getPermittedGetSnapStateMethodImplementation(runSaga);

    expect(await fn(true)).toBeNull();

    store.dispatch(
      setState({
        state: JSON.stringify({
          foo: 'bar',
        }),
        encrypted: true,
      }),
    );

    expect(await fn(true)).toStrictEqual({
      foo: 'bar',
    });
  });

  it('returns the implementation of the `getSnapState` hook for unencrypted state', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getPermittedGetSnapStateMethodImplementation(runSaga);

    expect(await fn(false)).toBeNull();

    store.dispatch(
      setState({
        state: JSON.stringify({
          foo: 'bar',
        }),
        encrypted: false,
      }),
    );

    expect(await fn(false)).toStrictEqual({
      foo: 'bar',
    });
  });
});

describe('getPermittedUpdateSnapStateMethodImplementation', () => {
  it('returns the implementation of the `updateSnapState` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getPermittedUpdateSnapStateMethodImplementation(runSaga);

    expect(getState(true)(store.getState())).toBeNull();

    await fn({ foo: 'bar' }, true);

    expect(getState(true)(store.getState())).toStrictEqual(
      JSON.stringify({
        foo: 'bar',
      }),
    );
  });

  it('returns the implementation of the `updateSnapState` hook for unencrypted state', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getPermittedUpdateSnapStateMethodImplementation(runSaga);

    expect(getState(false)(store.getState())).toBeNull();

    await fn({ foo: 'bar' }, false);

    expect(getState(false)(store.getState())).toStrictEqual(
      JSON.stringify({
        foo: 'bar',
      }),
    );
  });
});

describe('getPermittedClearSnapStateMethodImplementation', () => {
  it('returns the implementation of the `clearSnapState` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getPermittedClearSnapStateMethodImplementation(runSaga);

    store.dispatch(
      setState({
        state: JSON.stringify({
          foo: 'bar',
        }),
        encrypted: true,
      }),
    );

    await fn(true);

    expect(getState(true)(store.getState())).toBeNull();
  });

  it('returns the implementation of the `clearSnapState` hook for unencrypted state', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getPermittedClearSnapStateMethodImplementation(runSaga);

    store.dispatch(
      setState({
        state: JSON.stringify({
          foo: 'bar',
        }),
        encrypted: false,
      }),
    );

    await fn(false);

    expect(getState(false)(store.getState())).toBeNull();
  });
});
