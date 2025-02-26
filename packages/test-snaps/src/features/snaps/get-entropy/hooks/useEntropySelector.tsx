import type { EntropySource } from '@metamask/snaps-sdk';
import { useState } from 'react';

import { Tag, useInvokeQuery } from '../../../../api';
import { getSnapId, useInstalled } from '../../../../utils';
import { EntropySelector } from '../components';
import { GET_ENTROPY_PORT, GET_ENTROPY_SNAP_ID } from '../constants';

/**
 * Use a selector to select the entropy source to use.
 *
 * @param raw - Whether to show the raw data.
 * @returns The entropy source and selector.
 */
export const useEntropySelector = (raw: boolean = false) => {
  const [source, setSource] = useState<string | undefined>(undefined);
  const snapId = getSnapId(GET_ENTROPY_SNAP_ID, GET_ENTROPY_PORT);
  const isInstalled = useInstalled(snapId);

  const { data = [] } = useInvokeQuery<{ data: EntropySource[] }>(
    {
      snapId,
      method: 'getEntropySources',
      tags: [Tag.EntropySources],
    },
    {
      skip: !isInstalled,
    },
  );

  return {
    source,
    sources: data,
    selector: <EntropySelector sources={data} raw={raw} onChange={setSource} />,
  };
};
