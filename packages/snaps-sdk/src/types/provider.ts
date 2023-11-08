import type { BaseProvider } from '@metamask/providers';

import type { RequestFunction } from './methods';

type BaseProviderInstance = InstanceType<typeof BaseProvider>;

/**
 * The `window.ethereum` provider for Snaps.
 */
export type SnapsEthereumProvider = Pick<
  BaseProviderInstance,
  // Snaps have access to a limited set of methods. This is enforced by the
  // `proxyStreamProvider` function in `@metamask/snaps-execution-environments`.
  'request' | 'on' | 'removeListener'
>;

/**
 * The `window.snap` provider.
 */
export type SnapsProvider = {
  request: RequestFunction;
};
