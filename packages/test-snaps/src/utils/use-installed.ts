import { useGetSnapsQuery } from '../api';

/**
 * A React hook that returns a boolean indicating whether the given Snap is
 * installed.
 *
 * @param snapId - The ID of the Snap to check.
 * @returns A boolean indicating whether the given Snap is installed.
 */
export const useInstalled = (snapId: string): boolean => {
  const { data: snaps } = useGetSnapsQuery();

  return Boolean(snaps?.[snapId]);
};
