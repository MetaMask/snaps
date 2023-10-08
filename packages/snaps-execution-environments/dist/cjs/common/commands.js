"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getHandlerArguments: function() {
        return getHandlerArguments;
    },
    getCommandMethodImplementations: function() {
        return getCommandMethodImplementations;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _validation = require("./validation");
function getHandlerArguments(origin, handler, request) {
    // `request` is already validated by the time this function is called.
    switch(handler){
        case _snapsutils.HandlerType.OnTransaction:
            {
                (0, _validation.assertIsOnTransactionRequestArguments)(request.params);
                const { transaction, chainId, transactionOrigin } = request.params;
                return {
                    transaction,
                    chainId,
                    transactionOrigin
                };
            }
        case _snapsutils.HandlerType.OnNameLookup:
            {
                (0, _validation.assertIsOnNameLookupRequestArguments)(request.params);
                // TS complains that domain/address are not part of the type
                // casting here as we've already validated the request args in the above step.
                const { chainId, domain, address } = request.params;
                return domain ? {
                    chainId,
                    domain
                } : {
                    chainId,
                    address
                };
            }
        case _snapsutils.HandlerType.OnRpcRequest:
        case _snapsutils.HandlerType.OnKeyringRequest:
            return {
                origin,
                request
            };
        case _snapsutils.HandlerType.OnCronjob:
        case _snapsutils.HandlerType.OnInstall:
        case _snapsutils.HandlerType.OnUpdate:
            return {
                request
            };
        default:
            return (0, _utils.assertExhaustive)(handler);
    }
}
function getCommandMethodImplementations(startSnap, invokeSnap, onTerminate) {
    return {
        ping: async ()=>Promise.resolve('OK'),
        terminate: async ()=>{
            onTerminate();
            return Promise.resolve('OK');
        },
        executeSnap: async (snapId, sourceCode, endowments)=>{
            await startSnap(snapId, sourceCode, endowments);
            return 'OK';
        },
        snapRpc: async (target, handler, origin, request)=>{
            return await invokeSnap(target, handler, getHandlerArguments(origin, handler, request)) ?? null;
        }
    };
}

//# sourceMappingURL=commands.js.map