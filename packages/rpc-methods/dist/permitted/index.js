"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const enable_1 = require("./enable");
const getAppKey_1 = require("./getAppKey");
const getSnaps_1 = require("./getSnaps");
const installSnaps_1 = require("./installSnaps");
const invokeSnapSugar_1 = require("./invokeSnapSugar");
exports.handlers = [
    enable_1.enableWalletHandler,
    getAppKey_1.getAppKeyHandler,
    getSnaps_1.getSnapsHandler,
    installSnaps_1.installSnapsHandler,
    invokeSnapSugar_1.invokeSnapSugarHandler,
];
//# sourceMappingURL=index.js.map