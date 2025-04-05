import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';

import { useResponse } from './useResponse';
import { renderHook } from '../test-utils';

describe('useResponse', () => {
  it('returns the latest response from the Snap', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => useResponse(), {
      queryClient,
    });
    expect(result.current).toBeUndefined();

    const data = { result: 'Hello, world!' };
    queryClient.getMutationCache().add({
      options: {
        mutationKey: ['request'],
      },
      // @ts-expect-error: Partial mock.
      state: {
        data,
        error: null,
      },
    });

    await waitFor(() => expect(result.current).toStrictEqual(data));
  });

  it('returns the error from the Snap', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => useResponse(), {
      queryClient,
    });
    expect(result.current).toBeUndefined();

    const data = { result: 'Hello, world!' };
    const error = {
      message: 'An error occurred',
    };

    queryClient.getMutationCache().add({
      options: {
        mutationKey: ['request'],
      },
      // @ts-expect-error: Partial mock.
      state: {
        data,
        error,
      },
    });

    await waitFor(() => expect(result.current).toStrictEqual(error));
  });
});
