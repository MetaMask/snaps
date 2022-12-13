import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-utils';

// Types that should be available globally within a snap.
declare global {
  const ethereum: MetaMaskInpageProvider;
  const snap: SnapsGlobalObject;
}
