import { SnapEndowments } from '@metamask/snaps-rpc-methods';
import { HandlerType } from '@metamask/snaps-utils';

// These permissions are allowed without being on the allowlist.
export const ALLOWED_PERMISSIONS = Object.freeze([
  'snap_dialog',
  'snap_manageState',
  'snap_notify',
  'snap_getLocale',
  SnapEndowments.Cronjob,
  SnapEndowments.HomePage,
  SnapEndowments.LifecycleHooks,
  SnapEndowments.EthereumProvider,
  SnapEndowments.TransactionInsight,
  SnapEndowments.SignatureInsight,
]);

export const LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS = {
  algorithm: 'PBKDF2' as const,
  params: {
    iterations: 10_000,
  },
};

/**
 * The timeout for debouncing state updates.
 */
export const STATE_DEBOUNCE_TIMEOUT = 500;

// The origin used to indicate requests coming from the client.
export const METAMASK_ORIGIN = 'metamask';

// These handlers are only allowed to be invoked by the client.
export const CLIENT_ONLY_HANDLERS = Object.freeze([
  HandlerType.OnClientRequest,
  HandlerType.OnSignature,
  HandlerType.OnTransaction,
  HandlerType.OnCronjob,
  HandlerType.OnNameLookup,
  HandlerType.OnHomePage,
  HandlerType.OnSettingsPage,
  HandlerType.OnUserInput,
  HandlerType.OnAssetsLookup,
  HandlerType.OnAssetsConversion,
  HandlerType.OnAssetHistoricalPrice,
  HandlerType.OnAssetsMarketData,
  HandlerType.OnWebSocketEvent,
]);
