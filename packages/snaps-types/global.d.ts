import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapAPI } from './src';

// Types that should be available globally within a Snap
declare global {
  const ethereum: MetaMaskInpageProvider;
  const snap: SnapAPI;
}
