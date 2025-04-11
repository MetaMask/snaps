import { act } from '@testing-library/react';
import { createStore } from 'jotai/index';
import { describe, it, expect, vi } from 'vitest';

import { useSnaps } from './useSnaps';
import { providerAtom } from '../state';
import { renderHook } from '../test-utils';

vi.stubGlobal('ethereum', {
  isMetaMask: true,
  request: vi.fn(),
});

describe('useSnaps', () => {
  it('returns the list of installed Snaps', async () => {
    const store = createStore();
    store.set(providerAtom, Promise.resolve(window.ethereum));

    const { result } = await act(() => renderHook(() => useSnaps(), { store }));

    expect(result.current.snaps).toStrictEqual([]);
  });

  it('returns loading state when provider is not available', async () => {
    const store = createStore();
    store.set(providerAtom, Promise.resolve(null));

    const { result } = await act(() => renderHook(() => useSnaps(), { store }));

    expect(result.current.loading).toBe(true);
  });
});
