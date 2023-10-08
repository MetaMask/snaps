import type { PermissionConstraint, PermissionSpecificationConstraint } from '@metamask/permission-controller';
import type { SnapPermissions } from '@metamask/snaps-utils';
/**
 * Map initial permissions as defined in a Snap manifest to something that can
 * be processed by the PermissionsController. Each caveat mapping function
 * should return a valid permission caveat value.
 *
 * This function does not validate the caveat values, since that is done by
 * the PermissionsController itself, upon requesting the permissions.
 *
 * @param initialPermissions - The initial permissions to process.
 * @returns The processed permissions.
 */
export declare function processSnapPermissions(initialPermissions: SnapPermissions): Record<string, Pick<PermissionConstraint, 'caveats'>>;
export declare const buildSnapEndowmentSpecifications: (excludedEndowments: string[]) => Record<string, PermissionSpecificationConstraint>;
export declare const buildSnapRestrictedMethodSpecifications: (excludedPermissions: string[], hooks: Record<string, unknown>) => Record<string, PermissionSpecificationConstraint>;
