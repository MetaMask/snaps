import type { JsonRpcRequest } from '@metamask/utils';
import { useMutation } from '@tanstack/react-query';
import { useAtomValue, useAtom } from 'jotai';
import { nanoid } from 'nanoid';

import { useSnapId } from './useSnapId';
import { historyAtom, providerAtom } from '../state';

/**
 * Hook to send a request to the Snap.
 *
 * @returns The request function and loading state.
 */
export function useRequest() {
  const provider = useAtomValue(providerAtom);
  const [history, dispatch] = useAtom(historyAtom);
  const snapId = useSnapId();

  const { mutate, isPending, data, error } = useMutation({
    mutationKey: ['request'],
    mutationFn: async (request: JsonRpcRequest) => {
      const response = await provider?.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request,
        },
      });

      return response as unknown;
    },

    onSettled: (_data, _error, request) => {
      const previousRequest = history[0];

      // If the current request is the same as the previous one, do not add it
      // to the history
      if (
        previousRequest &&
        previousRequest.request === JSON.stringify(request, null, 2)
      ) {
        return;
      }

      dispatch({
        type: 'add',
        payload: {
          id: nanoid(),
          title: request.method,
          request: JSON.stringify(request, null, 2),
          timestamp: Date.now(),
        },
      });
    },
  });

  return {
    request: (request: JsonRpcRequest) => {
      return mutate(request);
    },
    data: error ?? data,
    loading: !provider || isPending,
  };
}
