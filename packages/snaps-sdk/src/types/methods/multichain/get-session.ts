import type { CreateSessionResult } from './create-session';

/**
 * The request parameters for the `wallet_getSession` method.
 *
 * This method does not accept any parameters.
 */
export type GetSessionParams = never;

/**
 * The result returned for the `wallet_getSession` method.
 *
 * @property sessionScopes - The scopes granted for the session.
 */
export type GetSessionResult = CreateSessionResult;
