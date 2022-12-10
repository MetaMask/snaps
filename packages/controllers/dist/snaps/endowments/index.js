"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endowmentCaveatMappers = exports.endowmentCaveatSpecifications = exports.endowmentPermissionBuilders = void 0;
const cronjob_1 = require("./cronjob");
const long_running_1 = require("./long-running");
const network_access_1 = require("./network-access");
const transaction_insight_1 = require("./transaction-insight");
const keyring_1 = require("./keyring");
exports.endowmentPermissionBuilders = {
    [network_access_1.networkAccessEndowmentBuilder.targetKey]: network_access_1.networkAccessEndowmentBuilder,
    [long_running_1.longRunningEndowmentBuilder.targetKey]: long_running_1.longRunningEndowmentBuilder,
    [transaction_insight_1.transactionInsightEndowmentBuilder.targetKey]: transaction_insight_1.transactionInsightEndowmentBuilder,
    [keyring_1.keyringEndowmentBuilder.targetKey]: keyring_1.keyringEndowmentBuilder,
    [cronjob_1.cronjobEndowmentBuilder.targetKey]: cronjob_1.cronjobEndowmentBuilder,
};
exports.endowmentCaveatSpecifications = Object.assign(Object.assign({}, keyring_1.keyringCaveatSpecifications), cronjob_1.cronjobCaveatSpecifications);
exports.endowmentCaveatMappers = {
    [keyring_1.keyringEndowmentBuilder.targetKey]: keyring_1.getKeyringCaveatMapper,
    [cronjob_1.cronjobEndowmentBuilder.targetKey]: cronjob_1.getCronjobCaveatMapper,
};
__exportStar(require("./enum"), exports);
//# sourceMappingURL=index.js.map