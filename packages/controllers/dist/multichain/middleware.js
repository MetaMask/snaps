"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMultiChainMiddleware = void 0;
const json_rpc_engine_1 = require("json-rpc-engine");
const utils_1 = require("@metamask/utils");
const snap_utils_1 = require("@metamask/snap-utils");
/**
 * Creates a middleware that handles requests to the multichain controller.
 *
 * @param hooks - The hooks required by the middleware.
 * @param hooks.onConnect - The onConnect hook.
 * @param hooks.onRequest - The onRequest hook.
 * @returns The middleware.
 */
function createMultiChainMiddleware({ onConnect, onRequest, }) {
    return (0, json_rpc_engine_1.createAsyncMiddleware)(async function middleware(req, res, next) {
        // This is added by other middleware
        const { origin, params: unwrapped } = req;
        if (req.method !== 'wallet_multiChainRequestHack') {
            await next();
            return;
        }
        (0, utils_1.assert)(unwrapped !== undefined, `Invalid params for ${req.method}`);
        switch (unwrapped.method) {
            case 'caip_request': {
                (0, snap_utils_1.assertIsMultiChainRequest)(unwrapped.params);
                res.result = await onRequest(origin, unwrapped.params);
                return;
            }
            case 'metamask_handshake': {
                (0, snap_utils_1.assertIsConnectArguments)(unwrapped.params);
                res.result = await onConnect(origin, unwrapped.params);
                return;
            }
            default: {
                await next();
            }
        }
    });
}
exports.createMultiChainMiddleware = createMultiChainMiddleware;
//# sourceMappingURL=middleware.js.map