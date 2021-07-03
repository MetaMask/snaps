import { Json } from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { Caveat, ZcapLdCaveat } from './Caveat';

/**
 * The origin of an external domain.
 * Effectively the GUID of an entity that can have permissions.
 */
export type OriginString = string;

/**
 * The name of a restricted method.
 */
export type MethodName = string;

/**
 * An interface
 */
interface ZcapLdCapability {
  /**
   * The context(s) in which this capability is meaningful.
   *
   * It is required by the standard, but we omit it because there is only one
   * context (the user's MetaMask instance).
   */
  '@context'?: string[];

  /**
   * The cryptograhically strong GUID of the capability.
   */
  id: string;

  /**
   * A pointer to the resource that possession of the capability grants
   * access to.
   *
   * In the context of MetaMask, this is always the name of an RPC method.
   */
  parentCapability: string;

  /**
   * A pointer to the the entity that may invoke this capability.
   *
   * By the standard, this a link – usually some kind of URI – to a cryptographic
   * key that the proof of the `proof` field "must validate against".
   *
   * In the context of MetaMask, this is simply the origin of an external domain.
   */
  invoker: string;

  /**
   * The issuing date, in UNIX epoch time.
   */
  date?: number;

  /**
   * An array of caveat objects. See {@link ZcapLdCaveat}.
   *
   * TODO: Make optional in typescript@4.4.x
   */
  caveats: ZcapLdCaveat[] | null;

  /**
   * The proof that this capability was delegated to the specified invoker.
   * By the standard, usually just a cryptographic signature of the capability
   * object, excluding this field.
   *
   * In MetaMask, the "proof" of validity is the existence of a valid capability
   * object in the designated part of our state tree, so this field is omitted.
   */
  proof?: string;
}

interface PermissionOptions {
  /**
   * The method that the permission corresponds to.
   */
  target: MethodName;

  /**
   * The origin string of the external domain that has the permission.
   */
  invoker: OriginString;

  /**
   * The GUID of the permission object.
   * Assigned if not provided.
   */
  id?: string;

  /**
   * The caveats of the permission.
   * See {@link Caveat}.
   */
  caveats?: Caveat<Json>[];
}

/**
 * TODO: Document
 */
export class Permission implements ZcapLdCapability {
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
  public readonly parentCapability: string;

  /**
   * The caveats of the permission.
   * @see Caveat
   *
   * TODO: Make optional in typescript@4.4.x
   */
  public readonly caveats: Caveat<Json>[] | null;

  /**
   * The origin string of the external domain that has the permission.
   */
  public readonly invoker: OriginString;

  constructor(options: PermissionOptions) {
    const { id, target, invoker, caveats } = options;
    this.id = id ?? nanoid();
    this.parentCapability = target;
    this.invoker = invoker;
    this.caveats = caveats ?? null;
    this.date = new Date().getTime();
  }
}

type RequestedPermission = Pick<PermissionOptions, 'caveats' | 'target'>;

export type RequestedPermissions = Record<MethodName, RequestedPermission>;
