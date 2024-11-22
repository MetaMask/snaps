import type { Json } from '@metamask/utils';

/**
 * The request parameters for the `snap_manageAccounts` method.
 *
 * @property method - The method to call on the Snap.
 * @property params - The optional parameters to pass to the Snap method.
 */
export type ManageAccountsParams =
  | {
      method: string;
    }
  | {
      method: string;
      params: Json[] | Record<string, Json>;
    };

/**
 * The result returned by the `snap_manageAccounts` method, which is the result
 * returned by the Snap.
 */
export type ManageAccountsResult = Json;
