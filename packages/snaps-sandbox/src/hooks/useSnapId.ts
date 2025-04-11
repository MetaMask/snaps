import { useAtomValue } from 'jotai';

import { LOCAL_SNAP_ID } from '../constants';
import { settingsAtom } from '../state';

/**
 * Hook to get the Snap ID to be used for the request.
 *
 * @returns The Snap ID to be used for the request.
 */
export function useSnapId() {
  const settings = useAtomValue(settingsAtom);

  if (!settings.useCurrentSnapId && settings.snapId) {
    return settings.snapId;
  }

  return LOCAL_SNAP_ID;
}
