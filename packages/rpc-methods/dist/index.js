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
exports.selectHooks = exports.SnapCaveatType = exports.permittedMethods = void 0;
var permitted_1 = require("./permitted");
Object.defineProperty(exports, "permittedMethods", { enumerable: true, get: function () { return permitted_1.handlers; } });
__exportStar(require("./restricted"), exports);
var snap_utils_1 = require("@metamask/snap-utils");
Object.defineProperty(exports, "SnapCaveatType", { enumerable: true, get: function () { return snap_utils_1.SnapCaveatType; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "selectHooks", { enumerable: true, get: function () { return utils_1.selectHooks; } });
//# sourceMappingURL=index.js.map