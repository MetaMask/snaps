import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import { SignMessage } from './components';
import { ETHERS_JS_PORT, ETHERS_JS_SNAP_ID } from './constants';

export const EthersJs: FunctionComponent = () => {
  return (
    <Snap
      name="Ethers.js Snap"
      snapId={ETHERS_JS_SNAP_ID}
      port={ETHERS_JS_PORT}
      testId="ethers-js"
    >
      <SignMessage />
    </Snap>
  );
};
