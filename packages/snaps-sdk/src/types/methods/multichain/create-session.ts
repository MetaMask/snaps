import type { CaipAccountId, CaipChainId, Json } from '@metamask/utils';

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
 * @property requiredScopes - The required scopes of the session.
 * @property optionalScopes - The optional scopes of the session.
 * @property sessionProperties - The additional properties of the session.
 */
export type CreateSessionParams = {
  requiredScopes?: SessionScopes;
  optionalScopes?: SessionScopes;
  sessionProperties?: Json;
};

/**
 * The result returned for the `wallet_createSession` method.
 *
 * @property sessionScopes - The scopes granted for the session.
 * @property sessionProperties - The additional properties of the session.
 */
export type CreateSessionResult = {
  sessionScopes: SessionScopes;
  sessionProperties: Json;
};
