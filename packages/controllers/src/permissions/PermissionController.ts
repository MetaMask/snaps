import {
  AcceptRequest as AcceptApprovalRequest,
  AddApprovalRequest,
  BaseControllerV2 as BaseController,
  HasApprovalRequest,
  Json,
  RejectRequest as RejectApprovalRequest,
  RestrictedControllerMessenger,
  StateMetadata,
} from '@metamask/controllers';
/* eslint-enable @typescript-eslint/no-unused-vars */
import deepFreeze from 'deep-freeze-strict';
import { castDraft, Draft, Patch } from 'immer';
import { nanoid } from 'nanoid';
import {
  hasProperty,
  isNonEmptyArray,
  isPlainObject,
  isValidJson,
  Mutable,
  NonEmptyArray,
} from '../utils';
import {
  CaveatConstraint,
  CaveatSpecificationConstraint,
  CaveatSpecificationMap,
  decorateWithCaveats,
  ExtractCaveat,
  ExtractCaveats,
  ExtractCaveatValue,
} from './Caveat';
import {
  CaveatAlreadyExistsError,
  CaveatDoesNotExistError,
  CaveatInvalidJsonError,
  CaveatMissingValueError,
  DuplicateCaveatError,
  EndowmentPermissionDoesNotExistError,
  ForbiddenCaveatError,
  internalError,
  InvalidApprovedPermissionError,
  InvalidCaveatError,
  InvalidCaveatFieldsError,
  InvalidCaveatsPropertyError,
  InvalidCaveatTypeError,
  invalidParams,
  InvalidSubjectIdentifierError,
  methodNotFound,
  PermissionDoesNotExistError,
  PermissionsRequestNotFoundError,
  unauthorized,
  UnrecognizedCaveatTypeError,
  UnrecognizedSubjectError,
  userRejectedRequest,
} from './errors';
import {
  constructPermission,
  EndowmentSpecificationConstraint,
  ExtractAllowedCaveatTypes,
  ExtractPermissionSpecification,
  findCaveat,
  hasSpecificationType,
  OriginString,
  PermissionConstraint,
  PermissionSpecificationConstraint,
  PermissionSpecificationMap,
  PermissionType,
  RequestedPermissions,
  RestrictedMethod,
  RestrictedMethodParameters,
  RestrictedMethodSpecificationConstraint,
  ValidPermission,
  ValidPermissionSpecification,
} from './Permission';
import { getPermissionMiddlewareFactory } from './permission-middleware';
import { MethodNames } from './utils';

/**
 * Metadata associated with {@link PermissionController} subjects.
 */
export type PermissionSubjectMetadata = {
  origin: OriginString;
};

/**
 * Metadata associated with permission requests.
 */
export type PermissionsRequestMetadata = PermissionSubjectMetadata & {
  id: string;
};

/**
 * Used for prompting the user about a proposed new permission.
 * Includes information about the grantee subject, requested permissions, and
 * any additional information added by the consumer.
 *
 * All properties except `permissions` are passed to any factories found for
 * the requested permissions.
 */
export type PermissionsRequest = {
  metadata: PermissionsRequestMetadata;
  permissions: RequestedPermissions;
  [key: string]: Json;
};

/**
 * The name of the {@link PermissionController}.
 */
const controllerName = 'PermissionController';

/**
 * Permissions associated with a {@link PermissionController} subject.
 */
export type SubjectPermissions<Permission extends PermissionConstraint> =
  Record<Permission['parentCapability'], Permission>;

/**
 * Permissions and metadata associated with a {@link PermissionController}
 * subject.
 */
export type PermissionSubjectEntry<
  SubjectPermission extends PermissionConstraint,
> = {
  origin: SubjectPermission['invoker'];
  permissions: SubjectPermissions<SubjectPermission>;
};

/**
 * All subjects of a {@link PermissionController}.
 *
 * @template SubjectPermission - The permissions of the subject.
 */
export type PermissionControllerSubjects<
  SubjectPermission extends PermissionConstraint,
> = Record<
  SubjectPermission['invoker'],
  PermissionSubjectEntry<SubjectPermission>
>;

// TODO:TS4.4 Enable compiler flags to forbid unchecked member access
/**
 * The state of a {@link PermissionController}.
 *
 * @template Permission - The controller's permission type union.
 */
export type PermissionControllerState<Permission> =
  Permission extends PermissionConstraint
    ? {
        subjects: PermissionControllerSubjects<Permission>;
      }
    : never;

/**
 * Get the state metadata of the {@link PermissionController}.
 *
 * @template Permission - The controller's permission type union.
 */
function getStateMetadata<Permission extends PermissionConstraint>() {
  return { subjects: { anonymous: true, persist: true } } as StateMetadata<
    PermissionControllerState<Permission>
  >;
}

/**
 * Get the default state of the {@link PermissionController}.
 *
 * @template Permission - The controller's permission type union.
 */
function getDefaultState<Permission extends PermissionConstraint>() {
  return { subjects: {} } as PermissionControllerState<Permission>;
}

/**
 * Gets the state of the {@link PermissionController}.
 */
export type GetPermissionControllerState = {
  type: `${typeof controllerName}:getState`;
  handler: () => PermissionControllerState<PermissionConstraint>;
};

/**
 * Gets the names of all subjects from the {@link PermissionController}.
 */
export type GetSubjects = {
  type: `${typeof controllerName}:getSubjectNames`;
  handler: () => (keyof PermissionControllerSubjects<PermissionConstraint>)[];
};

/**
 * Gets the permissions for specified subject
 */
export type GetPermissions = {
  type: `${typeof controllerName}:getPermissions`;
  handler: GenericPermissionController['getPermissions'];
};

/**
 * Checks whether the specified subject has any permissions.
 */
export type HasPermissions = {
  type: `${typeof controllerName}:hasPermissions`;
  handler: GenericPermissionController['hasPermissions'];
};

/**
 * Checks whether the specified subject has a specific permission.
 */
export type HasPermission = {
  type: `${typeof controllerName}:hasPermission`;
  handler: GenericPermissionController['hasPermission'];
};

/**
 * Requests given permissions for a specified origin
 */
export type RequestPermissions = {
  type: `${typeof controllerName}:requestPermissions`;
  handler: GenericPermissionController['requestPermissions'];
};

/**
 * Removes all permissions for a given origin
 */
export type RevokeAllPermissions = {
  type: `${typeof controllerName}:revokeAllPermissions`;
  handler: GenericPermissionController['revokeAllPermissions'];
};

/**
 * Clears all permissions from the {@link PermissionController}.
 */
export type ClearPermissions = {
  type: `${typeof controllerName}:clearPermissions`;
  handler: () => void;
};

/**
 * Gets the endowments for the given subject and permission.
 */
export type GetEndowments = {
  type: `${typeof controllerName}:getEndowments`;
  handler: GenericPermissionController['getEndowments'];
};

/**
 * The {@link ControllerMessenger} actions of the {@link PermissionController}.
 */
export type PermissionControllerActions =
  | ClearPermissions
  | GetEndowments
  | GetPermissionControllerState
  | GetSubjects
  | GetPermissions
  | HasPermission
  | HasPermissions
  | RevokeAllPermissions
  | RequestPermissions;

/**
 * The generic state change event of the {@link PermissionController}.
 */
export type PermissionControllerStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [PermissionControllerState<PermissionConstraint>, Patch[]];
};

/**
 * The {@link ControllerMessenger} events of the {@link PermissionController}.
 *
 * The permission controller only emits its generic state change events.
 * Consumers should use selector subscriptions to subscribe to relevant
 * substate.
 */
export type PermissionControllerEvents = PermissionControllerStateChange;

/**
 * The external {@link ControllerMessenger} actions available to the
 * {@link PermissionController}.
 */
type AllowedActions =
  | AddApprovalRequest
  | HasApprovalRequest
  | AcceptApprovalRequest
  | RejectApprovalRequest;

/**
 * The messenger of the {@link PermissionController}.
 */
export type PermissionControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  PermissionControllerActions | AllowedActions,
  PermissionControllerEvents,
  AllowedActions['type'],
  never
>;

/**
 * A generic {@link PermissionController}.
 */
export type GenericPermissionController = PermissionController<
  PermissionSpecificationConstraint,
  CaveatSpecificationConstraint
>;

/**
 * Describes the possible results of a {@link CaveatMutator} function.
 */
export enum CaveatMutatorOperation {
  noop,
  updateValue,
  deleteCaveat,
  revokePermission,
}

/**
 * Given a caveat value, returns a {@link CaveatMutatorOperation} and, optionally,
 * a new caveat value.
 *
 * @see {@link PermissionController.updatePermissionsByCaveat} for more details.
 * @template Caveat - The caveat type for which this mutator is intended.
 * @param caveatValue - The existing value of the caveat being mutated.
 * @returns A tuple of the mutation result and, optionally, the new caveat
 * value.
 */
export type CaveatMutator<TargetCaveat extends CaveatConstraint> = (
  caveatValue: TargetCaveat['value'],
) => CaveatMutatorResult;

type CaveatMutatorResult =
  | Readonly<{
      operation: CaveatMutatorOperation.updateValue;
      value: CaveatConstraint['value'];
    }>
  | Readonly<{
      operation: Exclude<
        CaveatMutatorOperation,
        CaveatMutatorOperation.updateValue
      >;
    }>;

/**
 * Extracts the permission(s) specified by the given permission and caveat
 * specifications.
 *
 * @template ControllerPermissionSpecification - The permission specification(s)
 * to extract from.
 * @template ControllerCaveatSpecification - The caveat specification(s) to
 * extract from. Necessary because {@link Permission} has a generic parameter
 * that describes the allowed caveats for the permission.
 */
export type ExtractPermission<
  ControllerPermissionSpecification extends PermissionSpecificationConstraint,
  ControllerCaveatSpecification extends CaveatSpecificationConstraint,
> = ControllerPermissionSpecification extends ValidPermissionSpecification<ControllerPermissionSpecification>
  ? ValidPermission<
      ControllerPermissionSpecification['targetKey'],
      ExtractCaveats<ControllerCaveatSpecification>
    >
  : never;

/**
 * Extracts the restricted method permission(s) specified by the given
 * permission and caveat specifications.
 *
 * @template ControllerPermissionSpecification - The permission specification(s)
 * to extract from.
 * @template ControllerCaveatSpecification - The caveat specification(s) to
 * extract from. Necessary because {@link Permission} has a generic parameter
 * that describes the allowed caveats for the permission.
 */
export type ExtractRestrictedMethodPermission<
  ControllerPermissionSpecification extends PermissionSpecificationConstraint,
  ControllerCaveatSpecification extends CaveatSpecificationConstraint,
> = ExtractPermission<
  Extract<
    ControllerPermissionSpecification,
    RestrictedMethodSpecificationConstraint
  >,
  ControllerCaveatSpecification
>;

/**
 * Extracts the endowment permission(s) specified by the given permission and
 * caveat specifications.
 *
 * @template ControllerPermissionSpecification - The permission specification(s)
 * to extract from.
 * @template ControllerCaveatSpecification - The caveat specification(s) to
 * extract from. Necessary because {@link Permission} has a generic parameter
 * that describes the allowed caveats for the permission.
 */
export type ExtractEndowmentPermission<
  ControllerPermissionSpecification extends PermissionSpecificationConstraint,
  ControllerCaveatSpecification extends CaveatSpecificationConstraint,
> = ExtractPermission<
  Extract<ControllerPermissionSpecification, EndowmentSpecificationConstraint>,
  ControllerCaveatSpecification
>;

/**
 * Options for the {@link PermissionController} constructor.
 *
 * @template ControllerPermissionSpecification - A union of the types of all
 * permission specifications available to the controller. Any referenced caveats
 * must be included in the controller's caveat specifications.
 * @template ControllerCaveatSpecification - A union of the types of all
 * caveat specifications available to the controller.
 */
export type PermissionControllerOptions<
  ControllerPermissionSpecification extends PermissionSpecificationConstraint,
  ControllerCaveatSpecification extends CaveatSpecificationConstraint,
> = {
  messenger: PermissionControllerMessenger;
  caveatSpecifications: CaveatSpecificationMap<ControllerCaveatSpecification>;
  permissionSpecifications: PermissionSpecificationMap<ControllerPermissionSpecification>;
  unrestrictedMethods: string[];
  state?: Partial<
    PermissionControllerState<
      ExtractPermission<
        ControllerPermissionSpecification,
        ControllerCaveatSpecification
      >
    >
  >;
};

/**
 * The permission controller. See the README for details.
 *
 * Assumes the existence of an {@link ApprovalController} reachable via the
 * {@link ControllerMessenger}.
 *
 * @template ControllerPermissionSpecification - A union of the types of all
 * permission specifications available to the controller. Any referenced caveats
 * must be included in the controller's caveat specifications.
 * @template ControllerCaveatSpecification - A union of the types of all
 * caveat specifications available to the controller.
 */
export class PermissionController<
  ControllerPermissionSpecification extends PermissionSpecificationConstraint,
  ControllerCaveatSpecification extends CaveatSpecificationConstraint,
> extends BaseController<
  typeof controllerName,
  PermissionControllerState<
    ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >
  >,
  PermissionControllerMessenger
> {
  private readonly _caveatSpecifications: Readonly<
    CaveatSpecificationMap<ControllerCaveatSpecification>
  >;

  private readonly _permissionSpecifications: Readonly<
    PermissionSpecificationMap<ControllerPermissionSpecification>
  >;

  private readonly _unrestrictedMethods: ReadonlySet<string>;

  /**
   * The names of all JSON-RPC methods that will be ignored by the controller.
   */
  public get unrestrictedMethods(): ReadonlySet<string> {
    return this._unrestrictedMethods;
  }

  /**
   * Returns a `json-rpc-engine` middleware function factory, so that the rules
   * described by the state of this controller can be applied to incoming
   * JSON-RPC requests.
   *
   * The middleware **must** be added in the correct place in the middleware
   * stack in order for it to work. See the README for an example.
   */
  public createPermissionMiddleware: ReturnType<
    typeof getPermissionMiddlewareFactory
  >;

  /**
   * @param options - Permission controller options.
   * @param options.caveatSpecifications - The specifications of all caveats
   * available to the controller. See {@link CaveatSpecificationMap} and the
   * documentation for more details.
   * @param options.permissionSpecifications - The specifications of all
   * permissions available to the controller. See
   * {@link PermissionSpecificationMap} and the README for more details.
   * @param options.unrestrictedMethods - The callable names of all JSON-RPC
   * methods ignored by the new controller.
   * @param options.messenger - The controller messenger. See
   * {@link BaseController} for more information.
   * @param options.state - Existing state to hydrate the controller with at
   * initialization.
   */
  constructor(
    options: PermissionControllerOptions<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >,
  ) {
    const {
      caveatSpecifications,
      permissionSpecifications,
      unrestrictedMethods,
      messenger,
      state = {},
    } = options;

    super({
      name: controllerName,
      metadata:
        getStateMetadata<
          ExtractPermission<
            ControllerPermissionSpecification,
            ControllerCaveatSpecification
          >
        >(),
      messenger,
      state: {
        ...getDefaultState<
          ExtractPermission<
            ControllerPermissionSpecification,
            ControllerCaveatSpecification
          >
        >(),
        ...state,
      },
    });

    this._unrestrictedMethods = new Set(unrestrictedMethods);
    this._caveatSpecifications = deepFreeze({ ...caveatSpecifications });

    this.validatePermissionSpecifications(
      permissionSpecifications,
      this._caveatSpecifications,
    );

    this._permissionSpecifications = deepFreeze({
      ...permissionSpecifications,
    });

    this.registerMessageHandlers();
    this.createPermissionMiddleware = getPermissionMiddlewareFactory({
      executeRestrictedMethod: this._executeRestrictedMethod.bind(this),
      getRestrictedMethod: this.getRestrictedMethod.bind(this),
      isUnrestrictedMethod: this.unrestrictedMethods.has.bind(
        this.unrestrictedMethods,
      ),
    });
  }

  /**
   * Gets a permission specification.
   *
   * @param targetKey - The target key of the permission specification to get.
   * @returns The permission specification with the specified target key.
   */
  private getPermissionSpecification<
    TargetKey extends ControllerPermissionSpecification['targetKey'],
  >(
    targetKey: TargetKey,
  ): ExtractPermissionSpecification<
    ControllerPermissionSpecification,
    TargetKey
  > {
    return this._permissionSpecifications[targetKey];
  }

  /**
   * Gets a caveat specification.
   *
   * @param caveatType - The type of the caveat specification to get.
   * @returns The caveat specification with the specified type.
   */
  private getCaveatSpecification<
    CaveatType extends ControllerCaveatSpecification['type'],
  >(caveatType: CaveatType) {
    return this._caveatSpecifications[caveatType];
  }

  /**
   * Constructor helper for validating permission specifications. This is
   * intended to prevent the use of invalid target keys which, while impossible
   * to add in TypeScript, could rather easily occur in plain JavaScript.
   *
   * Throws an error if validation fails.
   *
   * @param permissionSpecifications - The permission specifications passed to
   * this controller's constructor.
   * @param caveatSpecifications - The caveat specifications passed to this
   * controller.
   */
  private validatePermissionSpecifications(
    permissionSpecifications: PermissionSpecificationMap<ControllerPermissionSpecification>,
    caveatSpecifications: CaveatSpecificationMap<ControllerCaveatSpecification>,
  ) {
    Object.entries<ControllerPermissionSpecification>(
      permissionSpecifications,
    ).forEach(
      ([
        targetKey,
        { permissionType, targetKey: innerTargetKey, allowedCaveats },
      ]) => {
        if (!permissionType || !hasProperty(PermissionType, permissionType)) {
          throw new Error(`Invalid permission type: "${permissionType}"`);
        }

        // Check if the target key is the empty string, ends with "_", or ends
        // with "*" but not "_*"
        if (!targetKey || /_$/u.test(targetKey) || /[^_]\*$/u.test(targetKey)) {
          throw new Error(`Invalid permission target key: "${targetKey}"`);
        }

        if (targetKey !== innerTargetKey) {
          throw new Error(
            `Invalid permission specification: key "${targetKey}" must match specification.target value "${innerTargetKey}".`,
          );
        }

        if (allowedCaveats) {
          allowedCaveats.forEach((caveatType) => {
            if (!hasProperty(caveatSpecifications, caveatType)) {
              throw new UnrecognizedCaveatTypeError(caveatType);
            }
          });
        }
      },
    );
  }

  /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */
  private registerMessageHandlers(): void {
    this.messagingSystem.registerActionHandler(
      `${controllerName}:clearPermissions`,
      () => this.clearState(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getEndowments`,
      (origin: string, targetName: string, requestData?: unknown) =>
        this.getEndowments(origin, targetName, requestData),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getSubjectNames`,
      () => this.getSubjectNames(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getPermissions`,
      (origin: OriginString) => this.getPermissions(origin),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:hasPermission`,
      (origin: OriginString, targetName: string) =>
        this.hasPermission(origin, targetName),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:hasPermissions`,
      (origin: OriginString) => this.hasPermissions(origin),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:revokeAllPermissions`,
      (origin: OriginString) => this.revokeAllPermissions(origin),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:requestPermissions`,
      (subject: PermissionSubjectMetadata, permissions: RequestedPermissions) =>
        this.requestPermissions(subject, permissions),
    );
  }

  /**
   * Clears the state of the controller.
   */
  clearState(): void {
    this.update((_draftState) => {
      return {
        ...getDefaultState<
          ExtractPermission<
            ControllerPermissionSpecification,
            ControllerCaveatSpecification
          >
        >(),
      };
    });
  }

  /**
   * Gets the permission specification corresponding to the given permission
   * type and target name. Throws an error if the target name does not
   * correspond to a permission, or if the specification is not of the
   * given permission type.
   *
   * @template Type - The type of the permission specification to get.
   * @param permissionType - The type of the permission specification to get.
   * @param targetName - The name of the permission whose specification to get.
   * @param requestingOrigin - The origin of the requesting subject, if any.
   * Will be added to any thrown errors.
   * @returns The specification object corresponding to the given type and
   * target name.
   */
  private getTypedPermissionSpecification<Type extends PermissionType>(
    permissionType: Type,
    targetName: string,
    requestingOrigin?: string,
  ): ControllerPermissionSpecification & { permissionType: Type } {
    const failureError =
      permissionType === PermissionType.RestrictedMethod
        ? methodNotFound(
            targetName,
            requestingOrigin ? { origin: requestingOrigin } : undefined,
          )
        : new EndowmentPermissionDoesNotExistError(
            targetName,
            requestingOrigin,
          );

    const targetKey = this.getTargetKey(targetName);
    if (!targetKey) {
      throw failureError;
    }

    const specification = this.getPermissionSpecification(targetKey);
    if (!hasSpecificationType(specification, permissionType)) {
      throw failureError;
    }

    return specification;
  }

  /**
   * Gets the implementation of the specified restricted method.
   *
   * A JSON-RPC error is thrown if the method does not exist.
   *
   * @see {@link PermissionController.executeRestrictedMethod} and
   * {@link PermissionController.createPermissionMiddleware} for internal usage.
   * @param method - The name of the restricted method.
   * @param origin - The origin associated with the request for the restricted
   * method, if any.
   * @returns The restricted method implementation.
   */
  getRestrictedMethod(
    method: string,
    origin?: string,
  ): RestrictedMethod<RestrictedMethodParameters, Json> {
    return this.getTypedPermissionSpecification(
      PermissionType.RestrictedMethod,
      method,
      origin,
    ).methodImplementation;
  }

  /**
   * @returns The origins (i.e. IDs) of all subjects.
   */
  getSubjectNames(): OriginString[] {
    return Object.keys(this.state.subjects);
  }

  /**
   * Gets the permission for the specified target of the subject corresponding
   * to the specified origin.
   *
   * @param origin - The origin of the subject.
   * @param targetName - The method name as invoked by a third party (i.e., not
   * a method key).
   * @returns The permission if it exists, or undefined otherwise.
   */
  getPermission<
    SubjectPermission extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >,
  >(
    origin: OriginString,
    targetName: SubjectPermission['parentCapability'],
  ): SubjectPermission | undefined {
    return this.state.subjects[origin]?.permissions[targetName] as
      | SubjectPermission
      | undefined;
  }

  /**
   * Gets all permissions for the specified subject, if any.
   *
   * @param origin - The origin of the subject.
   * @returns The permissions of the subject, if any.
   */
  getPermissions(origin: OriginString) {
    return this.state.subjects[origin]?.permissions;
  }

  /**
   * Checks whether the subject with the specified origin has the specified
   * permission.
   *
   * @param origin - The origin of the subject.
   * @param target - The target name of the permission.
   * @returns Whether the subject has the permission.
   */
  hasPermission(
    origin: OriginString,
    target: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
  ): boolean {
    return Boolean(this.getPermission(origin, target));
  }

  /**
   * Checks whether the subject with the specified origin has any permissions.
   * Use this if you want to know if a subject "exists".
   *
   * @param origin - The origin of the subject to check.
   * @returns Whether the subject has any permissions.
   */
  hasPermissions(origin: OriginString): boolean {
    return Boolean(this.state.subjects[origin]);
  }

  /**
   * Revokes all permissions from the specified origin.
   *
   * Throws an error of the origin has no permissions.
   *
   * @param origin - The origin whose permissions to revoke.
   */
  revokeAllPermissions(origin: OriginString): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        throw new UnrecognizedSubjectError(origin);
      }
      delete draftState.subjects[origin];
    });
  }

  /**
   * Revokes the specified permission from the subject with the specified
   * origin.
   *
   * Throws an error if the subject or the permission does not exist.
   *
   * @param origin - The origin of the subject whose permission to revoke.
   * @param target - The target name of the permission to revoke.
   */
  revokePermission(
    origin: OriginString,
    target: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
  ): void {
    this.revokePermissions({ [origin]: [target] });
  }

  /**
   * Revokes the specified permissions from the specified subjects.
   *
   * Throws an error if any of the subjects or permissions do not exist.
   *
   * @param subjectsAndPermissions - An object mapping subject origins
   * to arrays of permission target names to revoke.
   */
  revokePermissions(
    subjectsAndPermissions: Record<
      OriginString,
      NonEmptyArray<
        ExtractPermission<
          ControllerPermissionSpecification,
          ControllerCaveatSpecification
        >['parentCapability']
      >
    >,
  ): void {
    this.update((draftState) => {
      Object.keys(subjectsAndPermissions).forEach((origin) => {
        if (!hasProperty(draftState.subjects, origin)) {
          throw new UnrecognizedSubjectError(origin);
        }

        subjectsAndPermissions[origin].forEach((target) => {
          const { permissions } = draftState.subjects[origin];
          if (!hasProperty(permissions as Record<string, unknown>, target)) {
            throw new PermissionDoesNotExistError(origin, target);
          }

          this.deletePermission(draftState.subjects, origin, target);
        });
      });
    });
  }

  /**
   * Revokes all permissions corresponding to the specified target for all subjects.
   * Does nothing if no subjects or no such permission exists.
   *
   * @param target - The name of the target to revoke all permissions for.
   */
  revokePermissionForAllSubjects(
    target: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
  ): void {
    if (this.getSubjectNames().length === 0) {
      return;
    }

    this.update((draftState) => {
      Object.entries(draftState.subjects).forEach(([origin, subject]) => {
        const { permissions } = subject;

        if (hasProperty(permissions as Record<string, unknown>, target)) {
          this.deletePermission(draftState.subjects, origin, target);
        }
      });
    });
  }

  /**
   * Deletes the permission identified by the given origin and target. If the
   * permission is the single remaining permission of its subject, the subject
   * is also deleted.
   *
   * @param subjects - The draft permission controller subjects.
   * @param origin - The origin of the subject associated with the permission
   * to delete.
   * @param target - The target name of the permission to delete.
   */
  private deletePermission(
    subjects: Draft<PermissionControllerSubjects<PermissionConstraint>>,
    origin: OriginString,
    target: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
  ): void {
    const { permissions } = subjects[origin];
    if (Object.keys(permissions).length > 1) {
      delete permissions[target];
    } else {
      delete subjects[origin];
    }
  }

  /**
   * Checks whether the permission of the subject corresponding to the given
   * origin has a caveat of the specified type.
   *
   * Throws an error if the subject does not have a permission with the
   * specified target name.
   *
   * @template TargetName - The permission target name. Should be inferred.
   * @template CaveatType - The valid caveat types for the permission. Should
   * be inferred.
   * @param origin - The origin of the subject.
   * @param target - The target name of the permission.
   * @param caveatType - The type of the caveat to check for.
   * @returns Whether the permission has the specified caveat.
   */
  hasCaveat<
    TargetName extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<ControllerPermissionSpecification>,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): boolean {
    return Boolean(this.getCaveat(origin, target, caveatType));
  }

  /**
   * Gets the caveat of the specified type, if any, for the permission of
   * the subject corresponding to the given origin.
   *
   * Throws an error if the subject does not have a permission with the
   * specified target name.
   *
   * @template TargetName - The permission target name. Should be inferred.
   * @template CaveatType - The valid caveat types for the permission. Should
   * be inferred.
   * @param origin - The origin of the subject.
   * @param target - The target name of the permission.
   * @param caveatType - The type of the caveat to get.
   * @returns The caveat, or `undefined` if no such caveat exists.
   */
  getCaveat<
    TargetName extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<ControllerPermissionSpecification>,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
  ): ExtractCaveat<ControllerCaveatSpecification, CaveatType> | undefined {
    const permission = this.getPermission(origin, target);
    if (!permission) {
      throw new PermissionDoesNotExistError(origin, target);
    }

    return findCaveat(permission, caveatType) as
      | ExtractCaveat<ControllerCaveatSpecification, CaveatType>
      | undefined;
  }

  /**
   * Adds a caveat of the specified type, with the specified caveat value, to
   * the permission corresponding to the given subject origin and permission
   * target.
   *
   * For modifying existing caveats, use
   * {@link PermissionController.updateCaveat}.
   *
   * Throws an error if no such permission exists, or if the caveat already
   * exists.
   *
   * @template TargetName - The permission target name. Should be inferred.
   * @template CaveatType - The valid caveat types for the permission. Should
   * be inferred.
   * @param origin - The origin of the subject.
   * @param target - The target name of the permission.
   * @param caveatType - The type of the caveat to add.
   * @param caveatValue - The value of the caveat to add.
   */
  addCaveat<
    TargetName extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<ControllerPermissionSpecification>,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<ControllerCaveatSpecification, CaveatType>,
  ): void {
    if (this.hasCaveat(origin, target, caveatType)) {
      throw new CaveatAlreadyExistsError(origin, target, caveatType);
    }

    this.setCaveat(origin, target, caveatType, caveatValue);
  }

  /**
   * Updates the value of the caveat of the specified type belonging to the
   * permission corresponding to the given subject origin and permission
   * target.
   *
   * For adding new caveats, use
   * {@link PermissionController.addCaveat}.
   *
   * Throws an error if no such permission or caveat exists.
   *
   * @template TargetName - The permission target name. Should be inferred.
   * @template CaveatType - The valid caveat types for the permission. Should
   * be inferred.
   * @param origin - The origin of the subject.
   * @param target - The target name of the permission.
   * @param caveatType - The type of the caveat to update.
   * @param caveatValue - The new value of the caveat.
   */
  updateCaveat<
    TargetName extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<ControllerPermissionSpecification>,
    CaveatValue extends ExtractCaveatValue<
      ControllerCaveatSpecification,
      CaveatType
    >,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: CaveatValue,
  ): void {
    if (!this.hasCaveat(origin, target, caveatType)) {
      throw new CaveatDoesNotExistError(origin, target, caveatType);
    }

    this.setCaveat(origin, target, caveatType, caveatValue);
  }

  /**
   * Sets the specified caveat on the specified permission. Overwrites existing
   * caveats of the same type in-place (preserving array order), and adds the
   * caveat to the end of the array otherwise.
   *
   * Throws an error if the permission does not exist or fails to validate after
   * its caveats have been modified.
   *
   * @see {@link PermissionController.addCaveat}
   * @see {@link PermissionController.updateCaveat}
   * @template TargetName - The permission target name. Should be inferred.
   * @template CaveatType - The valid caveat types for the permission. Should
   * be inferred.
   * @param origin - The origin of the subject.
   * @param target - The target name of the permission.
   * @param caveatType - The type of the caveat to set.
   * @param caveatValue - The value of the caveat to set.
   */
  private setCaveat<
    TargetName extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<ControllerPermissionSpecification>,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<ControllerCaveatSpecification, CaveatType>,
  ): void {
    this.update((draftState) => {
      const subject = draftState.subjects[origin];

      // Unreachable because `hasCaveat` is always called before this, and it
      // throws if permissions are missing. TypeScript needs this, however.
      /* istanbul ignore if */
      if (!subject) {
        throw new UnrecognizedSubjectError(origin);
      }

      const permission = subject.permissions[target];

      /* istanbul ignore if: practically impossible, but TypeScript wants it */
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      const caveat = {
        type: caveatType,
        value: caveatValue,
      };
      this.validateCaveat(caveat, origin, target);

      if (permission.caveats) {
        const caveatIndex = permission.caveats.findIndex(
          (existingCaveat) => existingCaveat.type === caveat.type,
        );

        if (caveatIndex === -1) {
          permission.caveats.push(caveat);
        } else {
          permission.caveats.splice(caveatIndex, 1, caveat);
        }
      } else {
        // Typecast: At this point, we don't know if the specific permission
        // is allowed to have caveats, but it should be impossible to call
        // this method for a permission that may not have any caveats.
        // If all else fails, the permission validator is also called.
        permission.caveats = [caveat] as any;
      }

      this.validateModifiedPermission(permission, origin, target);
    });
  }

  /**
   * Updates all caveats with the specified type for all subjects and
   * permissions by applying the specified mutator function to them.
   *
   * **ATTN:** Permissions can be revoked entirely by the action of this method,
   * read on for details.
   *
   * Caveat mutators are functions that receive a caveat value and return a
   * tuple consisting of a {@link CaveatMutatorOperation} and, optionally, a new
   * value to update the existing caveat with.
   *
   * For each caveat, depending on the mutator result, this method will:
   * - Do nothing ({@link CaveatMutatorOperation.noop})
   * - Update the value of the caveat ({@link CaveatMutatorOperation.updateValue})
   *   - The caveat specification validator, if any, will be called after
   *     updating the value.
   * - Delete the caveat ({@link CaveatMutatorOperation.deleteCaveat})
   *   - The permission specification validator, if any, will be called after
   *     deleting the caveat.
   * - Revoke the parent permission ({@link CaveatMutatorOperation.revokePermission})
   *
   * This method throws if the validation of any caveat or permission fails.
   *
   * @param targetCaveatType - The type of the caveats to update.
   * @param mutator - The mutator function which will be applied to all caveat
   * values.
   */
  updatePermissionsByCaveat<
    CaveatType extends ExtractCaveats<ControllerCaveatSpecification>['type'],
    TargetCaveat extends ExtractCaveat<
      ControllerCaveatSpecification,
      CaveatType
    >,
  >(targetCaveatType: CaveatType, mutator: CaveatMutator<TargetCaveat>): void {
    if (Object.keys(this.state.subjects).length === 0) {
      return;
    }

    this.update((draftState) => {
      Object.values(draftState.subjects).forEach((subject) => {
        Object.values(subject.permissions).forEach((permission) => {
          const { caveats } = permission;
          const targetCaveat = caveats?.find(
            ({ type }) => type === targetCaveatType,
          );
          if (!targetCaveat) {
            return;
          }

          // The mutator may modify the caveat value in place, and must always
          // return a valid mutation result.
          const mutatorResult = mutator(targetCaveat.value);
          switch (mutatorResult.operation) {
            case CaveatMutatorOperation.noop:
              break;

            case CaveatMutatorOperation.updateValue:
              // Typecast: `Mutable` is used here to assign to a readonly
              // property. `targetConstraint` should already be mutable because
              // it's part of a draft, but for some reason it's not. We can't
              // use the more-correct `Draft` type here either because it
              // results in an error.
              (targetCaveat as Mutable<CaveatConstraint, 'value'>).value =
                mutatorResult.value;

              this.validateCaveat(
                targetCaveat,
                subject.origin,
                permission.parentCapability,
              );
              break;

            case CaveatMutatorOperation.deleteCaveat:
              this.deleteCaveat(
                permission,
                targetCaveatType,
                subject.origin,
                permission.parentCapability,
              );
              break;

            case CaveatMutatorOperation.revokePermission:
              this.deletePermission(
                draftState.subjects,
                subject.origin,
                permission.parentCapability,
              );
              break;

            default: {
              // This type check ensures that the switch statement is
              // exhaustive.
              const _exhaustiveCheck: never = mutatorResult;
              throw new Error(
                `Unrecognized mutation result: "${
                  (_exhaustiveCheck as any).operation
                }"`,
              );
            }
          }
        });
      });
    });
  }

  /**
   * Removes the caveat of the specified type from the permission corresponding
   * to the given subject origin and target name.
   *
   * Throws an error if no such permission or caveat exists.
   *
   * @template TargetName - The permission target name. Should be inferred.
   * @template CaveatType - The valid caveat types for the permission. Should
   * be inferred.
   * @param origin - The origin of the subject.
   * @param target - The target name of the permission.
   * @param caveatType - The type of the caveat to remove.
   */
  removeCaveat<
    TargetName extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<ControllerPermissionSpecification>,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): void {
    this.update((draftState) => {
      const permission = draftState.subjects[origin]?.permissions[target];
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      if (!permission.caveats) {
        throw new CaveatDoesNotExistError(origin, target, caveatType);
      }

      this.deleteCaveat(permission, caveatType, origin, target);
    });
  }

  /**
   * Deletes the specified caveat from the specified permission. If no caveats
   * remain after deletion, the permission's caveat property is set to `null`.
   * The permission is validated after being modified.
   *
   * Throws an error if the permission does not have a caveat with the specified
   * type.
   *
   * @param permission - The permission whose caveat to delete.
   * @param caveatType - The type of the caveat to delete.
   * @param origin - The origin the permission subject.
   * @param target - The name of the permission target.
   */
  private deleteCaveat<
    TargetName extends ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractCaveats<ControllerCaveatSpecification>['type'],
  >(
    permission: Draft<PermissionConstraint>,
    caveatType: CaveatType,
    origin: OriginString,
    target: TargetName,
  ): void {
    /* istanbul ignore if: not possible in our usage */
    if (!permission.caveats) {
      throw new CaveatDoesNotExistError(origin, target, caveatType);
    }

    const caveatIndex = permission.caveats.findIndex(
      (existingCaveat) => existingCaveat.type === caveatType,
    );

    if (caveatIndex === -1) {
      throw new CaveatDoesNotExistError(origin, target, caveatType);
    }

    if (permission.caveats.length === 1) {
      permission.caveats = null;
    } else {
      permission.caveats.splice(caveatIndex, 1);
    }

    this.validateModifiedPermission(permission, origin, target);
  }

  /**
   * Validates the specified modified permission. Should **always** be invoked
   * on a permission after its caveats have been modified.
   *
   * Just like {@link PermissionController.validatePermission}, except that the
   * corresponding target key and specification are retrieved first, and an
   * error is thrown if the target key does not exist.
   *
   * @param permission - The modified permission to validate.
   * @param origin - The origin associated with the permission.
   * @param targetName - The target name name of the permission.
   */
  private validateModifiedPermission(
    permission: Draft<PermissionConstraint>,
    origin: OriginString,
    targetName: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
  ): void {
    const targetKey = this.getTargetKey(permission.parentCapability);
    /* istanbul ignore if: this should be impossible */
    if (!targetKey) {
      throw new Error(
        `Fatal: Existing permission target key "${targetKey}" has no specification.`,
      );
    }

    this.validatePermission(
      this.getPermissionSpecification(targetKey),
      permission as PermissionConstraint,
      origin,
      targetName,
    );
  }

  /**
   * Gets the key for the specified permission target.
   *
   * Used to support our namespaced permission target feature, which is used
   * to implement namespaced restricted JSON-RPC methods.
   *
   * @param target - The requested permission target.
   * @returns The internal key of the permission target.
   */
  private getTargetKey(
    target: string,
  ): ControllerPermissionSpecification['targetKey'] | undefined {
    if (hasProperty(this._permissionSpecifications, target)) {
      return target;
    }

    const namespacedTargetsWithoutWildcard: Record<string, boolean> = {};
    for (const targetKey of Object.keys(this._permissionSpecifications)) {
      const wildCardMatch = targetKey.match(/(.+)\*$/u);
      if (wildCardMatch) {
        namespacedTargetsWithoutWildcard[wildCardMatch[1]] = true;
      }
    }

    // Check for potentially nested namespaces:
    // Ex: wildzone_
    // Ex: eth_plugin_
    const segments = target.split('_');
    let targetKey = '';

    while (
      segments.length > 0 &&
      !hasProperty(this._permissionSpecifications, targetKey) &&
      !namespacedTargetsWithoutWildcard[targetKey]
    ) {
      targetKey += `${segments.shift()}_`;
    }

    if (namespacedTargetsWithoutWildcard[targetKey]) {
      return `${targetKey}*`;
    }

    return undefined;
  }

  /**
   * Grants _approved_ permissions to the specified subject. Every permission and
   * caveat is stringently validated – including by calling every specification
   * validator – and an error is thrown if any validation fails.
   *
   * **ATTN:** This method does **not** prompt the user for approval.
   *
   * @see {@link PermissionController.requestPermissions} For initiating a
   * permissions request requiring user approval.
   * @param options - Options bag.
   * @param options.approvedPermissions - The requested permissions approved by
   * the user.
   * @param options.requestData - Permission request data. Passed to permission
   * factory functions.
   * @param options.preserveExistingPermissions - Whether to preserve the
   * subject's existing permissions.
   * @param options.subject - The subject to grant permissions to.
   * @returns The granted permissions.
   */
  grantPermissions({
    approvedPermissions,
    requestData,
    preserveExistingPermissions = true,
    subject,
  }: {
    approvedPermissions: RequestedPermissions;
    subject: PermissionSubjectMetadata;
    preserveExistingPermissions?: boolean;
    requestData?: Record<string, unknown>;
  }): SubjectPermissions<
    ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >
  > {
    const { origin } = subject;

    if (!origin || typeof origin !== 'string') {
      throw new InvalidSubjectIdentifierError(origin);
    }

    const permissions = (
      preserveExistingPermissions
        ? {
            ...this.getPermissions(origin),
          }
        : {}
    ) as SubjectPermissions<
      ExtractPermission<
        ControllerPermissionSpecification,
        ControllerCaveatSpecification
      >
    >;

    for (const [requestedTarget, approvedPermission] of Object.entries(
      approvedPermissions,
    )) {
      const targetKey = this.getTargetKey(requestedTarget);
      if (!targetKey) {
        throw methodNotFound(requestedTarget);
      }

      if (
        approvedPermission.parentCapability !== undefined &&
        requestedTarget !== approvedPermission.parentCapability
      ) {
        throw new InvalidApprovedPermissionError(
          origin,
          requestedTarget,
          approvedPermission,
        );
      }

      // The requested target must be a valid target name if we found its key.
      // We reassign it to change its type.
      const targetName = requestedTarget as ExtractPermission<
        ControllerPermissionSpecification,
        ControllerCaveatSpecification
      >['parentCapability'];
      const specification = this.getPermissionSpecification(targetKey);

      // The requested caveats are validated here.
      const caveats = this.constructCaveats(
        origin,
        targetName,
        approvedPermission.caveats,
      );

      const permissionOptions = {
        caveats,
        invoker: origin,
        target: targetName,
      };

      let permission: ExtractPermission<
        ControllerPermissionSpecification,
        ControllerCaveatSpecification
      >;
      if (specification.factory) {
        permission = specification.factory(permissionOptions, requestData);

        // Full caveat and permission validation is performed here since the
        // factory function can arbitrarily modify the entire permission object,
        // including its caveats.
        this.validatePermission(specification, permission, origin, targetName);
      } else {
        permission = constructPermission(permissionOptions);

        // We do not need to validate caveats in this case, because the plain
        // permission constructor function does not modify the caveats, which
        // were already validated by `constructCaveats` above.
        this.validatePermission(specification, permission, origin, targetName, {
          invokePermissionValidator: true,
          performCaveatValidation: false,
        });
      }
      permissions[targetName] = permission;
    }

    this.setValidatedPermissions(origin, permissions);
    return permissions;
  }

  /**
   * Validates the specified permission by:
   * - Ensuring that its `caveats` property is either `null` or a non-empty
   *   array.
   * - Ensuring that it only includes caveats allowed by its specification.
   * - Ensuring that it includes no duplicate caveats (by caveat type).
   * - Validating each caveat object, if `performCaveatValidation` is `true`.
   * - Calling the validator of its specification, if one exists and
   *   `invokePermissionValidator` is `true`.
   *
   * An error is thrown if validation fails.
   *
   * @param specification - The specification of the permission.
   * @param permission - The permission to validate.
   * @param origin - The origin associated with the permission.
   * @param targetName - The target name of the permission.
   * @param validationOptions - Validation options.
   * @param validationOptions.invokePermissionValidator - Whether to invoke the
   * permission's consumer-specified validator function, if any.
   * @param validationOptions.performCaveatValidation - Whether to invoke
   * {@link PermissionController.validateCaveat} on each of the permission's
   * caveats.
   */
  private validatePermission(
    specification: PermissionSpecificationConstraint,
    permission: PermissionConstraint,
    origin: OriginString,
    targetName: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    { invokePermissionValidator, performCaveatValidation } = {
      invokePermissionValidator: true,
      performCaveatValidation: true,
    },
  ): void {
    const { allowedCaveats, validator } = specification;
    if (hasProperty(permission, 'caveats')) {
      const { caveats } = permission;

      if (caveats !== null && !(Array.isArray(caveats) && caveats.length > 0)) {
        throw new InvalidCaveatsPropertyError(origin, targetName, caveats);
      }

      const seenCaveatTypes = new Set<string>();
      caveats?.forEach((caveat) => {
        if (performCaveatValidation) {
          this.validateCaveat(caveat, origin, targetName);
        }

        if (!allowedCaveats?.includes(caveat.type)) {
          throw new ForbiddenCaveatError(caveat.type, origin, targetName);
        }

        if (seenCaveatTypes.has(caveat.type)) {
          throw new DuplicateCaveatError(caveat.type, origin, targetName);
        }
        seenCaveatTypes.add(caveat.type);
      });
    }

    if (invokePermissionValidator && validator) {
      validator(permission, origin, targetName);
    }
  }

  /**
   * Assigns the specified permissions to the subject with the given origin.
   * Overwrites all existing permissions, and creates a subject entry if it
   * doesn't already exist.
   *
   * **ATTN:** Assumes that the new permissions have been validated.
   *
   * @param origin - The origin of the grantee subject.
   * @param permissions - The new permissions for the grantee subject.
   */
  private setValidatedPermissions(
    origin: OriginString,
    permissions: Record<
      string,
      ExtractPermission<
        ControllerPermissionSpecification,
        ControllerCaveatSpecification
      >
    >,
  ): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        draftState.subjects[origin] = { origin, permissions: {} };
      }

      draftState.subjects[origin].permissions = castDraft(permissions);
    });
  }

  /**
   * Validates the requested caveats for the permission of the specified
   * subject origin and target name and returns the validated caveat array.
   *
   * Throws an error if validation fails.
   *
   * @param origin - The origin of the permission subject.
   * @param target - The permission target name.
   * @param requestedCaveats - The requested caveats to construct.
   * @returns The constructed caveats.
   */
  private constructCaveats(
    origin: OriginString,
    target: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    requestedCaveats?: unknown[] | null,
  ): NonEmptyArray<ExtractCaveats<ControllerCaveatSpecification>> | undefined {
    const caveatArray = requestedCaveats?.map((requestedCaveat) => {
      this.validateCaveat(requestedCaveat, origin, target);

      // Reassign so that we have a fresh object.
      const { type, value } = requestedCaveat as CaveatConstraint;
      return { type, value } as ExtractCaveats<ControllerCaveatSpecification>;
    });

    return caveatArray && isNonEmptyArray(caveatArray)
      ? caveatArray
      : undefined;
  }

  /**
   * This methods validates that the specified caveat is an object with the
   * expected properties and types. It also ensures that a caveat specification
   * exists for the requested caveat type, and calls the specification
   * validator, if it exists, on the caveat object.
   *
   * Throws an error if validation fails.
   *
   * @param caveat - The caveat object to validate.
   * @param origin - The origin associated with the subject of the parent
   * permission.
   * @param target - The target name associated with the parent permission.
   */
  private validateCaveat(
    caveat: unknown,
    origin: OriginString,
    target: string,
  ): void {
    if (!isPlainObject(caveat)) {
      throw new InvalidCaveatError(caveat, origin, target);
    }

    if (Object.keys(caveat).length !== 2) {
      throw new InvalidCaveatFieldsError(caveat, origin, target);
    }

    if (typeof caveat.type !== 'string') {
      throw new InvalidCaveatTypeError(caveat, origin, target);
    }

    const specification = this.getCaveatSpecification(caveat.type);
    if (!specification) {
      throw new UnrecognizedCaveatTypeError(caveat.type, origin, target);
    }

    if (!hasProperty(caveat, 'value') || caveat.value === undefined) {
      throw new CaveatMissingValueError(caveat, origin, target);
    }

    if (!isValidJson(caveat.value)) {
      throw new CaveatInvalidJsonError(caveat, origin, target);
    }

    // Typecast: TypeScript still believes that the caveat is a PlainObject.
    specification.validator?.(caveat as CaveatConstraint, origin, target);
  }

  /**
   * Initiates a permission request that requires user approval. This should
   * always be used to grant additional permissions to a subject, unless user
   * approval has been obtained through some other means.
   *
   * Permissions are validated at every step of the approval process, and this
   * method will reject if validation fails.
   *
   * @see {@link ApprovalController} For the user approval logic.
   * @see {@link PermissionController.acceptPermissionsRequest} For the method
   * that _accepts_ the request and resolves the user approval promise.
   * @see {@link PermissionController.rejectPermissionsRequest} For the method
   * that _rejects_ the request and the user approval promise.
   * @param subject - The grantee subject.
   * @param requestedPermissions - The requested permissions.
   * @param options - Additional options.
   * @param options.id - The id of the permissions request. Defaults to a unique
   * id.
   * @param options.preserveExistingPermissions - Whether to preserve the
   * subject's existing permissions. Defaults to `true`.
   * @returns The granted permissions and request metadata.
   */
  async requestPermissions(
    subject: PermissionSubjectMetadata,
    requestedPermissions: RequestedPermissions,
    options: {
      id?: string;
      preserveExistingPermissions?: boolean;
    } = {},
  ): Promise<
    [
      SubjectPermissions<
        ExtractPermission<
          ControllerPermissionSpecification,
          ControllerCaveatSpecification
        >
      >,
      { id: string; origin: OriginString },
    ]
  > {
    const { origin } = subject;
    const { id = nanoid(), preserveExistingPermissions = true } = options;
    this.validateRequestedPermissions(origin, requestedPermissions);

    const metadata = {
      id,
      origin,
    };

    const permissionsRequest = {
      metadata,
      permissions: requestedPermissions,
    };

    const { permissions: approvedPermissions, ...requestData } =
      await this.requestUserApproval(permissionsRequest);

    return [
      this.grantPermissions({
        subject,
        approvedPermissions,
        preserveExistingPermissions,
        requestData,
      }),
      metadata,
    ];
  }

  /**
   * Validates requested permissions. Throws if validation fails.
   *
   * This method ensures that the requested permissions are a properly
   * formatted {@link RequestedPermissions} object, and performs the same
   * validation as {@link PermissionController.grantPermissions}, except that
   * consumer-specified permission validator functions are not called, since
   * they are only called on fully constructed, approved permissions that are
   * otherwise completely valid.
   *
   * Unrecognzied properties on requested permissions are ignored.
   *
   * @param origin - The origin of the grantee subject.
   * @param requestedPermissions - The requested permissions.
   */
  private validateRequestedPermissions(
    origin: OriginString,
    requestedPermissions: unknown,
  ): void {
    if (!isPlainObject(requestedPermissions)) {
      throw invalidParams({
        message: `Requested permissions for origin "${origin}" is not a plain object.`,
        data: { origin, requestedPermissions },
      });
    }

    if (Object.keys(requestedPermissions).length === 0) {
      throw invalidParams({
        message: `Permissions request for origin "${origin}" contains no permissions.`,
        data: { requestedPermissions },
      });
    }

    for (const targetName of Object.keys(requestedPermissions)) {
      const permission = requestedPermissions[targetName];
      const targetKey = this.getTargetKey(targetName);

      if (!targetKey) {
        throw methodNotFound(targetName, { origin, requestedPermissions });
      }

      if (
        !isPlainObject(permission) ||
        (permission.parentCapability !== undefined &&
          targetName !== permission.parentCapability)
      ) {
        throw invalidParams({
          message: `Permissions request for origin "${origin}" contains invalid requested permission(s).`,
          data: { origin, requestedPermissions },
        });
      }

      // Here we validate the permission without invoking its validator, if any.
      // The validator will be invoked after the permission has been approved.
      this.validatePermission(
        this.getPermissionSpecification(targetKey),
        // Typecast: The permission is still a "PlainObject" here.
        permission as PermissionConstraint,
        origin,
        targetName,
        { invokePermissionValidator: false, performCaveatValidation: true },
      );
    }
  }

  /**
   * Adds a request to the {@link ApprovalController} using the
   * {@link AddApprovalRequest} action. Also validates the resulting approved
   * permissions request, and throws an error if validation fails.
   *
   * @param permissionsRequest - The permissions request object.
   * @returns The approved permissions request object.
   */
  private async requestUserApproval(permissionsRequest: PermissionsRequest) {
    const { origin, id } = permissionsRequest.metadata;
    const approvedRequest = await this.messagingSystem.call(
      'ApprovalController:addRequest',
      {
        id,
        origin,
        requestData: permissionsRequest,
        type: MethodNames.requestPermissions,
      },
      true,
    );

    this.validateApprovedPermissions(approvedRequest, { id, origin });
    return approvedRequest as PermissionsRequest;
  }

  /**
   * Validates an approved {@link PermissionsRequest} object. The approved
   * request must have the required `metadata` and `permissions` properties,
   * the `id` and `origin` of the `metadata` must match the original request
   * metadata, and the requested permissions must be valid per
   * {@link PermissionController.validateRequestedPermissions}. Any extra
   * metadata properties are ignored.
   *
   * An error is thrown if validation fails.
   *
   * @param approvedRequest - The approved permissions request object.
   * @param originalMetadata - The original request metadata.
   */
  private validateApprovedPermissions(
    approvedRequest: unknown,
    originalMetadata: PermissionsRequestMetadata,
  ) {
    const { id, origin } = originalMetadata;

    if (
      !isPlainObject(approvedRequest) ||
      !isPlainObject(approvedRequest.metadata)
    ) {
      throw internalError(
        `Approved permissions request for subject "${origin}" is invalid.`,
        { data: { approvedRequest } },
      );
    }

    const {
      metadata: { id: newId, origin: newOrigin },
      permissions,
    } = approvedRequest;

    if (newId !== id) {
      throw internalError(
        `Approved permissions request for subject "${origin}" mutated its id.`,
        { originalId: id, mutatedId: newId },
      );
    }

    if (newOrigin !== origin) {
      throw internalError(
        `Approved permissions request for subject "${origin}" mutated its origin.`,
        { originalOrigin: origin, mutatedOrigin: newOrigin },
      );
    }

    try {
      this.validateRequestedPermissions(origin, permissions);
    } catch (error) {
      // Re-throw as an internal error; we should never receive invalid approved
      // permissions.
      throw internalError(
        `Invalid approved permissions request: ${error.message}`,
        error.data,
      );
    }
  }

  /**
   * Accepts a permissions request created by
   * {@link PermissionController.requestPermissions}.
   *
   * @param request - The permissions request.
   */
  async acceptPermissionsRequest(request: PermissionsRequest): Promise<void> {
    const { id } = request.metadata;

    if (!this.hasApprovalRequest({ id })) {
      throw new PermissionsRequestNotFoundError(id);
    }

    if (Object.keys(request.permissions).length === 0) {
      this._rejectPermissionsRequest(
        id,
        invalidParams({
          message: 'Must request at least one permission.',
        }),
      );
      return;
    }

    try {
      this.messagingSystem.call(
        'ApprovalController:acceptRequest',
        id,
        request,
      );
    } catch (error) {
      // If accepting unexpectedly fails, reject the request and re-throw the
      // error
      this._rejectPermissionsRequest(id, error);
      throw error;
    }
  }

  /**
   * Rejects a permissions request created by
   * {@link PermissionController.requestPermissions}.
   *
   * @param id - The id of the request to be rejected.
   */
  async rejectPermissionsRequest(id: string): Promise<void> {
    if (!this.hasApprovalRequest({ id })) {
      throw new PermissionsRequestNotFoundError(id);
    }

    this._rejectPermissionsRequest(id, userRejectedRequest());
  }

  /**
   * Checks whether the {@link ApprovalController} has a particular permissions
   * request.
   *
   * @see {@link PermissionController.acceptPermissionsRequest} and
   * {@link PermissionController.rejectPermissionsRequest} for usage.
   * @param options - The {@link HasApprovalRequest} options.
   * @param options.id - The id of the approval request to check for.
   * @returns Whether the specified request exists.
   */
  private hasApprovalRequest(options: { id: string }): boolean {
    return this.messagingSystem.call(
      'ApprovalController:hasRequest',
      // Typecast: For some reason, the type here expects all of the possible
      // HasApprovalRequest options to be specified, when they're actually all
      // optional. Passing just the id is definitely valid, so we just cast it.
      options as any,
    );
  }

  /**
   * Rejects the permissions request with the specified id, with the specified
   * error as the reason. This method is effectively a wrapper around a
   * messenger call for the `ApprovalController:rejectRequest` action.
   *
   * @see {@link PermissionController.acceptPermissionsRequest} and
   * {@link PermissionController.rejectPermissionsRequest} for usage.
   * @param id - The id of the request to reject.
   * @param error - The error associated with the rejection.
   */
  private _rejectPermissionsRequest(id: string, error: Error): void {
    return this.messagingSystem.call(
      'ApprovalController:rejectRequest',
      id,
      error,
    );
  }

  /**
   * Gets the subject's endowments per the specified endowment permission.
   * Throws if the subject does not have the required permission or if the
   * permission is not an endowment permission.
   *
   * @param origin - The origin of the subject whose endowments to retrieve.
   * @param targetName - The name of the endowment permission. This must be a
   * valid permission target name.
   * @param requestData - Additional data associated with the request, if any.
   * Forwarded to the endowment getter function for the permission.
   * @returns The endowments, if any.
   */
  async getEndowments(
    origin: string,
    targetName: ExtractEndowmentPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    requestData?: unknown,
  ): Promise<Json> {
    if (!this.hasPermission(origin, targetName)) {
      throw unauthorized({ data: { origin, targetName } });
    }

    return this.getTypedPermissionSpecification(
      PermissionType.Endowment,
      targetName,
      origin,
    ).endowmentGetter({ origin, requestData });
  }

  /**
   * Executes a restricted method as the subject with the given origin.
   * The specified params, if any, will be passed to the method implementation.
   *
   * **ATTN:** Great caution should be exercised in the use of this method.
   * Methods that cause side effects or affect application state should
   * be avoided.
   *
   * This method will first attempt to retrieve the requested restricted method
   * implementation, throwing if it does not exist. The method will then be
   * invoked as though the subject with the specified origin had invoked it with
   * the specified parameters. This means that any existing caveats will be
   * applied to the restricted method, and this method will throw if the
   * restricted method or its caveat decorators throw.
   *
   * In addition, this method will throw if the subject does not have a
   * permission for the specified restricted method.
   *
   * @param origin - The origin of the subject to execute the method on behalf
   * of.
   * @param targetName - The name of the method to execute. This must be a valid
   * permission target name.
   * @param params - The parameters to pass to the method implementation.
   * @returns The result of the executed method.
   */
  async executeRestrictedMethod(
    origin: OriginString,
    targetName: ExtractRestrictedMethodPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    params?: RestrictedMethodParameters,
  ): Promise<Json> {
    // Throws if the method does not exist
    const methodImplementation = this.getRestrictedMethod(targetName, origin);

    const result = await this._executeRestrictedMethod(
      methodImplementation,
      { origin },
      targetName,
      params,
    );

    if (result === undefined) {
      throw new Error(
        `Internal request for method "${targetName}" as origin "${origin}" returned no result.`,
      );
    }

    return result;
  }

  /**
   * An internal method used in the controller's `json-rpc-engine` middleware
   * and {@link PermissionController.executeRestrictedMethod}. Calls the
   * specified restricted method implementation after decorating it with the
   * caveats of its permission. Throws if the subject does not have the
   * requisite permission.
   *
   * **ATTN:** Parameter validation is the responsibility of the caller, or
   * the restricted method implementation in the case of `params`.
   *
   * @see {@link PermissionController.executeRestrictedMethod} and
   * {@link PermissionController.createPermissionMiddleware} for usage.
   * @param methodImplementation - The implementation of the method to call.
   * @param subject - Metadata about the subject that made the request.
   * @param req - The request object associated with the request.
   * @returns
   */
  private _executeRestrictedMethod(
    methodImplementation: RestrictedMethod<RestrictedMethodParameters, Json>,
    subject: PermissionSubjectMetadata,
    method: ExtractPermission<
      ControllerPermissionSpecification,
      ControllerCaveatSpecification
    >['parentCapability'],
    params: RestrictedMethodParameters = [],
  ): ReturnType<RestrictedMethod<RestrictedMethodParameters, Json>> {
    const { origin } = subject;

    const permission = this.getPermission(origin, method);
    if (!permission) {
      throw unauthorized({ data: { origin, method } });
    }

    return decorateWithCaveats(
      methodImplementation,
      permission,
      this._caveatSpecifications,
    )({ method, params, context: { origin } });
  }
}
