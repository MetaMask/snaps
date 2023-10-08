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
    permittedMethods: function() {
        return _permitted.handlers;
    },
    createSnapsMethodMiddleware: function() {
        return _permitted.createSnapsMethodMiddleware;
    },
    SnapCaveatType: function() {
        return _snapsutils.SnapCaveatType;
    },
    selectHooks: function() {
        return _utils.selectHooks;
    }
});
const _permitted = require("./permitted");
_export_star(require("./restricted"), exports);
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("./utils");
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.js.map