import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapEndowments } from './enum';
const permissionName = SnapEndowments.WebAssemblyAccess;
/**
 * `endowment:webassembly` returns the name of global browser API(s) that
 * enable access to the WebAssembly API.
 * This is intended to populate the endowments of the SES Compartment
 * in which a Snap executes.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the WebAssembly endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions)=>{
            return [
                'WebAssembly'
            ];
        },
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
export const webAssemblyEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=web-assembly.js.map