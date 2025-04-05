import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { LOCAL_SNAP_ID } from '../constants';
import { providerAtom } from '../state';

/**
 * Hook to install the Snap.
 *
 * @returns The install function and loading state.
 */
export function useInstall() {
  const provider = useAtomValue(providerAtom);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await provider?.request({
        method: 'wallet_requestSnaps',
        params: {
          [LOCAL_SNAP_ID]: {},
        },
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['snaps'],
      });
    },
  });

  return {
    install: () => mutate(),
    loading: !provider || isPending,
  };
}
