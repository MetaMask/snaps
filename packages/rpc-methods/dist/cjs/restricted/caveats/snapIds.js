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
    snapIdsCaveatMapper: function() {
        return snapIdsCaveatMapper;
    },
    validateSnapIdsCaveat: function() {
        return validateSnapIdsCaveat;
    },
    SnapIdsCaveatSpecification: function() {
        return SnapIdsCaveatSpecification;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _superstruct = require("superstruct");
function snapIdsCaveatMapper(value) {
    return {
        caveats: [
            {
                type: _snapsutils.SnapCaveatType.SnapIds,
                value
            }
        ]
    };
}
function validateSnapIdsCaveat(caveat) {
    (0, _utils.assertStruct)(caveat, (0, _superstruct.type)({
        value: _snapsutils.SnapIdsStruct
    }), 'Expected caveat to have a value property of a non-empty object of snap IDs.', _ethrpcerrors.ethErrors.rpc.invalidParams);
}
const SnapIdsCaveatSpecification = {
    [_snapsutils.SnapCaveatType.SnapIds]: Object.freeze({
        type: _snapsutils.SnapCaveatType.SnapIds,
        validator: (caveat)=>validateSnapIdsCaveat(caveat),
        decorator: (method, caveat)=>{
            return async (args)=>{
                const { params, context: { origin } } = args;
                const snapIds = caveat.value;
                const { snapId } = params;
                if (!(0, _utils.hasProperty)(snapIds, snapId)) {
                    throw new Error(`${origin} does not have permission to invoke ${snapId} snap.`);
                }
                return await method(args);
            };
        }
    })
};

//# sourceMappingURL=snapIds.js.map