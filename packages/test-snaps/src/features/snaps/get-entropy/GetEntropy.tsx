import type { FunctionComponent } from 'react';

import { SignMessage } from './components';
import {
  GET_ENTROPY_PORT,
  GET_ENTROPY_SNAP_ID,
  GET_ENTROPY_VERSION,
} from './constants';
import { useEntropySelector } from './hooks';
import { Snap } from '../../../components';

export const GetEntropy: FunctionComponent = () => {
  const { selector, source } = useEntropySelector({
    raw: true,
    snapId: GET_ENTROPY_SNAP_ID,
    port: GET_ENTROPY_PORT,
  });

  return (
    <Snap
      name="Get Entropy Snap"
      snapId={GET_ENTROPY_SNAP_ID}
      port={GET_ENTROPY_PORT}
      version={GET_ENTROPY_VERSION}
      testId="GetEntropySnap"
    >
      {selector}
      <SignMessage source={source} />
    </Snap>
  );
};
