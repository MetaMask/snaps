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
    methodName: function() {
        return methodName;
    },
    specificationBuilder: function() {
        return specificationBuilder;
    },
    manageAccountsImplementation: function() {
        return manageAccountsImplementation;
    },
    manageAccountsBuilder: function() {
        return manageAccountsBuilder;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _utils = require("@metamask/utils");
const _superstruct = require("superstruct");
const SnapMessageStruct = (0, _superstruct.union)([
    (0, _superstruct.object)({
        method: (0, _superstruct.string)()
    }),
    (0, _superstruct.object)({
        method: (0, _superstruct.string)(),
        params: (0, _superstruct.union)([
            (0, _superstruct.array)(_utils.JsonStruct),
            (0, _superstruct.record)((0, _superstruct.string)(), _utils.JsonStruct)
        ])
    })
]);
const methodName = 'snap_manageAccounts';
const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName: methodName,
        allowedCaveats,
        methodImplementation: manageAccountsImplementation(methodHooks),
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
function manageAccountsImplementation({ getSnapKeyring }) {
    return async function manageAccounts(options) {
        const { context: { origin }, params } = options;
        (0, _superstruct.assert)(params, SnapMessageStruct);
        const keyring = await getSnapKeyring(origin);
        return await keyring.handleKeyringSnapMessage(origin, params);
    };
}
const manageAccountsBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks: {
        getSnapKeyring: true
    }
});

//# sourceMappingURL=manageAccounts.js.map