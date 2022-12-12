import { StreamProvider } from '@metamask/providers';

/**
 * The type of `window.ethereum`.
 */
export type Ethereum = StreamProvider;

// Exported again for convenience.
export type { Json } from '@metamask/utils';
export type {
  RequestArguments,
  SnapsGlobalObject,
  OnRpcRequestHandler,
  OnCronjobHandler,
  OnTransactionHandler,
  OnTransactionResponse,
  SnapKeyring,
  KeyringRequest,
  KeyringEvent,
  ChainId,
  AccountId,
} from '@metamask/snaps-utils';
