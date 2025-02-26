import type { EntropySource } from '@metamask/snaps-sdk';

import { Tag, useInvokeQuery } from '../../../../api';
import { getSnapId, useInstalled } from '../../../../utils';
import { GET_ENTROPY_PORT, GET_ENTROPY_SNAP_ID } from '../constants';

export const useEntropySources = () => {
  const snapId = getSnapId(GET_ENTROPY_SNAP_ID, GET_ENTROPY_PORT);
  const isInstalled = useInstalled(snapId);

  const { data } = useInvokeQuery<{ data: EntropySource[] }>(
    {
      snapId,
      method: 'getEntropySources',
      tags: [Tag.EntropySources],
    },
    {
      skip: !isInstalled,
    },
  );

  return data;
};
