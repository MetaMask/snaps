import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai/index';

import { providerAtom } from '../state';

/**
 * Hook to get the list of installed Snaps.
 *
 * @returns The list of installed Snaps.
 */
export function useSnaps() {
  const provider = useAtomValue(providerAtom);
  const result = useQuery({
    queryKey: ['snaps'],
    queryFn: async () => {
      const snaps = await provider?.request({
        method: 'wallet_getSnaps',
      });

      return Object.keys(snaps as Record<string, unknown>);
    },
    enabled: Boolean(provider),
  });

  return {
    snaps: result.data ?? [],
    loading: !provider || result.isLoading,
  };
}
