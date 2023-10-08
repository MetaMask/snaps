import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { assertIsRpcOrigins, SnapCaveatType } from '@metamask/snaps-utils';
import { hasProperty, isPlainObject, assert } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { SnapEndowments } from './enum';
const targetName = SnapEndowments.Rpc;
/**
 * The specification builder for the JSON-RPC endowment permission.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the JSON-RPC endowment permission.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: PermissionType.Endowment,
        targetName,
        allowedCaveats: [
            SnapCaveatType.RpcOrigin
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.RpcOrigin) {
                throw ethErrors.rpc.invalidParams({
                    message: `Expected a single "${SnapCaveatType.RpcOrigin}" caveat.`
                });
            }
        },
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
export const rpcEndowmentBuilder = Object.freeze({
    targetName,
    specificationBuilder
});
/**
 * Validate the value of a caveat. This does not validate the type of the
 * caveat itself, only the value of the caveat.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */ function validateCaveatOrigins(caveat) {
    if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
        throw ethErrors.rpc.invalidParams({
            message: 'Invalid JSON-RPC origins: Expected a plain object.'
        });
    }
    const { value } = caveat;
    assertIsRpcOrigins(value, ethErrors.rpc.invalidParams);
}
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */ export function getRpcCaveatMapper(value) {
    return {
        caveats: [
            {
                type: SnapCaveatType.RpcOrigin,
                value
            }
        ]
    };
}
/**
 * Getter function to get the {@link RpcOrigins} caveat value from a permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 * @throws If the permission does not have a valid {@link RpcOrigins} caveat.
 */ export function getRpcCaveatOrigins(permission) {
    assert(permission?.caveats);
    assert(permission.caveats.length === 1);
    assert(permission.caveats[0].type === SnapCaveatType.RpcOrigin);
    const caveat = permission.caveats[0];
    return caveat.value;
}
export const rpcCaveatSpecifications = {
    [SnapCaveatType.RpcOrigin]: Object.freeze({
        type: SnapCaveatType.RpcOrigin,
        validator: (caveat)=>validateCaveatOrigins(caveat)
    })
};

//# sourceMappingURL=rpc.js.map