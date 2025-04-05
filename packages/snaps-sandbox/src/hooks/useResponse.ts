import { useMutationState } from '@tanstack/react-query';

/**
 * A custom hook that retrieves the latest response from the Snap.
 *
 * @returns The latest response from the Snap.
 */
export function useResponse() {
  const mutations = useMutationState({
    filters: {
      mutationKey: ['request'],
    },
    select: ({ state }) => state.error ?? state.data,
  });

  return mutations[mutations.length - 1];
}
