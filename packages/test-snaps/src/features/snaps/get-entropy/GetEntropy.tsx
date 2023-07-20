import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import { SignMessage } from './components';
import {
  GET_ENTROPY_PORT,
  GET_ENTROPY_SNAP_ID,
  GET_ENTROPY_VERSION,
} from './constants';

export const GetEntropy: FunctionComponent = () => {
  return (
    <Snap
      name="Get Entropy Snap"
      snapId={GET_ENTROPY_SNAP_ID}
      port={GET_ENTROPY_PORT}
      version={GET_ENTROPY_VERSION}
      testId="GetEntropySnap"
    >
      <SignMessage />
    </Snap>
  );
};
