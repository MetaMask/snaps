import { Json } from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { NonEmptyArray } from '../utils';
import { GenericCaveat } from './Caveat';
// This is used in a docstring, but ESLint doesn't notice it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PermissionController } from './PermissionController';

/**
 * The origin of a subject.
 * Effectively the GUID of an entity that can have permissions.
 */
export type OriginString = string;

/**
 * The name of a permission target.
 */
export type GenericTargetName = string;

/**
 * The base permission interface. Lacks important constraints on its generics;
 * consumers should use {@link PermissionConstraint} instead.
 */
export type PermissionBase<
  Target extends GenericTargetName,
  AllowedCaveat extends GenericCaveat | never,
> = {
  /**
   * The context(s) in which this capability is meaningful.
   *
   * It is required by the standard, but we make it optional since there is only
   * one context in our usage (i.e. the user's MetaMask instance).
   */
  readonly '@context'?: NonEmptyArray<string>;

  // TODO: Make optional in typescript@4.4.x
  /**
   * The caveats of the permission.
   * @see {@link CaveatConstraint} For more information.
   */
  readonly caveats: AllowedCaveat extends never
    ? null
    : NonEmptyArray<AllowedCaveat> | null;

  /**
   * The creation date of the permission, in UNIX epoch time.
   */
  readonly date: number;

  /**
   * The GUID of the permission object.
   */
  readonly id: string;

  /**
   * The origin string of the subject that has the permission.
   */
  readonly invoker: OriginString;

  /**
   * A pointer to the resource that possession of the capability grants
   * access to.
   *
   * In the context of MetaMask, this is always the name of an RPC method.
   */
  readonly parentCapability: Target extends `${string}_`
    ? `${Target}${string}`
    : Target;
};

/**
 * Makes the {@link PermissionBase.caveats} property of the given permission mutable.
 * Useful for mutating the caveats of a permission in state updates.
 *
 * @template Permission - The permission type to modify.
 */
export type MutableCaveats<Permission extends GenericPermission> = {
  -readonly [K in keyof Pick<Permission, 'caveats'>]: Permission[K];
} &
  {
    [K in keyof Omit<Permission, 'caveats'>]: Permission[K];
  };

/**
 * A utility type for ensuring that the given permission target name conforms to
 * our naming conventions.
 *
 * See the documentation for the distinction between target names and keys.
 */
type TargetNameConstraint<Name extends string> = Name extends `${string}*`
  ? never
  : Name extends `${string}_`
  ? never
  : Name;

/**
 * A utility type for extracting permission target names from a union of target
 * keys.
 *
 * See the documentation for the distinction between target names and keys.
 *
 * @template Key - The target key type to extract target names from.
 */
type ExtractPermissionTargetNames<Key extends string> =
  Key extends `${infer Base}_*` ? `${Base}_${string}` : Key;

/**
 * The consumer-facing base permission type.
 */
export type PermissionConstraint<
  TargetKey extends string,
  AllowedCaveat extends GenericCaveat | never,
> = TargetNameConstraint<ExtractPermissionTargetNames<TargetKey>> extends never
  ? never
  : PermissionBase<ExtractPermissionTargetNames<TargetKey>, AllowedCaveat>;

/**
 * A generic permission.
 */
export type GenericPermission = PermissionConstraint<
  GenericTargetName,
  GenericCaveat | never
>;

/**
 * An internal utility type used in {@link ExtractPermissionTargetKey}.
 *
 * @template Key - The target key type to extract from.
 * @template Name - The name whose key to extract.
 */
type KeyOfTargetName<
  Key extends string,
  Name extends string,
> = Name extends ExtractPermissionTargetNames<Key> ? Key : never;

/**
 * A utility type for finding the permission target key corresponding to a
 * target name. In a way, the inverse of {@link ExtractPermissionTargetNames}.
 *
 * See the documentation for the distinction between target names and keys.
 *
 * @template Key - The target key type to extract from.
 * @template Name - The name whose key to extract.
 */
type ExtractPermissionTargetKey<
  Key extends string,
  Name extends string,
> = Name extends Key ? Name : Extract<Key, KeyOfTargetName<Key, Name>>;

/**
 * @template Permission - The permission type to extract valid caveats from.
 * @template Key - The target key type to extract from.
 * @template Name - The target name of the permission.
 */
type ExtractValidCaveats<
  Permission extends GenericPermission,
  Key extends string,
  Name extends string,
> = Permission extends PermissionConstraint<
  ExtractPermissionTargetKey<Key, Name>,
  infer ValidCaveats
>
  ? ValidCaveats extends GenericCaveat
    ? ValidCaveats
    : never
  : never;

/**
 * A utility type for extracting the valid caveat types for a particular
 * permission from a union of permission types.
 *
 * @template Permission - The permission type to extract valid caveat types
 * types from.
 * @template Key - The target key type to extract from.
 * @template Name - The target name of the permission.
 */
export type ExtractValidCaveatTypes<
  Permission extends GenericPermission,
  Key extends string,
  Name extends string,
> = ExtractValidCaveats<Permission, Key, Name>['type'];

/**
 * The options object of {@link constructPermission}.
 */
export type PermissionOptions<TargetName extends string> = {
  target: TargetName;
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
   * See {@link CaveatConstraint}.
   */
  caveats?: NonEmptyArray<GenericCaveat>;
};

/**
 * The default permission factory function. Naively constructs a permission from
 * the inputs. Sets a default, random `id` if none is provided.
 *
 * @see {@link PermissionBase} For more details.
 *
 * @param options - The options for the permission.
 * @returns The new permission object.
 */
export function constructPermission(
  options: PermissionOptions<string>,
): GenericPermission {
  const { caveats = null, id, invoker, target } = options;

  return {
    id: id ?? nanoid(),
    parentCapability: target,
    invoker,
    caveats,
    date: new Date().getTime(),
  };
}

/**
 * Gets the the caveat of the specified type belonging to the specified
 * permission.
 *
 * @param permission The permission whose caveat to retrieve.
 * @param caveatType The type of the caveat to retrieve.
 * @returns The caveat, or undefined if no such caveat exists.
 */
export function findCaveat(
  permission: GenericPermission,
  caveatType: string,
): GenericCaveat | undefined {
  return permission.caveats?.find((caveat) => caveat.type === caveatType);
}

/**
 * A requested permission object. Just an object with any of the properties
 * of a {@link GenericPermission} object.
 */
type RequestedPermission = Partial<GenericPermission>;

/**
 * A record of target names and their {@link RequestedPermission} objects.
 */
export type RequestedPermissions = Record<
  GenericTargetName,
  RequestedPermission
>;

/**
 * The restricted method context object. Essentially a way to pass internal
 * arguments to restricted methods and caveat functions, most importantly the
 * requesting origin.
 */
type RestrictedMethodContext = Readonly<{
  origin: OriginString;
  [key: string]: any;
}>;

export type GenericRestrictedMethodParams = Json[] | Record<string, Json>;

/**
 * The arguments passed to a restricted method implementation.
 *
 * @template Params - The JSON-RPC parameters of the restricted method.
 */
export type RestrictedMethodOptions<
  Params extends GenericRestrictedMethodParams,
> = {
  method: GenericTargetName;
  params?: Params;
  context: RestrictedMethodContext;
};

/**
 * A synchronous restricted method implementation.
 *
 * @template Params - The JSON-RPC parameters of the restricted method.
 * @template Result - The JSON-RPC result of the restricted method.
 */
export type SyncRestrictedMethod<
  Params extends GenericRestrictedMethodParams,
  Result extends Json,
> = (args: RestrictedMethodOptions<Params>) => Result;

/**
 * An asynchronous restricted method implementation.
 *
 * @template Params - The JSON-RPC parameters of the restricted method.
 * @template Result - The JSON-RPC result of the restricted method.
 */
export type AsyncRestrictedMethod<
  Params extends GenericRestrictedMethodParams,
  Result extends Json,
> = (args: RestrictedMethodOptions<Params>) => Promise<Result>;

/**
 * A synchronous or asynchronous restricted method implementation.
 *
 * @template Params - The JSON-RPC parameters of the restricted method.
 * @template Result - The JSON-RPC result of the restricted method.
 */
export type RestrictedMethodBase<
  Params extends GenericRestrictedMethodParams,
  Result extends Json,
> =
  | SyncRestrictedMethod<Params, Result>
  | AsyncRestrictedMethod<Params, Result>;

export type RestrictedMethodConstraint<
  MethodImplementation extends RestrictedMethodBase<any, any>,
> = MethodImplementation extends (...args: infer Args) => Json
  ? Args extends GenericRestrictedMethodParams
    ? MethodImplementation
    : never
  : never;

// type ExtractPermission<
//   TargetKey extends string,
//   Permission extends PermissionConstraint<string, GenericCaveat | never>,
// > = Permission extends PermissionConstraint<TargetKey, GenericCaveat | never>
//   ? Permission
//   : never;

/**
 * The base permission specification interface. Lacks important constraints on
 * its generics; consumers should use {@link PermissionSpecificationConstraint}
 * instead.
 */
type PermissionSpecificationBase<
  TargetKey extends string,
  Permission extends PermissionConstraint<TargetKey, GenericCaveat | never>,
  RequestData extends Record<string, unknown>,
  MethodImplementation extends RestrictedMethodBase<
    GenericRestrictedMethodParams,
    Json
  >,
> = {
  /**
   * The target resource of the permission. In other words, at the time of
   * writing, the RPC method name.
   */
  target: TargetKey;

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
  // factory?: (options: PermissionOptions<Permission>, requestData?: RequestData) => Permission;
  factory?: (
    options: PermissionOptions<string>,
    requestData?: RequestData,
  ) => Permission;

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
  validator?: (
    permission: GenericPermission,
    origin?: string,
    target?: string,
  ) => void;
};

/**
 * A utility type for ensuring that the given permission target key conforms to
 * our naming conventions.
 *
 * See the documentation for the distinction between target names and keys.
 *
 * @template Key - The target key string to apply the constraint to.
 */
type TargetKeyConstraint<Key extends string> = Key extends `${string}_*`
  ? Key
  : Key extends `${string}_`
  ? never
  : Key extends `${string}*`
  ? never
  : Key;

/**
 * An individual permission specification object. Constrained such that the
 * given target key must be valid.
 *
 * @template TargetKey - The key of the permission target.
 * @template Permission - The type of the permission object.
 */
export type PermissionSpecificationConstraint<
  TargetKey extends string,
  Permission extends PermissionConstraint<TargetKey, GenericCaveat | never>,
  RequestData extends Record<string, unknown>,
  MethodImplementation extends RestrictedMethodBase<any, any>,
> = TargetKeyConstraint<TargetKey> extends never
  ? never
  : RestrictedMethodConstraint<MethodImplementation> extends never
  ? never
  : PermissionSpecificationBase<
      TargetKey,
      Permission,
      RequestData,
      MethodImplementation
    >;

export type GenericPermissionSpecification = PermissionSpecificationConstraint<
  string,
  GenericPermission,
  Record<string, unknown>,
  RestrictedMethodBase<GenericRestrictedMethodParams, Json>
>;

/**
 * Utility type used in {@link PermissionSpecifications} to map permission
 * target keys to their individual {@link PermissionSpecificationConstraint}
 * objects.
 */
type ExtractPermissionSpecification<
  TargetKey extends string,
  Permissions extends PermissionConstraint<TargetKey, GenericCaveat | never>,
  RestrictedMethods extends RestrictedMethodBase<any, any>,
  Specifications extends PermissionSpecificationConstraint<
    string,
    Permissions,
    Record<string, unknown>,
    RestrictedMethods
  >,
> = Specifications extends PermissionSpecificationConstraint<
  TargetKey,
  Permissions,
  Record<string, unknown>,
  RestrictedMethods
>
  ? Specifications
  : never;
// > = Permissions extends PermissionConstraint<TargetKey, GenericCaveat | never>
//   ? PermissionSpecificationConstraint<TargetKey, Permissions>
//   : never;

/**
 * The specifications for all permissions and restricted methods supported by
 * a particular {@link PermissionController}.
 */
export type PermissionSpecificationsMap<
  TargetKeys extends string,
  Permissions extends PermissionConstraint<TargetKeys, GenericCaveat | never>,
  RestrictedMethods extends RestrictedMethodBase<any, any>,
  Specifications extends PermissionSpecificationConstraint<
    TargetKeys,
    Permissions,
    Record<string, unknown>,
    RestrictedMethods
  >,
> = TargetKeyConstraint<TargetKeys> extends never
  ? never
  : RestrictedMethodConstraint<RestrictedMethods> extends never
  ? never
  : {
      [Key in TargetKeys]: Permissions extends PermissionConstraint<
        Key,
        GenericCaveat | never
      >
        ? ExtractPermissionSpecification<
            Key,
            Permissions,
            RestrictedMethods,
            Specifications
          >
        : never;
    };
//   [Key in TargetKeys]: Permissions extends PermissionConstraint<
//     Key,
//     GenericCaveat | never
//   >
//     ? Specifications extends PermissionSpecificationConstraint<
//         Key,
//         // Permissions,
//         ExtractPermission<Key, Permissions>,
//         Record<string, unknown>,
//         RestrictedMethods
//       >
//       ? Specifications
//       : never
//     : never;
// };
