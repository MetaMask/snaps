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
    processSnapPermissions: function() {
        return processSnapPermissions;
    },
    buildSnapEndowmentSpecifications: function() {
        return buildSnapEndowmentSpecifications;
    },
    buildSnapRestrictedMethodSpecifications: function() {
        return buildSnapRestrictedMethodSpecifications;
    }
});
const _rpcmethods = require("@metamask/rpc-methods");
const _utils = require("@metamask/utils");
const _endowments = require("./endowments");
function processSnapPermissions(initialPermissions) {
    return Object.fromEntries(Object.entries(initialPermissions).map(([initialPermission, value])=>{
        if ((0, _utils.hasProperty)(_rpcmethods.caveatMappers, initialPermission)) {
            return [
                initialPermission,
                _rpcmethods.caveatMappers[initialPermission](value)
            ];
        } else if ((0, _utils.hasProperty)(_endowments.endowmentCaveatMappers, initialPermission)) {
            return [
                initialPermission,
                _endowments.endowmentCaveatMappers[initialPermission](value)
            ];
        }
        // If we have no mapping, this may be a non-snap permission, return as-is
        return [
            initialPermission,
            value
        ];
    }));
}
const buildSnapEndowmentSpecifications = (excludedEndowments)=>Object.values(_endowments.endowmentPermissionBuilders).reduce((allSpecifications, { targetName, specificationBuilder })=>{
        if (!excludedEndowments.includes(targetName)) {
            allSpecifications[targetName] = specificationBuilder({});
        }
        return allSpecifications;
    }, {});
const buildSnapRestrictedMethodSpecifications = (excludedPermissions, hooks)=>Object.values(_rpcmethods.restrictedMethodPermissionBuilders).reduce((specifications, { targetName, specificationBuilder, methodHooks })=>{
        if (!excludedPermissions.includes(targetName)) {
            specifications[targetName] = specificationBuilder({
                // @ts-expect-error The selectHooks type is wonky
                methodHooks: (0, _rpcmethods.selectHooks)(hooks, methodHooks)
            });
        }
        return specifications;
    }, {});

//# sourceMappingURL=permissions.js.map