import type { Json } from '@metamask/utils';

import type { State } from './utils';

export type BaseParams = { key?: string; encrypted?: boolean };

/**
 * The parameters for the `setState` JSON-RPC method.
 */
export type SetStateParams = BaseParams & {
  value: Json;
};

/**
 * The parameters for the `legacy_setState` JSON-RPC method.
 */
export type LegacySetStateParams = BaseParams & Partial<State>;
