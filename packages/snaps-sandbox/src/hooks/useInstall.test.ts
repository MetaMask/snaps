import { waitFor } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect, vi } from 'vitest';

import { useInstall } from './useInstall';
import { LOCAL_SNAP_ID } from '../constants';
import { providerAtom } from '../state';
import { renderHook } from '../test-utils';

vi.stubGlobal('ethereum', {
  isMetaMask: true,
  request: vi.fn(),
});

describe('useInstall', () => {
  it('installs the Snap', async () => {
    const store = createStore();
    store.set(providerAtom, Promise.resolve(window.ethereum));

    const { result } = await act(() =>
      renderHook(() => useInstall(), { store }),
    );

    result.current.install();

    await waitFor(() =>
      expect(window.ethereum.request).toHaveBeenCalledWith({
        method: 'wallet_requestSnaps',
        params: {
          [LOCAL_SNAP_ID]: {},
        },
      }),
    );
  });
});
