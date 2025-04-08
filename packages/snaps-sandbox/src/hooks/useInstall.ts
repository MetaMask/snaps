import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { useSnapId } from './useSnapId';
import { providerAtom } from '../state';

/**
 * Hook to install the Snap.
 *
 * @returns The install function and loading state.
 */
export function useInstall() {
  const provider = useAtomValue(providerAtom);
  const snapId = useSnapId();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await provider?.request({
        method: 'wallet_requestSnaps',
        params: {
          [snapId]: {},
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
