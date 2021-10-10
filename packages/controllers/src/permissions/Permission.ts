import { Json } from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { Mutable, NonEmptyArray } from '../utils';
import { GenericCaveat } from './Caveat';
// This is used in a docstring, but ESLint doesn't notice it.
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PermissionController } from './PermissionController';
import type { CaveatBase } from './Caveat';
/* eslint-enable @typescript-eslint/no-unused-vars */

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
  AllowedCaveat extends GenericCaveat,
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
   * @see {@link CaveatBase} For more information.
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
  readonly parentCapability: Target;
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
 *
 * @template TargetKey - They key of the permission target that the permission
 * corresponds to.
 * @template AllowedCaveats - A union of the allowed {@link CaveatBase} types
 * for the permission.
 */
export type PermissionConstraint<
  TargetKey extends string,
  AllowedCaveats extends GenericCaveat,
> = TargetNameConstraint<ExtractPermissionTargetNames<TargetKey>> extends never
  ? never
  : PermissionBase<ExtractPermissionTargetNames<TargetKey>, AllowedCaveats>;

/**
 * A generic permission.
 */
export type GenericPermission = PermissionConstraint<
  GenericTargetName,
  GenericCaveat
>;

/**
 * A {@link GenericPermission} with mutable caveats.
 */
export type MutableGenericPermission = Mutable<
  GenericPermission & { caveats: NonEmptyArray<GenericCaveat> },
  'caveats'
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
 * Internal utility for extracting the members types of an array. The type
 * evalutes to `never` if the specified type is the empty tuple or neither
 * an array nor a tuple.
 *
 * @template T - The array type whose members to extract.
 */
type ExtractArrayMembers<T> = T extends readonly [...infer U] | [...infer U]
  ? U[number]
  : never;

/**
 * A utility type for extracting the allowed caveat types for a particular
 * permission from a permission specification type or type union.
 *
 * @template PermissionSpecification - The permission specification type to
 * extract valid caveat types from.
 * @template TargetName - The target name of the permission whose allowed
 * caveats to extract.
 */
export type ExtractAllowedCaveatTypes<
  PermissionSpecification extends PermissionSpecificationBase<string>,
  TargetName extends string,
> = PermissionSpecification extends PermissionSpecificationBase<
  ExtractPermissionTargetKey<PermissionSpecification['targetKey'], TargetName>
>
  ? ExtractArrayMembers<PermissionSpecification['allowedCaveats']>
  : never;

/**
 * The options object of {@link constructPermission}.
 *
 * @template Permission - The {@link PermissionBase} that will be constructed.
 */
export type PermissionOptions<Permission extends GenericPermission> = {
  target: Permission['parentCapability'];
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
   * See {@link CaveatBase}.
   */
  caveats?: NonEmptyArray<GenericCaveat>;
  // TODO: Refactor allowed caveats validation to enable this?
  // caveats?: NonEmptyArray<ExtractCaveats<Permission>>;
};

/**
 * The default permission factory function. Naively constructs a permission from
 * the inputs. Sets a default, random `id` if none is provided.
 *
 * @see {@link PermissionBase} For more details.
 *
 * @template Permission - The {@link PermissionBase} that will be constructed.
 * @param options - The options for the permission.
 * @returns The new permission object.
 */
export function constructPermission<Permission extends GenericPermission>(
  options: PermissionOptions<Permission>,
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

export type RestrictedMethodParameters = Json[] | Record<string, Json> | void;

/**
 * The arguments passed to a restricted method implementation.
 *
 * @template Params - The JSON-RPC parameters of the restricted method.
 */
export type RestrictedMethodOptions<Params extends RestrictedMethodParameters> =
  {
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
  Params extends RestrictedMethodParameters,
  Result extends Json,
> = (args: RestrictedMethodOptions<Params>) => Result;

/**
 * An asynchronous restricted method implementation.
 *
 * @template Params - The JSON-RPC parameters of the restricted method.
 * @template Result - The JSON-RPC result of the restricted method.
 */
export type AsyncRestrictedMethod<
  Params extends RestrictedMethodParameters,
  Result extends Json,
> = (args: RestrictedMethodOptions<Params>) => Promise<Result>;

/**
 * A synchronous or asynchronous restricted method implementation.
 *
 * @template Params - The JSON-RPC parameters of the restricted method.
 * @template Result - The JSON-RPC result of the restricted method.
 */
export type RestrictedMethodBase<
  Params extends RestrictedMethodParameters,
  Result extends Json,
> =
  | SyncRestrictedMethod<Params, Result>
  | AsyncRestrictedMethod<Params, Result>;

export type GenericRestrictedMethod = RestrictedMethodBase<
  RestrictedMethodParameters,
  Json
>;

export type RestrictedMethodConstraint<
  MethodImplementation extends RestrictedMethodBase<any, any>,
> = MethodImplementation extends (args: infer Options) => Json | Promise<Json>
  ? Options extends RestrictedMethodOptions<RestrictedMethodParameters>
    ? MethodImplementation
    : never
  : never;

export type PermissionFactory<
  Permission extends GenericPermission,
  RequestData extends Record<string, unknown>,
> = (
  options: PermissionOptions<Permission>,
  requestData?: RequestData,
) => Permission;

export type PermissionValidator<Permission extends GenericPermission> = (
  permission: GenericPermission,
  origin?: OriginString,
  target?: Permission['parentCapability'],
) => void;

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
 * A type extended by any function.
 */
type GenericFunction = (...args: any[]) => any;

/**
 * The base permission specification type.
 *
 * @template TargetKey - They key of the permission target that the permission
 * corresponds to.
 */
export type PermissionSpecificationBase<TargetKey extends string> = {
  /**
   * The target resource of the permission. In other words, at the time of
   * writing, the RPC method name.
   */
  targetKey: TargetKey;

  /**
   * An array of the caveat types that may be added to instances of this
   * permission.
   */
  allowedCaveats?: Readonly<NonEmptyArray<string>>;

  /**
   * The implementation of the restricted method that the permission
   * corresponds to.
   */
  methodImplementation: GenericFunction;

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
  factory?: PermissionFactory<any, Record<string, unknown>>;

  /**
   * The validator function used to validate permissions of the associated type
   * whenever they are mutated. The only way a permission can be legally mutated
   * is when its caveats are modified by the permission controller.
   *
   * The validator should throw an appropriate JSON-RPC error if validation fails.
   */
  validator?: PermissionValidator<GenericPermission>;
};

/**
 * An individual permission specification object. Constrained such that the
 * given target key must be valid.
 *
 * @template TargetKey - The key of the permission target.
 * @template Permission - The type of the permission object.
 */
export type PermissionSpecificationConstraint<T> =
  T extends PermissionSpecificationBase<string>
    ? T['targetKey'] extends TargetKeyConstraint<T['targetKey']>
      ? T['methodImplementation'] extends RestrictedMethodConstraint<
          T['methodImplementation']
        >
        ? T
        : never
      : never
    : never;

/**
 * The specifications for all permissions and restricted methods supported by
 * a particular {@link PermissionController}.
 *
 * @template Specifications - A union of all {@link PermissionSpecificationBase}
 * types.
 */
export type PermissionSpecificationsMap<
  Specification extends PermissionSpecificationBase<string>,
> = Specification extends PermissionSpecificationConstraint<Specification>
  ? {
      [TargetKey in Specification['targetKey']]: Specification extends PermissionSpecificationBase<TargetKey>
        ? Specification
        : never;
    }
  : never;
