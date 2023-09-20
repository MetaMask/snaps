import type { StreamProvider } from '@metamask/providers';

/**
 * The type of `window.ethereum`.
 */
export type Ethereum = StreamProvider;

// Exported again for convenience.
export type { Json, JsonRpcRequest } from '@metamask/utils';
export {
  DialogType,
  NotificationType,
  ManageStateOperation,
} from '@metamask/rpc-methods';
export type { SnapsGlobalObject } from '@metamask/rpc-methods';
export type {
  AccountId,
  ChainId,
  OnCronjobHandler,
  OnNameLookupHandler,
  OnRpcRequestHandler,
  OnTransactionHandler,
  OnTransactionResponse,
  OnNameLookupResponse,
  OnInstallHandler,
  OnUpdateHandler,
} from '@metamask/snaps-utils';
export { SeverityLevel } from '@metamask/snaps-utils';
