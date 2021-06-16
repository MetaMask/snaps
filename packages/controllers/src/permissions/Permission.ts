import { Json } from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { Caveat } from './Caveat';

/**
 * The origin of an external domain.
 * Effectively the GUID of an entity that can have permissions.
 */
export type OriginString = string;

/**
 * The name of a restricted method.
 */
export type RestrictedMethodName = string;

interface PermissionOptions {
  /**
   * The method that the permission corresponds to.
   */
  method: RestrictedMethodName;

  /**
   * The origin string of the external domain that has the permission.
   */
  origin: OriginString;

  /**
   * The GUID of the permission object.
   * Assigned if not provided.
   */
  id?: string;

  /**
   * The caveats of the permission.
   * @see Caveat
   */
  caveats?: Caveat<Json>[];
}

/**
 * A permission is...
 */
export class Permission {
  /**
   * The GUID of the permission object.
   */
  public readonly id: string;

  /**
   * The creation date of the permission, in UNIX epoch time.
   */
  public readonly date: number;

  /**
   * The method that the permission corresponds to.
   */
  public readonly method: string;

  /**
   * The caveats of the permission.
   * @see Caveat
   *
   * TODO: Should be optional
   */
  public readonly caveats: Caveat<Json>[] | null;

  /**
   * The origin string of the external domain that has the permission.
   */
  public readonly invoker: OriginString;

  constructor({ method, origin, caveats, id }: PermissionOptions) {
    this.id = id ?? nanoid();
    this.method = method;
    this.invoker = origin;
    this.caveats = caveats ?? null;
    this.date = new Date().getTime();
  }
}

type RequestedPermission = Pick<PermissionOptions, 'caveats' | 'method'>;

export type RequestedPermissions = Record<OriginString, RequestedPermission>;

export interface DomainMetadata {
  origin: OriginString;
}

export interface PermissionsRequestMetadata extends DomainMetadata {
  id: string;
}

/**
 * Used for prompting the user about a proposed new permission.
 * Includes information about the domain granted, as well as the permissions
 * assigned.
 */
export interface PermissionsRequest {
  metadata: PermissionsRequestMetadata;
  permissions: RequestedPermissions;
}

export type UserApprovalPrompt = (
  permissionsRequest: PermissionsRequest,
) => Promise<RequestedPermissions>;

export interface PermissionsDomainEntry extends DomainMetadata {
  permissions: Record<RestrictedMethodName, Permission>;
}
