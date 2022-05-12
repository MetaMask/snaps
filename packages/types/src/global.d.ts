import { SnapProvider } from './types';

// Types that should be available globally within a Snap
declare global {
  const wallet: SnapProvider;
}
