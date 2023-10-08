import type { StreamProvider } from '@metamask/providers';
import type { RequestArguments } from '@metamask/providers/dist/BaseProvider';
/**
 * Takes an error that was thrown, determines if it is
 * an error object. If it is then it will return that. Otherwise,
 * an error object is created with the original error message.
 *
 * @param originalError - The error that was originally thrown.
 * @returns An error object.
 */
export declare function constructError(originalError: unknown): Error | undefined;
/**
 * Make proxy for Promise and handle the teardown process properly.
 * If the teardown is called in the meanwhile, Promise result will not be
 * exposed to the snap anymore and warning will be logged to the console.
 *
 * @param originalPromise - Original promise.
 * @param teardownRef - Reference containing teardown count.
 * @param teardownRef.lastTeardown - Number of the last teardown.
 * @returns New proxy promise.
 */
export declare function withTeardown<Type>(originalPromise: Promise<Type>, teardownRef: {
    lastTeardown: number;
}): Promise<Type>;
/**
 * Returns a Proxy that narrows down (attenuates) the fields available on
 * the StreamProvider and replaces the request implementation.
 *
 * @param provider - Instance of a StreamProvider to be limited.
 * @param request - Custom attenuated request object.
 * @returns Proxy to the StreamProvider instance.
 */
export declare function proxyStreamProvider(provider: StreamProvider, request: unknown): StreamProvider;
export declare const BLOCKED_RPC_METHODS: readonly string[];
/**
 * Asserts the validity of request arguments for a snap outbound request using the `snap.request` API.
 *
 * @param args - The arguments to validate.
 */
export declare function assertSnapOutboundRequest(args: RequestArguments): void;
/**
 * Asserts the validity of request arguments for an ethereum outbound request using the `ethereum.request` API.
 *
 * @param args - The arguments to validate.
 */
export declare function assertEthereumOutboundRequest(args: RequestArguments): void;
/**
 * Gets a sanitized value to be used for passing to the underlying MetaMask provider.
 *
 * @param value - An unsanitized value from a snap.
 * @returns A sanitized value ready to be passed to a MetaMask provider.
 */
export declare function sanitizeRequestArguments(value: unknown): RequestArguments;
