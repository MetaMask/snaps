import type { PermissionConstraint, SubjectPermissions } from '../permissions';

/**
 * The request parameters for the `snap_getPermissions` method.
 *
 */
export type GetPermissionsParams = never;

/**
 * The result returned by the `snap_getPermissions` method.
 *
 */
export type GetPermissionsResult = SubjectPermissions<PermissionConstraint>;
