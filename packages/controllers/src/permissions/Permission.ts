import type { EthereumRpcError } from 'eth-rpc-errors';
import { Json } from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { Caveat, CaveatInterface, ZcapLdCaveat } from './Caveat';

/**
 * The origin of a subject.
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
type ZcapLdCapability = {
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
   * In the context of MetaMask, this is simply the origin of subject.
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
};

type PermissionOptions = {
  /**
   * The method that the permission corresponds to.
   */
  target: MethodName;

  /**
   * The origin string of the subject that has the permission.
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
};

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
   * The origin string of the subject that has the permission.
   */
  public readonly invoker: OriginString;

  constructor(options: PermissionOptions) {
    const { caveats, id, invoker, target } = options;
    this.id = id ?? nanoid();
    this.parentCapability = target;
    this.invoker = invoker;
    this.caveats = caveats ?? null;
    this.date = new Date().getTime();
  }

  /**
   * Gets the value of the caveat of the specified type belonging to the
   * specified permission.
   *
   * @param permission The permission whose caveat value to retrieve.
   * @param caveatType The type of the caveat to retrieve.
   * @returns The caveat value, or undefined if no such caveat exists.
   */
  public static getCaveat(
    permission: Permission,
    caveatType: string,
  ): Caveat<Json> | undefined {
    return permission.caveats?.find((caveat) => caveat.type === caveatType);
  }
}

type RequestedPermission = {
  target: MethodName;
  caveats: CaveatInterface<Json>[] | null;
};

export type RequestedPermissions = Record<MethodName, RequestedPermission>;

export type RestrictedMethodContext = Readonly<{
  origin: OriginString;
  [key: string]: any;
}>;

export type RestrictedMethodRequest<Params extends Json> = {
  method: string;
  params?: Params;
  [key: string]: any;
};

export type SyncRestrictedMethodImplementation<
  Params extends Json,
  Result extends Json,
> = (
  request: RestrictedMethodRequest<Params>,
  context: RestrictedMethodContext,
) => Result | Error | EthereumRpcError<Json>;

export type AsyncRestrictedMethodImplementation<
  Params extends Json,
  Result extends Json,
> = (
  request: RestrictedMethodRequest<Params>,
  context: RestrictedMethodContext,
) => Promise<Result | Error | EthereumRpcError<Json>>;

export type RestrictedMethodImplementation<
  Params extends Json,
  Result extends Json,
> =
  | SyncRestrictedMethodImplementation<Params, Result>
  | AsyncRestrictedMethodImplementation<Params, Result>;

export type PermissionSpecification<
  FactoryOptions extends PermissionOptions,
  RequestData extends Record<string, unknown>,
  MethodImplementation extends RestrictedMethodImplementation<Json, Json>,
> = {
  /**
   * The target resource of the permission. In other words, at the time of
   * writing, the RPC method name.
   */
  target: string;

  /**
   * The factory function used to get permission objects. Permissions returned
   * by this function are presumed to valid, and they will not be passed to the
   * validator function associated with this specification (if any). In other
   * words, the factory function should validate the permissions it creates.
   *
   * If no factory is specified, the {@link Permission} constructor will be
   * used, and the validator function (if specified) will be called on newly
   * constructed permissions.
   */
  factory?: (options: FactoryOptions, requestData?: RequestData) => Permission;

  /**
   * The implementation of the restricted method that the permission
   * corresponds to.
   */
  methodImplementation: MethodImplementation;

  /**
   * The validator function used to validate permissions of the associated type
   * whenever they are mutated. The only way a permission can be legally mutated
   * is when its caveats are modified by the permission controller.
   *
   * The validator should throw an appropriate JSON-RPC error if validation fails.
   */
  validator?: (permission: Permission) => void;
};

export type PermissionSpecifications = Record<
  MethodName,
  PermissionSpecification<
    PermissionOptions,
    Record<string, unknown>,
    RestrictedMethodImplementation<Json, Json>
  >
>;
