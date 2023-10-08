import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapEndowments } from './enum';
const permissionName = SnapEndowments.NetworkAccess;
/**
 * `endowment:network-access` returns the name of global browser API(s) that
 * enable network access. This is intended to populate the endowments of the
 * SES Compartment in which a Snap executes.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the network endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions)=>{
            return [
                'fetch',
                'Request',
                'Headers',
                'Response'
            ];
        },
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
export const networkAccessEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=network-access.js.map