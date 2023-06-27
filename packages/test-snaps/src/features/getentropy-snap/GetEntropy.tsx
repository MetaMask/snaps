import { FunctionComponent } from 'react';

import { Snap } from '../../components';
import { SignMessage } from './SignMessage';

export const GETENTROPY_SNAP_ID = 'npm:@metamask/test-snap-getentropy';
export const GETENTROPY_PORT = 8011;

export const GetEntropy: FunctionComponent = () => {
  return (
    <Snap
      name="getEntropy Snap"
      snapId={GETENTROPY_SNAP_ID}
      port={GETENTROPY_PORT}
      testId="GetEntropySnap"
    >
      <SignMessage />
    </Snap>
  );
};
