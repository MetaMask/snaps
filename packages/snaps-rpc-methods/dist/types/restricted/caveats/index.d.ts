import type { PermissionConstraint } from '@metamask/permission-controller';
import type { Json } from '@metamask/utils';
export declare const caveatSpecifications: {
    readonly snapIds: import("@metamask/permission-controller").RestrictedMethodCaveatSpecificationConstraint;
    readonly permittedCoinTypes: import("@metamask/permission-controller").RestrictedMethodCaveatSpecificationConstraint;
    readonly permittedDerivationPaths: import("@metamask/permission-controller").RestrictedMethodCaveatSpecificationConstraint;
};
export declare const caveatMappers: Record<string, (value: Json) => Pick<PermissionConstraint, 'caveats'>>;
