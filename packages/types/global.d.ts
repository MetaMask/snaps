import { SnapCrypto, SnapMetamask, SnapProvider, SnapStorage } from './src';

export interface SnapGlobal {
  ethereum: SnapProvider;
  metamask: SnapMetamask;
  crypto: SnapCrypto;
  storage: SnapStorage;
}

// Types that should be available globally within a Snap
declare global {
  /**
   * @deprecated Use {@link SnapGlobal.ethereum snap.ethereum}
   */
  const wallet: SnapProvider;
  const snap: SnapGlobal;
}
