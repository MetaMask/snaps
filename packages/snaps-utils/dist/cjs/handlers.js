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
    HandlerType: function() {
        return HandlerType;
    },
    SeverityLevel: function() {
        return SeverityLevel;
    },
    SNAP_EXPORTS: function() {
        return SNAP_EXPORTS;
    }
});
var HandlerType;
(function(HandlerType) {
    HandlerType["OnRpcRequest"] = 'onRpcRequest';
    HandlerType["OnTransaction"] = 'onTransaction';
    HandlerType["OnCronjob"] = 'onCronjob';
    HandlerType["OnInstall"] = 'onInstall';
    HandlerType["OnUpdate"] = 'onUpdate';
    HandlerType["OnNameLookup"] = 'onNameLookup';
    HandlerType["OnKeyringRequest"] = 'onKeyringRequest';
})(HandlerType || (HandlerType = {}));
const SNAP_EXPORTS = {
    [HandlerType.OnRpcRequest]: {
        type: HandlerType.OnRpcRequest,
        required: true,
        validator: (snapExport)=>{
            return typeof snapExport === 'function';
        }
    },
    [HandlerType.OnTransaction]: {
        type: HandlerType.OnTransaction,
        required: true,
        validator: (snapExport)=>{
            return typeof snapExport === 'function';
        }
    },
    [HandlerType.OnCronjob]: {
        type: HandlerType.OnCronjob,
        required: true,
        validator: (snapExport)=>{
            return typeof snapExport === 'function';
        }
    },
    [HandlerType.OnNameLookup]: {
        type: HandlerType.OnNameLookup,
        required: true,
        validator: (snapExport)=>{
            return typeof snapExport === 'function';
        }
    },
    [HandlerType.OnInstall]: {
        type: HandlerType.OnInstall,
        required: false,
        validator: (snapExport)=>{
            return typeof snapExport === 'function';
        }
    },
    [HandlerType.OnUpdate]: {
        type: HandlerType.OnUpdate,
        required: false,
        validator: (snapExport)=>{
            return typeof snapExport === 'function';
        }
    },
    [HandlerType.OnKeyringRequest]: {
        type: HandlerType.OnKeyringRequest,
        required: true,
        validator: (snapExport)=>{
            return typeof snapExport === 'function';
        }
    }
};
var SeverityLevel;
(function(SeverityLevel) {
    SeverityLevel["Critical"] = 'critical';
})(SeverityLevel || (SeverityLevel = {}));

//# sourceMappingURL=handlers.js.map