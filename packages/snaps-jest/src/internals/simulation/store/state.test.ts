import { clearState, getState, setState, stateSlice } from './state';

describe('stateSlice', () => {
  describe('setState', () => {
    it('sets the encrypted state', () => {
      const state = stateSlice.reducer(
        undefined,
        setState({
          state: {
            foo: 'bar',
          },
          encrypted: true,
        }),
      );

      expect(state).toStrictEqual({
        encrypted: {
          foo: 'bar',
        },
        unencrypted: null,
      });
    });

    it('sets the unencrypted state', () => {
      const state = stateSlice.reducer(
        undefined,
        setState({
          state: {
            foo: 'bar',
          },
          encrypted: false,
        }),
      );

      expect(state).toStrictEqual({
        encrypted: null,
        unencrypted: {
          foo: 'bar',
        },
      });
    });
  });

  describe('clearState', () => {
    it('clears the encrypted state', () => {
      const state = stateSlice.reducer(
        {
          encrypted: {
            foo: 'bar',
          },
          unencrypted: null,
        },
        clearState({
          encrypted: true,
        }),
      );

      expect(state).toStrictEqual({
        encrypted: null,
        unencrypted: null,
      });
    });

    it('clears the unencrypted state', () => {
      const state = stateSlice.reducer(
        {
          encrypted: null,
          unencrypted: {
            foo: 'bar',
          },
        },
        clearState({
          encrypted: false,
        }),
      );

      expect(state).toStrictEqual({
        encrypted: null,
        unencrypted: null,
      });
    });
  });
});

describe('getState', () => {
  it('gets the encrypted state', () => {
    // @ts-expect-error - The `state` parameter is only partially defined.
    const state = getState(true)({
      state: {
        encrypted: {
          foo: 'bar',
        },
        unencrypted: null,
      },
    });

    expect(state).toStrictEqual({
      foo: 'bar',
    });
  });

  it('gets the unencrypted state', () => {
    // @ts-expect-error - The `state` parameter is only partially defined.
    const state = getState(false)({
      state: {
        encrypted: null,
        unencrypted: {
          foo: 'bar',
        },
      },
    });

    expect(state).toStrictEqual({
      foo: 'bar',
    });
  });
});
