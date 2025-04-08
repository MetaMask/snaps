import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { useSnapId } from './useSnapId';
import { LOCAL_SNAP_ID } from '../constants';
import { settingsAtom } from '../state';
import { renderHook } from '../test-utils';

describe('useSnapId', () => {
  it('returns the local snap ID if `useCurrentSnapId` is true', () => {
    const store = createStore();
    store.set(settingsAtom, {
      useCurrentSnapId: true,
      snapId: 'npm:example-snap',
    });

    const { result } = renderHook(() => useSnapId(), {
      store,
    });

    expect(result.current).toBe(LOCAL_SNAP_ID);
  });

  it('returns the snap ID from settings if `useCurrentSnapId` is false', () => {
    const store = createStore();
    store.set(settingsAtom, {
      useCurrentSnapId: false,
      snapId: 'npm:example-snap',
    });

    const { result } = renderHook(() => useSnapId(), {
      store,
    });

    expect(result.current).toBe('npm:example-snap');
  });

  it('returns the local snap ID if if `useCurrentSnapId` is false and `snapId` is `null`', () => {
    const store = createStore();
    store.set(settingsAtom, {
      useCurrentSnapId: false,
      snapId: null,
    });

    const { result } = renderHook(() => useSnapId(), {
      store,
    });

    expect(result.current).toBe(LOCAL_SNAP_ID);
  });
});
