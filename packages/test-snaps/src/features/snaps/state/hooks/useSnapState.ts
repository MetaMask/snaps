import type { Json } from '@metamask/utils';

import { Tag, useInvokeQuery } from '../../../../api';
import { getSnapId, useInstalled } from '../../../../utils';
import { MANAGE_STATE_PORT, MANAGE_STATE_SNAP_ID } from '../constants';

/**
 * Hook to retrieve the state of the snap.
 *
 * @param method - The method to call on the Snap.
 * @param encrypted - A flag to indicate whether to use encrypted storage or not.
 * @returns The state of the snap.
 */
export function useSnapState<
  State extends Record<string, Json> = Record<string, Json>,
>(method: string, encrypted: boolean): State {
  const snapId = getSnapId(MANAGE_STATE_SNAP_ID, MANAGE_STATE_PORT);
  const isInstalled = useInstalled(snapId);

  const { data: state } = useInvokeQuery<{ data: State }>(
    {
      snapId,
      method,
      params: { encrypted },
      tags: [encrypted ? Tag.TestState : Tag.UnencryptedTestState],
    },
    {
      skip: !isInstalled,
    },
  );

  return state;
}
