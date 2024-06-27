import type { HandlerType } from '@metamask/snaps-utils';
declare type SupportedHandler = HandlerType.OnRpcRequest | HandlerType.OnCronjob | HandlerType.OnTransaction;
/**
 * Get the handler ID from the current route.
 *
 * @returns The handler ID from the current route.
 */
export declare function useHandler(): SupportedHandler;
export {};
