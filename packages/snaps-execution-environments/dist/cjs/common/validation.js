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
    JsonRpcRequestWithoutIdStruct: function() {
        return JsonRpcRequestWithoutIdStruct;
    },
    EndowmentStruct: function() {
        return EndowmentStruct;
    },
    isEndowment: function() {
        return isEndowment;
    },
    isEndowmentsArray: function() {
        return isEndowmentsArray;
    },
    PingRequestArgumentsStruct: function() {
        return PingRequestArgumentsStruct;
    },
    TerminateRequestArgumentsStruct: function() {
        return TerminateRequestArgumentsStruct;
    },
    ExecuteSnapRequestArgumentsStruct: function() {
        return ExecuteSnapRequestArgumentsStruct;
    },
    SnapRpcRequestArgumentsStruct: function() {
        return SnapRpcRequestArgumentsStruct;
    },
    OnTransactionRequestArgumentsStruct: function() {
        return OnTransactionRequestArgumentsStruct;
    },
    assertIsOnTransactionRequestArguments: function() {
        return assertIsOnTransactionRequestArguments;
    },
    OnNameLookupRequestArgumentsStruct: function() {
        return OnNameLookupRequestArgumentsStruct;
    },
    assertIsOnNameLookupRequestArguments: function() {
        return assertIsOnNameLookupRequestArguments;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _superstruct = require("superstruct");
const JsonRpcRequestWithoutIdStruct = (0, _superstruct.assign)((0, _superstruct.omit)(_utils.JsonRpcRequestStruct, [
    'id'
]), (0, _superstruct.object)({
    id: (0, _superstruct.optional)(_utils.JsonRpcIdStruct)
}));
const EndowmentStruct = (0, _superstruct.string)();
function isEndowment(value) {
    return (0, _superstruct.is)(value, EndowmentStruct);
}
function isEndowmentsArray(value) {
    return Array.isArray(value) && value.every(isEndowment);
}
const OkStruct = (0, _superstruct.literal)('OK');
const PingRequestArgumentsStruct = (0, _superstruct.optional)((0, _superstruct.union)([
    (0, _superstruct.literal)(undefined),
    (0, _superstruct.array)()
]));
const TerminateRequestArgumentsStruct = (0, _superstruct.union)([
    (0, _superstruct.literal)(undefined),
    (0, _superstruct.array)()
]);
const ExecuteSnapRequestArgumentsStruct = (0, _superstruct.tuple)([
    (0, _superstruct.string)(),
    (0, _superstruct.string)(),
    (0, _superstruct.optional)((0, _superstruct.array)(EndowmentStruct))
]);
const SnapRpcRequestArgumentsStruct = (0, _superstruct.tuple)([
    (0, _superstruct.string)(),
    (0, _superstruct.enums)(Object.values(_snapsutils.HandlerType)),
    (0, _superstruct.string)(),
    (0, _superstruct.assign)(JsonRpcRequestWithoutIdStruct, (0, _superstruct.object)({
        params: (0, _superstruct.optional)((0, _superstruct.record)((0, _superstruct.string)(), _utils.JsonStruct))
    }))
]);
const OnTransactionRequestArgumentsStruct = (0, _superstruct.object)({
    // TODO: Improve `transaction` type.
    transaction: (0, _superstruct.record)((0, _superstruct.string)(), _utils.JsonStruct),
    chainId: _snapsutils.ChainIdStruct,
    transactionOrigin: (0, _superstruct.nullable)((0, _superstruct.string)())
});
function assertIsOnTransactionRequestArguments(value) {
    (0, _utils.assertStruct)(value, OnTransactionRequestArgumentsStruct, 'Invalid request params');
}
const baseNameLookupArgs = {
    chainId: _snapsutils.ChainIdStruct
};
const domainRequestStruct = (0, _superstruct.object)({
    ...baseNameLookupArgs,
    address: (0, _superstruct.string)()
});
const addressRequestStruct = (0, _superstruct.object)({
    ...baseNameLookupArgs,
    domain: (0, _superstruct.string)()
});
const OnNameLookupRequestArgumentsStruct = (0, _superstruct.union)([
    domainRequestStruct,
    addressRequestStruct
]);
function assertIsOnNameLookupRequestArguments(value) {
    (0, _utils.assertStruct)(value, OnNameLookupRequestArgumentsStruct, 'Invalid request params');
}
const OkResponseStruct = (0, _superstruct.assign)(_utils.JsonRpcSuccessStruct, (0, _superstruct.object)({
    result: OkStruct
}));
const SnapRpcResponse = _utils.JsonRpcSuccessStruct;

//# sourceMappingURL=validation.js.map