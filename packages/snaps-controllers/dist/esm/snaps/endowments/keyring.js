import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { assertIsKeyringOrigins, SnapCaveatType } from '@metamask/snaps-utils';
import { assert, hasProperty, isPlainObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { SnapEndowments } from './enum';
const permissionName = SnapEndowments.Keyring;
/**
 * `endowment:keyring` returns nothing; it is intended to be used as a flag
 * by the client to detect whether the snap has keyring capabilities.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the keyring endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: [
            SnapCaveatType.KeyringOrigin
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.KeyringOrigin) {
                throw ethErrors.rpc.invalidParams({
                    message: `Expected a single "${SnapCaveatType.KeyringOrigin}" caveat.`
                });
            }
        },
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
export const keyringEndowmentBuilder = Object.freeze({
    targetName: permissionName,
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
            message: 'Invalid keyring origins: Expected a plain object.'
        });
    }
    const { value } = caveat;
    assertIsKeyringOrigins(value, ethErrors.rpc.invalidParams);
}
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */ export function getKeyringCaveatMapper(value) {
    return {
        caveats: [
            {
                type: SnapCaveatType.KeyringOrigin,
                value
            }
        ]
    };
}
/**
 * Getter function to get the {@link KeyringOrigins} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 * @throws If the permission does not have a valid {@link KeyringOrigins}
 * caveat.
 */ export function getKeyringCaveatOrigins(permission) {
    assert(permission?.caveats);
    assert(permission.caveats.length === 1);
    assert(permission.caveats[0].type === SnapCaveatType.KeyringOrigin);
    const caveat = permission.caveats[0];
    return caveat.value;
}
export const keyringCaveatSpecifications = {
    [SnapCaveatType.KeyringOrigin]: Object.freeze({
        type: SnapCaveatType.KeyringOrigin,
        validator: (caveat)=>validateCaveatOrigins(caveat)
    })
};

//# sourceMappingURL=keyring.js.map