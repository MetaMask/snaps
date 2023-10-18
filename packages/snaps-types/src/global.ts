import type { MetaMaskInpageProvider } from '@metamask/providers';
import type { SnapsGlobalObject } from '@metamask/snaps-rpc-methods';

// Types that should be available globally within a snap.
declare global {
  const ethereum: MetaMaskInpageProvider;
  const snap: SnapsGlobalObject;
}
