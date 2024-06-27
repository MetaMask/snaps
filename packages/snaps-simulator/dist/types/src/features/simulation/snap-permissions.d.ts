import type { GenericPermissionController } from '@metamask/permission-controller';
export declare const ExcludedSnapEndowments: readonly never[];
/**
 * All unrestricted methods recognized by the PermissionController.
 * Unrestricted methods are ignored by the permission system, but every
 * JSON-RPC request seen by the permission system must correspond to a
 * restricted or unrestricted method, or the request will be rejected with a
 * "method not found" error.
 */
export declare const unrestrictedMethods: readonly string[];
export declare const getEndowments: (permissionController: GenericPermissionController, snapId: string) => Promise<string[]>;
