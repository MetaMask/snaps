import { clearState, getState, setState, stateSlice } from './state';

describe('stateSlice', () => {
  describe('setState', () => {
    it('sets the encrypted state', () => {
      const state = stateSlice.reducer(
        undefined,
        setState({
          state: 'foo',
          encrypted: true,
        }),
      );

      expect(state).toStrictEqual({
        encrypted: 'foo',
        unencrypted: null,
      });
    });

    it('sets the unencrypted state', () => {
      const state = stateSlice.reducer(
        undefined,
        setState({
          state: 'foo',
          encrypted: false,
        }),
      );

      expect(state).toStrictEqual({
        encrypted: null,
        unencrypted: 'foo',
      });
    });
  });

  describe('clearState', () => {
    it('clears the encrypted state', () => {
      const state = stateSlice.reducer(
        {
          encrypted: 'foo',
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
          unencrypted: 'foo',
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
        encrypted: 'foo',
        unencrypted: null,
      },
    });

    expect(state).toBe('foo');
  });

  it('gets the unencrypted state', () => {
    // @ts-expect-error - The `state` parameter is only partially defined.
    const state = getState(false)({
      state: {
        encrypted: null,
        unencrypted: 'foo',
      },
    });

    expect(state).toBe('foo');
  });
});
