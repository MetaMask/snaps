import { Tag, useInvokeQuery } from '../../../../api';
import { getSnapId, useInstalled } from '../../../../utils';
import { MANAGE_STATE_PORT, MANAGE_STATE_SNAP_ID } from '../constants';

export type State = {
  items: string[];
};

/**
 * Hook to retrieve the state of the snap.
 *
 * @returns The state of the snap.
 */
export function useSnapState() {
  const snapId = getSnapId(MANAGE_STATE_SNAP_ID, MANAGE_STATE_PORT);
  const isInstalled = useInstalled(snapId);

  const { data: state } = useInvokeQuery<{ data: State }>(
    {
      snapId,
      method: 'getState',
      tags: [Tag.TestState],
    },
    {
      skip: !isInstalled,
    },
  );

  return state;
}
