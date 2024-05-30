import type { Json } from '@metamask/utils';

import type { InvokeSnapParams } from './invoke-snap';

export enum AccountsSnapHandlerType {
  Keyring = 'keyring',
  Chain = 'chain',
}

/**
 * The request parameters for the `wallet_invokeAccountsSnap` method.
 *
 * @property snapId - The ID of the snap to invoke.
 * @property request - The JSON-RPC request to send to the snap.
 * @property type - The type of handler to invoke.
 */
export type InvokeAccountsSnapParams = InvokeSnapParams & {
  type: AccountsSnapHandlerType;
};

/**
 * The result returned by the `wallet_invokeAccountsSnap` method, which is the result
 * returned by the Snap.
 */
export type InvokeAccountsSnapResult = Json;
