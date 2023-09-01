import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import { PublicKey, SignMessage } from './components';
import { BIP_32_PORT, BIP_32_SNAP_ID, BIP_32_VERSION } from './constants';

export const BIP32: FunctionComponent = () => {
  return (
    <Snap
      name="BIP-32 Snap"
      snapId={BIP_32_SNAP_ID}
      port={BIP_32_PORT}
      version={BIP_32_VERSION}
      testId="bip32"
    >
      <PublicKey />
      <SignMessage curve="secp256k1" />
      <SignMessage curve="ed25519" />
    </Snap>
  );
};
