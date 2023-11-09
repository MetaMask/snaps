import type { JsonRpcError } from '@metamask/utils';

import type { Snap, SnapId } from '../snap';

/**
 * The request parameters for the `wallet_getSnaps` method.
 *
 * This method does not accept any parameters.
 */
export type GetSnapsParams = never;

/**
 * The result returned by the `wallet_getSnaps` method.
 *
 * It consists of a map of Snap IDs to either the Snap object or an error.
 */
export type GetSnapsResult = Record<SnapId, { error: JsonRpcError } | Snap>;
