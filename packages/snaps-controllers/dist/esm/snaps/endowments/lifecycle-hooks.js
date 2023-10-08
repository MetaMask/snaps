import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapEndowments } from './enum';
const permissionName = SnapEndowments.LifecycleHooks;
/**
 * `endowment:lifecycle-hooks` returns nothing; it is intended to be used as a
 * flag by the snap controller to detect whether the snap has the capability to
 * use lifecycle hooks.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the `lifecycle-hooks` endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions)=>undefined,
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
export const lifecycleHooksEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=lifecycle-hooks.js.map