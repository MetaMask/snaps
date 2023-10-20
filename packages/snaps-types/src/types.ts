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
} from '@metamask/snaps-rpc-methods';
export type { SnapsGlobalObject } from '@metamask/snaps-rpc-methods';
export type {
  AccountId,
  ChainId,
  OnCronjobHandler,
  OnNameLookupHandler,
  OnRpcRequestHandler,
  OnTransactionHandler,
  OnTransactionResponse,
  OnNameLookupArgs,
  OnNameLookupResponse,
  OnInstallHandler,
  OnUpdateHandler,
  OnKeyringRequestHandler,
} from '@metamask/snaps-utils';
export { SeverityLevel, SnapError } from '@metamask/snaps-utils';
