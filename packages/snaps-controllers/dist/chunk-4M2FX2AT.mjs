// src/snaps/constants.ts
import { SnapEndowments } from "@metamask/snaps-rpc-methods";
var ALLOWED_PERMISSIONS = Object.freeze([
  "snap_dialog",
  "snap_manageState",
  "snap_notify",
  "snap_getLocale",
  SnapEndowments.Cronjob,
  SnapEndowments.HomePage,
  SnapEndowments.LifecycleHooks,
  SnapEndowments.EthereumProvider,
  SnapEndowments.TransactionInsight,
  SnapEndowments.SignatureInsight
]);
var LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS = {
  algorithm: "PBKDF2",
  params: {
    iterations: 1e4
  }
};

export {
  ALLOWED_PERMISSIONS,
  LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS
};
//# sourceMappingURL=chunk-4M2FX2AT.mjs.map