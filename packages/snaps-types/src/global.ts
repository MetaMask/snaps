import { MetaMaskInpageProvider } from '@metamask/providers';
import type { SnapsGlobalObject } from '@metamask/rpc-methods';

// Types that should be available globally within a snap.
declare global {
  const ethereum: MetaMaskInpageProvider;
  const snap: SnapsGlobalObject;
}
