/**
 * The request parameters for the `wallet_revokeSession` method.
 *
 * @property scopes - The scopes to revoke.
 */
export type RevokeSessionParams = {
  scopes?: string[];
};

/**
 * The result returned for the `wallet_revokeSession` method.
 */
export type RevokeSessionResult = true;
