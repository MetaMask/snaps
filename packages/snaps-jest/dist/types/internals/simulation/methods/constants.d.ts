export declare const EXCLUDED_SNAP_ENDOWMENTS: never[];
export declare const EXCLUDED_SNAP_PERMISSIONS: never[];
/**
 * All unrestricted methods recognized by the `PermissionController`.
 * Unrestricted methods are ignored by the permission system, but every
 * JSON-RPC request seen by the permission system must correspond to a
 * restricted or unrestricted method, or the request will be rejected with a
 * "method not found" error.
 */
export declare const UNRESTRICTED_METHODS: readonly string[];
