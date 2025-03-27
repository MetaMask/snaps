import type { FunctionComponent } from 'react';

import { PublicKey, SignMessage } from './components';
import { BIP_32_PORT, BIP_32_SNAP_ID, BIP_32_VERSION } from './constants';
import { Snap } from '../../../components';
import { useEntropySelector } from '../get-entropy/hooks';

export const BIP32: FunctionComponent = () => {
  const { selector, source } = useEntropySelector({
    id: 'bip32',
    snapId: BIP_32_SNAP_ID,
    port: BIP_32_PORT,
  });

  return (
    <Snap
      name="BIP-32 Snap"
      snapId={BIP_32_SNAP_ID}
      port={BIP_32_PORT}
      version={BIP_32_VERSION}
      testId="bip32"
    >
      {selector}
      <PublicKey source={source} />
      <SignMessage curve="secp256k1" source={source} />
      <SignMessage curve="ed25519" source={source} />
      <SignMessage curve="ed25519Bip32" source={source} />
    </Snap>
  );
};
