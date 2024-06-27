import type { BaseProvider } from '@metamask/providers';
import type { RequestFunction } from './methods';
declare type BaseProviderInstance = InstanceType<typeof BaseProvider>;
/**
 * The `window.ethereum` provider for Snaps.
 */
export declare type SnapsEthereumProvider = Pick<BaseProviderInstance, 'request'>;
/**
 * The `window.snap` provider.
 */
export declare type SnapsProvider = {
    request: RequestFunction;
};
export {};
