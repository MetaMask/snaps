import type { Json } from '@metamask/utils';

/**
 * An object containing the parameters for the `snap_manageAccounts` method.
 */
export type ManageAccountsParams = {
  /**
   * The method to call on the Snap.
   */
  method: string;

  /**
   * The optional parameters to pass to the Snap method.
   */
  params?: Json[] | Record<string, Json>;
};

/**
 * The result returned by the Snap. The structure of this result will depend on
 * the specific method that was called on the Snap, and is not defined by the
 * API.
 */
export type ManageAccountsResult = Json;
