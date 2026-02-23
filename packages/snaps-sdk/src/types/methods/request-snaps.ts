import type { JsonRpcError } from '@metamask/utils';

import type { Snap } from '../snap';

/**
 * An object mapping the IDs of the requested Snaps to optional SemVer version
 * ranges. The SemVer version ranges use the same semantics as NPM
 * `package.json` ranges.
 */
export type RequestSnapsParams = Record<string, { version?: string }>;

/**
 * An object mapping the IDs of the requested Snaps to either the installed Snap
 * or an error if the Snap failed to install or was not permitted.
 */
export type RequestSnapsResult = Record<string, { error: JsonRpcError } | Snap>;
