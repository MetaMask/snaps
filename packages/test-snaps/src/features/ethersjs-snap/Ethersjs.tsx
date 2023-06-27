import { FunctionComponent } from 'react';

import { Snap } from '../../components';
import { SignMessage } from './SignMessage';

export const ETHERSJS_SNAP_ID = 'npm:@metamask/test-snap-ethersjs';
export const ETHERSJS_PORT = 8014;

export const Ethersjs: FunctionComponent = () => {
  return (
    <Snap
      name="ethers.js test Snap"
      snapId={ETHERSJS_SNAP_ID}
      port={ETHERSJS_PORT}
      testId="ethersjsSnap"
    >
      <SignMessage />
    </Snap>
  );
};
