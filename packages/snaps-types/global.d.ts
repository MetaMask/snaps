import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from './src';

// Types that should be available globally within a Snap
declare global {
  const ethereum: MetaMaskInpageProvider;
  const snap: SnapsGlobalObject;
}
