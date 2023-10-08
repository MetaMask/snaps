"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createSnapsMethodMiddleware", {
    enumerable: true,
    get: function() {
        return createSnapsMethodMiddleware;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _utils = require("../utils");
const _handlers = require("./handlers");
function createSnapsMethodMiddleware(isSnap, hooks) {
    // This is not actually a misused promise, the type is just wrong
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return async function methodMiddleware(request, response, next, end) {
        const handler = _handlers.methodHandlers[request.method];
        if (handler) {
            if (request.method.startsWith('snap_') && !isSnap) {
                return end(_ethrpcerrors.ethErrors.rpc.methodNotFound());
            }
            // TODO: Once json-rpc-engine types are up to date, we should type this correctly
            const { implementation, hookNames } = handler;
            try {
                // Implementations may or may not be async, so we must await them.
                return await implementation(request, response, next, end, (0, _utils.selectHooks)(hooks, hookNames));
            } catch (error) {
                (0, _snapsutils.logError)(error);
                return end(error);
            }
        }
        return next();
    };
}

//# sourceMappingURL=middleware.js.map