import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapEndowments } from './enum';
const permissionName = SnapEndowments.EthereumProvider;
/**
 * `endowment:ethereum-provider` returns the name of the ethereum global browser API.
 * This is intended to populate the endowments of the
 * SES Compartment in which a Snap executes.
 *
 * This populates the global scope with an EIP-1193 provider, which DOES NOT implement all legacy functionality exposed to dapps.
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
                'ethereum'
            ];
        },
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
export const ethereumProviderEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=ethereum-provider.js.map