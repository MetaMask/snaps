"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "handleInstallSnaps", {
    enumerable: true,
    get: function() {
        return handleInstallSnaps;
    }
});
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
async function handleInstallSnaps(requestedSnaps, installSnaps) {
    if (!(0, _utils.isObject)(requestedSnaps)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: `Invalid snap installation params.`,
            data: {
                requestedSnaps
            }
        });
    } else if (Object.keys(requestedSnaps).length === 0) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: `Must specify at least one snap to install.`,
            data: {
                requestedSnaps
            }
        });
    }
    // installSnaps is bound to the origin
    return await installSnaps(requestedSnaps);
}

//# sourceMappingURL=snapInstallation.js.map