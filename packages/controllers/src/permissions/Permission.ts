import { Json } from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { NonEmptyArray } from '../utils';
import { CaveatConstraint } from './Caveat';
// This is used in a docstring, but ESLint doesn't notice it.
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PermissionController } from './PermissionController';
import type { Caveat } from './Caveat';
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * The origin of a subject.
 * Effectively the GUID of an entity that can have permissions.
 */
export type OriginString = string;

/**
 * The name of a permission target.
 */
type TargetName = string;

/**
 * A `ZCAP-LD`-like permission object. A permission is associated with a
 * particular `invoker`, which is the holder of the permission. Possessing the
 * permission grants access to a particular restricted resource, identified by
 * the `parentCapability`. The use of the restricted resource may be further
 * restricted by any `caveats` associated with the permission.
 *
 * See the README for details.
 */
export type PermissionConstraint = {
  /**
   * The context(s) in which this capability is meaningful.
   *
   * It is required by the standard, but we make it optional since there is only
   * one context in our usage (i.e. the user's MetaMask instance).
   */
  readonly '@context'?: NonEmptyArray<string>;

  // TODO:TS4.4 Make optional
  /**
   * The caveats of the permission.
   * @see {@link Caveat} For more information.
   */
  readonly caveats: null | NonEmptyArray<CaveatConstraint>;

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
   * access to, for example a JSON-RPC method or endowment.
   */
  readonly parentCapability: string;
};

/**
 * A `ZCAP-LD`-like permission object. A permission is associated with a
 * particular `invoker`, which is the holder of the permission. Possessing the
 * permission grants access to a particular restricted resource, identified by
 * the `parentCapability`. The use of the restricted resource may be further
 * restricted by any `caveats` associated with the permission.
 *
 * See the README for details.
 *
 * @template TargetKey - They key of the permission target that the permission
 * corresponds to.
 * @template AllowedCaveat - A union of the allowed {@link Caveat} types
 * for the permission.
 */
export type ValidPermission<
  TargetKey extends TargetName,
  AllowedCaveat extends CaveatConstraint,
> = PermissionConstraint & {
  // TODO:TS4.4 Make optional
  /**
   * The caveats of the permission.
   * @see {@link Caveat} For more information.
   */
  readonly caveats: AllowedCaveat extends never
    ? null
    : NonEmptyArray<AllowedCaveat> | null;

  /**
   * A pointer to the resource that possession of the capability grants
   * access to, for example a JSON-RPC method or endowment.
   */
  readonly parentCapability: ExtractPermissionTargetNames<TargetKey>;
};

/**
 * A utility type for ensuring that the given permission target name conforms to
 * our naming conventions.
 *
 * See the README for the distinction between target names and keys.
 */
type ValidTargetName<Name extends string> = Name extends `${string}*`
  ? never
  : Name extends `${string}_`
  ? never
  : Name;

/**
 * A utility type for extracting permission target names from a union of target
 * keys.
 *
 * See the README for the distinction between target names and keys.
 *
 * @template Key - The target key type to extract target names from.
 */
export type ExtractPermissionTargetNames<Key extends string> = ValidTargetName<
  Key extends `${infer Base}_*` ? `${Base}_${string}` : Key
>;

/**
 * Extracts the permission key of a particular name from a union of keys.
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
 * See the README for the distinction between target names and keys.
 *
 * @template Key - The target key type to extract from.
 * @template Name - The name whose key to extract.
 */
export type ExtractPermissionTargetKey<
  Key extends string,
  Name extends string,
> = Key extends Name ? Key : Extract<Key, KeyOfTargetName<Key, Name>>;

/**
 * Internal utility for extracting the members types of an array. The type
 * evalutes to `never` if the specified type is the empty tuple or neither
 * an array nor a tuple.
 *
 * @template ArrayType - The array type whose members to extract.
 */
type ExtractArrayMembers<ArrayType> = ArrayType extends []
  ? never
  : ArrayType extends any[] | readonly any[]
  ? ArrayType[number]
  : never;

/**
 * A utility type for extracting the allowed caveat types for a particular
 * permission from a permission specification type.
 *
 * @template PermissionSpecification - The permission specification type to
 * extract valid caveat types from.
 */
export type ExtractAllowedCaveatTypes<
  PermissionSpecification extends PermissionSpecificationConstraint,
> = ExtractArrayMembers<PermissionSpecification['allowedCaveats']>;

/**
 * The options object of {@link constructPermission}.
 *
 * @template TargetPermission - The {@link Permission} that will be constructed.
 */
export type PermissionOptions<TargetPermission extends PermissionConstraint> = {
  target: TargetPermission['parentCapability'];
  /**
   * The origin string of the subject that has the permission.
   */
  invoker: OriginString;

  /**
   * The caveats of the permission.
   * See {@link Caveat}.
   */
  caveats?: NonEmptyArray<CaveatConstraint>;
};

/**
 * The default permission factory function. Naively constructs a permission from
 * the inputs. Sets a default, random `id` if none is provided.
 *
 * @see {@link Permission} For more details.
 *
 * @template TargetPermission - The {@link Permission} that will be constructed.
 * @param options - The options for the permission.
 * @returns The new permission object.
 */
export function constructPermission<
  TargetPermission extends PermissionConstraint,
>(options: PermissionOptions<TargetPermission>): TargetPermission {
  const { caveats = null, invoker, target } = options;

  return {
    id: nanoid(),
    parentCapability: target,
    invoker,
    caveats,
    date: new Date().getTime(),
  } as TargetPermission;
}

/**
 * Gets the caveat of the specified type belonging to the specified permission.
 *
 * @param permission The permission whose caveat to retrieve.
 * @param caveatType The type of the caveat to retrieve.
 * @returns The caveat, or undefined if no such caveat exists.
 */
export function findCaveat(
  permission: PermissionConstraint,
  caveatType: string,
): CaveatConstraint | undefined {
  return permission.caveats?.find((caveat) => caveat.type === caveatType);
}

/**
 * A requested permission object. Just an object with any of the properties
 * of a {@link PermissionConstraint} object.
 */
type RequestedPermission = Partial<PermissionConstraint>;

/**
 * A record of target names and their {@link RequestedPermission} objects.
 */
export type RequestedPermissions = Record<TargetName, RequestedPermission>;

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
    method: TargetName;
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
export type RestrictedMethod<
  Params extends RestrictedMethodParameters,
  Result extends Json,
> =
  | SyncRestrictedMethod<Params, Result>
  | AsyncRestrictedMethod<Params, Result>;

export type ValidRestrictedMethod<
  MethodImplementation extends RestrictedMethod<any, any>,
> = MethodImplementation extends (args: infer Options) => Json | Promise<Json>
  ? Options extends RestrictedMethodOptions<RestrictedMethodParameters>
    ? MethodImplementation
    : never
  : never;

/**
 * {@link EndowmentGetter} parameter object.
 */
export type EndowmentGetterParams = {
  /**
   * The origin of the requesting subject.
   */
  origin: string;

  /**
   * Any additional data associated with the request.
   */
  requestData?: unknown;

  [key: string]: unknown;
};

/**
 * A synchronous or asynchronous function that gets the endowments for a
 * particular endowment permission. The getter receives the origin of the
 * requesting subject and, optionally, additional request metadata.
 */
export type EndowmentGetter<Endowments extends Json> = (
  options: EndowmentGetterParams,
) => Endowments | Promise<Endowments>;

export type PermissionFactory<
  TargetPermission extends PermissionConstraint,
  RequestData extends Record<string, unknown>,
> = (
  options: PermissionOptions<TargetPermission>,
  requestData?: RequestData,
) => TargetPermission;

export type PermissionValidatorConstraint = (
  permission: PermissionConstraint,
  origin?: OriginString,
  target?: string,
) => void;

/**
 * A utility type for ensuring that the given permission target key conforms to
 * our naming conventions.
 *
 * See the README for the distinction between target names and keys.
 *
 * @template Key - The target key string to apply the constraint to.
 */
type ValidTargetKey<Key extends string> = Key extends `${string}_*`
  ? Key
  : Key extends `${string}_`
  ? never
  : Key extends `${string}*`
  ? never
  : Key;

/**
 * The different possible types of permissions.
 */
export enum PermissionType {
  /**
   * A restricted JSON-RPC method. A subject must have the requisite permission
   * to call a restricted JSON-RPC method.
   */
  RestrictedMethod = 'RestrictedMethod',

  /**
   * An "endowment" granted to subjects that possess the requisite permission,
   * such as a global environment variable exposing a restricted API, etc.
   */
  Endowment = 'Endowment',
}

/**
 * The base constraint for permission specification objects. Every
 * {@link Permission} supported by a {@link PermissionController} must have an
 * associated specification, which is the source of truth for all permission-
 * related types. A permission specification includes the list of permitted
 * caveats, and any factory and validation functions specified by the consumer.
 * A concrete permission specification may specify further fields as necessary.
 *
 * See the README for more details.
 */
type PermissionSpecificationBase<Type extends PermissionType> = {
  /**
   * The type of the specified permission.
   */
  permissionType: Type;

  /**
   * The target resource of the permission. The shape of this string depends on
   * the permission type. For example, a restricted method target key will
   * consist of either a complete method name or the prefix of a namespaced
   * method, e.g. `wallet_snap_*`.
   */
  targetKey: string;

  /**
   * An array of the caveat types that may be added to instances of this
   * permission.
   */
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;

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
  validator?: PermissionValidatorConstraint;
};

/**
 * The constraint for restricted method permission specification objects.
 * Permissions that correspond to JSON-RPC methods are specified using objects
 * that conform to this type.
 *
 * See the README for more details.
 */
export type RestrictedMethodSpecificationConstraint =
  PermissionSpecificationBase<PermissionType.RestrictedMethod> & {
    /**
     * The implementation of the restricted method that the permission
     * corresponds to.
     */
    methodImplementation: RestrictedMethod<any, any>;
  };

/**
 * The constraint for endowment permission specification objects. Permissions
 * that endow callers with some restricted resource are specified using objects
 * that conform to this type.
 *
 * See the README for more details.
 */
export type EndowmentSpecificationConstraint =
  PermissionSpecificationBase<PermissionType.Endowment> & {
    /**
     * Endowment permissions do not support caveats.
     */
    allowedCaveats: null;

    /**
     * The {@link EndowmentGetter} function for the permission. This function
     * will be called by the {@link PermissionController} whenever the
     * permission is invoked, after which the host can apply the endowments to
     * the requesting subject in the intended manner.
     */
    endowmentGetter: EndowmentGetter<any>;
  };

/**
 * The constraint for permission specification objects. Every {@link Permission}
 * supported by a {@link PermissionController} must have an associated
 * specification, which is the source of truth for all permission-related types.
 * All specifications must adhere to the {@link PermissionSpecificationBase}
 * interface, but specifications may have different fields depending on the
 * {@link PermissionType}.
 *
 * See the README for more details.
 */
export type PermissionSpecificationConstraint =
  | EndowmentSpecificationConstraint
  | RestrictedMethodSpecificationConstraint;

/**
 * Options for {@link PermissionSpecificationBuilder} functions.
 */
type PermissionSpecificationBuilderOptions<
  FactoryHooks extends Record<string, unknown>,
  MethodHooks extends Record<string, unknown>,
  ValidatorHooks extends Record<string, unknown>,
> = {
  targetKey?: string;
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  factoryHooks?: FactoryHooks;
  methodHooks?: MethodHooks;
  validatorHooks?: ValidatorHooks;
};

/**
 * A function that builds a permission specification. Modules that specify
 * permissions for external consumption should make this their primary /
 * default export so that host applications can use them to generate concrete
 * specifications tailored to their requirements.
 */
export type PermissionSpecificationBuilder<
  Type extends PermissionType,
  Options extends PermissionSpecificationBuilderOptions<any, any, any>,
  Specification extends PermissionSpecificationConstraint & {
    permissionType: Type;
  },
> = (options: Options) => Specification;

/**
 * A restricted method permission export object, containing the
 * {@link PermissionSpecificationBuilder} function and "hook name" objects.
 */
export type PermissionSpecificationBuilderExportConstraint = {
  targetKey: string;
  specificationBuilder: PermissionSpecificationBuilder<
    PermissionType,
    PermissionSpecificationBuilderOptions<any, any, any>,
    PermissionSpecificationConstraint
  >;
  factoryHookNames?: Record<string, true>;
  methodHookNames?: Record<string, true>;
  validatorHookNames?: Record<string, true>;
};

type ValidRestrictedMethodSpecification<
  Specification extends RestrictedMethodSpecificationConstraint,
> = Specification['methodImplementation'] extends ValidRestrictedMethod<
  Specification['methodImplementation']
>
  ? Specification
  : never;

/**
 * Constraint for {@link PermissionSpecificationConstraint} objects that
 * evaluates to `never` if the specification contains any invalid fields.
 *
 * @template Specification - The permission specification to validate.
 */
export type ValidPermissionSpecification<
  Specification extends PermissionSpecificationConstraint,
> = Specification['targetKey'] extends ValidTargetKey<
  Specification['targetKey']
>
  ? Specification['permissionType'] extends PermissionType.Endowment
    ? Specification
    : Specification['permissionType'] extends PermissionType.RestrictedMethod
    ? ValidRestrictedMethodSpecification<
        Extract<Specification, RestrictedMethodSpecificationConstraint>
      >
    : never
  : never;

/**
 * Checks that the specification has the expected permission type.
 *
 * @param specification - The specification to check.
 * @param expectedType - The expected permission type.
 * @template Specification - The specification to check.
 * @template Type - The expected permission type.
 * @returns Whether or not the specification is of the expected type.
 */
export function hasSpecificationType<
  Specification extends PermissionSpecificationConstraint,
  Type extends PermissionType,
>(
  specification: Specification,
  expectedType: Type,
): specification is Specification & {
  permissionType: Type;
} {
  return specification.permissionType === expectedType;
}

/**
 * The specifications for all permissions supported by a particular
 * {@link PermissionController}.
 *
 * @template Specifications - The union of all {@link PermissionSpecificationConstraint} types.
 */
export type PermissionSpecificationMap<
  Specification extends PermissionSpecificationConstraint,
> = {
  [TargetKey in Specification['targetKey']]: Specification extends {
    targetKey: TargetKey;
  }
    ? Specification
    : never;
};

/**
 * Extracts a specific {@link PermissionSpecificationConstraint} from a union of
 * permission specifications.
 *
 * @template Specification - The specification union type to extract from.
 * @template TargetKey - The `targetKey` of the specification to extract.
 */
export type ExtractPermissionSpecification<
  Specification extends PermissionSpecificationConstraint,
  TargetKey extends Specification['targetKey'],
> = Specification extends {
  targetKey: TargetKey;
}
  ? Specification
  : never;
