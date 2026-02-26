import type { JsonRpcError } from '@metamask/utils';

import type { Snap, SnapId } from '../snap';

/**
 * This method does not accept any parameters.
 */
export type GetSnapsParams = never;

/**
 * A map of Snap IDs to either the Snap metadata or an error.
 */
export type GetSnapsResult = Record<SnapId, { error: JsonRpcError } | Snap>;
