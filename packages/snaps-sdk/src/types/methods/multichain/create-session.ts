import type { CaipAccountId, CaipChainId } from '@metamask/utils';

export type SessionScopes = Record<
  CaipChainId,
  {
    methods: string[];
    notifications: string[];
    accounts: CaipAccountId[];
  }
>;

/**
 * The request parameters for the `wallet_createSession` method.
 *
 * @property id - The id of the background event to cancel.
 */
export type CreateSessionParams = {
  requiredScopes?: SessionScopes;
  optionalScopes?: SessionScopes;
};

/**
 * The result returned for the `wallet_createSession` method.
 *
 * @property sessionScopes - The scopes granted for the session.
 */
export type CreateSessionResult = { sessionScopes: SessionScopes };
