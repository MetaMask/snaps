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
    methodHandlers: function() {
        return methodHandlers;
    },
    handlers: function() {
        return handlers;
    }
});
const _getSnaps = require("./getSnaps");
const _invokeKeyring = require("./invokeKeyring");
const _invokeSnapSugar = require("./invokeSnapSugar");
const _requestSnaps = require("./requestSnaps");
const methodHandlers = {
    wallet_getSnaps: _getSnaps.getSnapsHandler,
    wallet_requestSnaps: _requestSnaps.requestSnapsHandler,
    wallet_invokeSnap: _invokeSnapSugar.invokeSnapSugarHandler,
    wallet_invokeKeyring: _invokeKeyring.invokeKeyringHandler
};
const handlers = Object.values(methodHandlers);

//# sourceMappingURL=handlers.js.map