import type { JsonRpcError } from '@metamask/utils';

import type { Snap } from '../snap';

/**
 * The request parameters for the `wallet_requestSnaps` method.
 *
 * It consists of a map of Snap IDs to optional version strings to request.
 */
export type RequestSnapsParams = Record<string, { version?: string }>;

/**
 * The result returned by the `wallet_requestSnaps` method.
 *
 * It consists of a map of Snap IDs to either the Snap object or an error.
 */
export type RequestSnapsResult = Record<string, { error: JsonRpcError } | Snap>;
