import { SnapEndowments } from './endowments';

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
