import { waitFor } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect, vi } from 'vitest';

import { useRequest } from './useRequest';
import { LOCAL_SNAP_ID } from '../constants';
import { historyAtom, providerAtom } from '../state.js';
import { renderHook } from '../test-utils';

vi.stubGlobal('ethereum', {
  isMetaMask: true,
  request: vi.fn(),
});

describe('useRequest', () => {
  it('sends a request to the Snap', async () => {
    const store = createStore();
    store.set(providerAtom, Promise.resolve(window.ethereum));

    const { result } = await act(() =>
      renderHook(() => useRequest(), { store }),
    );

    result.current.request({
      jsonrpc: '2.0',
      id: 1,
      method: 'foo',
      params: {
        bar: 'baz',
      },
    });

    await waitFor(() =>
      expect(window.ethereum.request).toHaveBeenCalledWith({
        method: 'wallet_invokeSnap',
        params: {
          snapId: LOCAL_SNAP_ID,
          request: {
            jsonrpc: '2.0',
            id: 1,
            method: 'foo',
            params: {
              bar: 'baz',
            },
          },
        },
      }),
    );
  });

  it('adds the request to the history', async () => {
    const store = createStore();
    store.set(providerAtom, Promise.resolve(window.ethereum));
    store.set(historyAtom, []);

    const { result } = await act(() =>
      renderHook(() => useRequest(), { store }),
    );

    result.current.request({
      jsonrpc: '2.0',
      id: 1,
      method: 'foo',
      params: {
        bar: 'baz',
      },
    });

    await waitFor(() => expect(window.ethereum.request).toHaveBeenCalled());

    expect(store.get(historyAtom)).toEqual([
      {
        title: 'foo',
        request: JSON.stringify(
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'foo',
            params: {
              bar: 'baz',
            },
          },
          null,
          2,
        ),
        timestamp: expect.any(Number),
      },
    ]);
  });

  it('does not add the request to the history if it is the same as the previous one', async () => {
    const store = createStore();
    store.set(providerAtom, Promise.resolve(window.ethereum));
    store.set(historyAtom, [
      {
        title: 'foo',
        request: JSON.stringify(
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'foo',
            params: {
              bar: 'baz',
            },
          },
          null,
          2,
        ),
        timestamp: Date.now(),
      },
    ]);

    const { result } = await act(() =>
      renderHook(() => useRequest(), { store }),
    );

    result.current.request({
      jsonrpc: '2.0',
      id: 1,
      method: 'foo',
      params: {
        bar: 'baz',
      },
    });

    await waitFor(() => expect(window.ethereum.request).toHaveBeenCalled());

    expect(store.get(historyAtom)).toEqual([
      {
        title: 'foo',
        request: JSON.stringify(
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'foo',
            params: {
              bar: 'baz',
            },
          },
          null,
          2,
        ),
        timestamp: expect.any(Number),
      },
    ]);
  });
});
