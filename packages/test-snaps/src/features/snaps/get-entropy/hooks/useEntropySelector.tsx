import type { EntropySource } from '@metamask/snaps-sdk';
import { useState } from 'react';

import { Tag, useInvokeQuery } from '../../../../api';
import { getSnapId, useInstalled } from '../../../../utils';
import { EntropySelector } from '../components';

export type UseEntropySelectorOptions = {
  /**
   * The prefix to add to the HTML ID for E2E testing purposes.
   */
  id: string;

  /**
   * Whether to show the raw list of entropy sources.
   */
  raw?: boolean | undefined;

  /**
   * The snap ID to use for the entropy sources.
   */
  snapId: `npm:${string}`;

  /**
   * The port to use for the entropy sources.
   */
  port: number;
};

/**
 * Use a selector to select the entropy source to use.
 *
 * @param options - The options to use.
 * @param options.snapId - The snap ID to use for the entropy sources.
 * @param options.port - The port to use for the entropy sources.
 * @param options.id - The prefix to add to the HTML ID for E2E testing
 * purposes.
 * @param options.raw - Whether to show the raw list of entropy sources.
 * @returns The entropy source and selector.
 */
export const useEntropySelector = ({
  snapId: publicSnapId,
  port,
  id,
  raw = false,
}: UseEntropySelectorOptions) => {
  const [source, setSource] = useState<string | undefined>(undefined);
  const snapId = getSnapId(publicSnapId, port);
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
    selector: (
      <EntropySelector id={id} sources={data} raw={raw} onChange={setSource} />
    ),
  };
};
