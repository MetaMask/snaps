/**
 * This file is auto generated.
 * Do not edit manually.
 */

import type { MultichainRoutingService } from './MultichainRoutingService';

/**
 * Handle an incoming JSON-RPC request tied to a specific scope by routing
 * to either a protocol Snap or an account Snap.
 *
 * Note: Addresses are considered case-sensitive by the MultichainRoutingService as
 * not all non-EVM chains are case-insensitive.
 *
 * @param options - An options bag.
 * @param options.connectedAddresses - Addresses currently connected to the
 * origin for the requested scope.
 * @param options.origin - The origin of the RPC request.
 * @param options.request - The JSON-RPC request.
 * @param options.scope - The CAIP-2 scope for the request.
 * @returns The response from the chosen Snap.
 * @throws If no handler was found.
 */
export type MultichainRoutingServiceHandleRequestAction = {
  type: `MultichainRoutingService:handleRequest`;
  handler: MultichainRoutingService['handleRequest'];
};

/**
 * Get a list of supported methods for a given scope.
 * This combines both protocol and account Snaps supported methods.
 *
 * @param scope - The CAIP-2 scope.
 * @returns A list of supported methods.
 */
export type MultichainRoutingServiceGetSupportedMethodsAction = {
  type: `MultichainRoutingService:getSupportedMethods`;
  handler: MultichainRoutingService['getSupportedMethods'];
};

/**
 * Get a list of supported accounts for a given scope.
 *
 * @param scope - The CAIP-2 scope.
 * @returns A list of CAIP-10 addresses.
 */
export type MultichainRoutingServiceGetSupportedAccountsAction = {
  type: `MultichainRoutingService:getSupportedAccounts`;
  handler: MultichainRoutingService['getSupportedAccounts'];
};

/**
 * Determine whether a given CAIP-2 scope is supported by the router.
 *
 * @param scope - The CAIP-2 scope.
 * @returns True if the router can service the scope, otherwise false.
 */
export type MultichainRoutingServiceIsSupportedScopeAction = {
  type: `MultichainRoutingService:isSupportedScope`;
  handler: MultichainRoutingService['isSupportedScope'];
};

/**
 * Union of all MultichainRoutingService action types.
 */
export type MultichainRoutingServiceMethodActions =
  | MultichainRoutingServiceHandleRequestAction
  | MultichainRoutingServiceGetSupportedMethodsAction
  | MultichainRoutingServiceGetSupportedAccountsAction
  | MultichainRoutingServiceIsSupportedScopeAction;
