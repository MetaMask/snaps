import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { assert, hasProperty, isObject, isPlainObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { SnapEndowments } from './enum';
const permissionName = SnapEndowments.TransactionInsight;
/**
 * `endowment:transaction-insight` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to show information on the transaction confirmation screen.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the transaction-insight endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: [
            SnapCaveatType.TransactionOrigin
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        validator: ({ caveats })=>{
            if (caveats !== null && caveats?.length > 1 || caveats?.length === 1 && caveats[0].type !== SnapCaveatType.TransactionOrigin) {
                throw ethErrors.rpc.invalidParams({
                    message: `Expected a single "${SnapCaveatType.TransactionOrigin}" caveat.`
                });
            }
        },
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
export const transactionInsightEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});
/**
 * Validates the type of the caveat value.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */ function validateCaveat(caveat) {
    if (!hasProperty(caveat, 'value') || !isPlainObject(caveat)) {
        throw ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.'
        });
    }
    const { value } = caveat;
    assert(typeof value === 'boolean', 'Expected caveat value to have type "boolean"');
}
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */ export function getTransactionInsightCaveatMapper(value) {
    if (!value || !isObject(value) || isObject(value) && Object.keys(value).length === 0) {
        return {
            caveats: null
        };
    }
    return {
        caveats: [
            {
                type: SnapCaveatType.TransactionOrigin,
                value: hasProperty(value, 'allowTransactionOrigin') && value.allowTransactionOrigin
            }
        ]
    };
}
/**
 * Getter function to get the transaction origin caveat from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the transaction origin caveat from.
 * @returns The transaction origin, or `null` if the permission does not have a
 * transaction origin caveat.
 */ export function getTransactionOriginCaveat(permission) {
    if (!permission?.caveats) {
        return null;
    }
    assert(permission.caveats.length === 1);
    assert(permission.caveats[0].type === SnapCaveatType.TransactionOrigin);
    const caveat = permission.caveats[0];
    return caveat.value ?? null;
}
export const transactionInsightCaveatSpecifications = {
    [SnapCaveatType.TransactionOrigin]: Object.freeze({
        type: SnapCaveatType.TransactionOrigin,
        validator: (caveat)=>validateCaveat(caveat)
    })
};

//# sourceMappingURL=transaction-insight.js.map