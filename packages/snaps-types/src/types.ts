import { StreamProvider } from '@metamask/providers';

/**
 * The type of `window.ethereum`.
 */
export type Ethereum = StreamProvider;

// Exported again for convenience.
export type { Json, JsonRpcRequest } from '@metamask/utils';
export { DialogType, NotificationType } from '@metamask/rpc-methods';
export type { SnapsGlobalObject } from '@metamask/rpc-methods';
export type {
  AccountId,
  ChainId,
  KeyringEvent,
  KeyringRequest,
  OnCronjobHandler,
  OnRpcRequestHandler,
  OnTransactionHandler,
  OnTransactionResponse,
  RequestArguments,
  SnapKeyring,
} from '@metamask/snaps-utils';
