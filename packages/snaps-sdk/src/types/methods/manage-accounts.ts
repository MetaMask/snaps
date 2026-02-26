import type { Json } from '@metamask/utils';

/**
 * An object containing the parameters for the `snap_manageAccounts` method.
 */
export type ManageAccountsParams = {
  /**
   * The account management method to call.
   */
  method: string;

  /**
   * The parameters to pass to the account management method.
   */
  params?: Json[] | Record<string, Json>;
};

/**
 * The result returned by the client. The structure of this result depends on
 * the account management method that was called.
 */
export type ManageAccountsResult = Json;
