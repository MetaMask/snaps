import type { SnapsEthereumProvider, SnapsProvider } from './provider';

/**
 * Constants that are available globally in the Snap.
 */
declare global {
  const ethereum: SnapsEthereumProvider;
  const snap: SnapsProvider;
}
