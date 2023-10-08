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
    invokeSnapSugarHandler: function() {
        return invokeSnapSugarHandler;
    },
    invokeSnapSugar: function() {
        return invokeSnapSugar;
    },
    getValidatedParams: function() {
        return getValidatedParams;
    }
});
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const invokeSnapSugarHandler = {
    methodNames: [
        'wallet_invokeSnap'
    ],
    implementation: invokeSnapSugar,
    hookNames: undefined
};
function invokeSnapSugar(req, _res, next, end) {
    let params;
    try {
        params = getValidatedParams(req.params);
    } catch (error) {
        return end(error);
    }
    req.method = 'wallet_snap';
    req.params = params;
    return next();
}
function getValidatedParams(params) {
    if (!(0, _utils.isObject)(params)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected params to be a single object.'
        });
    }
    const { snapId, request } = params;
    if (!snapId || typeof snapId !== 'string' || snapId === '') {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Must specify a valid snap ID.'
        });
    }
    if (!(0, _utils.isObject)(request)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected request to be a single object.'
        });
    }
    return params;
}

//# sourceMappingURL=invokeSnapSugar.js.map