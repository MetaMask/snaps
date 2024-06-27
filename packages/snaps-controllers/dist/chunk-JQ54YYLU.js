"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/snaps/constants.ts
var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');
var ALLOWED_PERMISSIONS = Object.freeze([
  "snap_dialog",
  "snap_manageState",
  "snap_notify",
  "snap_getLocale",
  _snapsrpcmethods.SnapEndowments.Cronjob,
  _snapsrpcmethods.SnapEndowments.HomePage,
  _snapsrpcmethods.SnapEndowments.LifecycleHooks,
  _snapsrpcmethods.SnapEndowments.EthereumProvider,
  _snapsrpcmethods.SnapEndowments.TransactionInsight,
  _snapsrpcmethods.SnapEndowments.SignatureInsight
]);
var LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS = {
  algorithm: "PBKDF2",
  params: {
    iterations: 1e4
  }
};




exports.ALLOWED_PERMISSIONS = ALLOWED_PERMISSIONS; exports.LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS = LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS;
//# sourceMappingURL=chunk-JQ54YYLU.js.map