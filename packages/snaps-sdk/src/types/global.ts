import type { SnapsEthereumProvider, SnapsProvider } from './provider';

/**
 * Constants that are available globally in the Snap.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Redeclared in .d.cts file
  const ethereum: SnapsEthereumProvider;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Redeclared in .d.cts file
  const snap: SnapsProvider;
}
