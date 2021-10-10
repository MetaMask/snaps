import {
  Json,
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
  AddApprovalRequest,
  AcceptRequest as AcceptApprovalRequest,
  RejectRequest as RejectApprovalRequest,
  HasApprovalRequest,
  StateMetadata,
} from '@metamask/controllers';
// These are used in docstrings, but ESLint is ignorant of docstrings.
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ApprovalController,
  ControllerMessenger,
} from '@metamask/controllers';
/* eslint-enable @typescript-eslint/no-unused-vars */
import type { Patch } from 'immer';
import deepFreeze from 'deep-freeze-strict';
import { nanoid } from 'nanoid';
import { isPlainObject, hasProperty, NonEmptyArray } from '../utils';
import {
  constructCaveat as _constructCaveat,
  decorateWithCaveats,
  ExtractCaveat,
  CaveatSpecificationBase,
  ExtractCaveats,
  CaveatSpecificationsMap,
  ExtractCaveatValue,
} from './Caveat';
import {
  constructPermission,
  findCaveat,
  GenericPermission,
  OriginString,
  PermissionOptions,
  RequestedPermissions,
  RestrictedMethodBase,
  RestrictedMethodParameters,
  PermissionSpecificationConstraint,
  PermissionSpecificationsMap,
  PermissionSpecificationBase,
  PermissionConstraint,
  ExtractAllowedCaveatTypes,
} from './Permission';
import {
  PermissionDoesNotExistError,
  methodNotFound,
  UnrecognizedSubjectError,
  CaveatDoesNotExistError,
  UnrecognizedCaveatTypeError,
  CaveatMissingValueError,
  InvalidCaveatFieldsError,
  InvalidSubjectIdentifierError,
  InvalidCaveatTypeError,
  CaveatAlreadyExistsError,
  InvalidCaveatError,
  InvalidApprovedPermissionError,
  unauthorized,
  invalidParams,
  internalError,
  userRejectedRequest,
  PermissionsRequestNotFoundError,
  ForbiddenCaveatError,
} from './errors';
import { MethodNames } from './utils';
import { getPermissionMiddlewareFactory } from './permission-middleware';

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
export type SubjectPermissions<Permission extends GenericPermission> = Record<
  Permission['parentCapability'],
  Permission
>;

/**
 * Permissions and metadata associated with a {@link PermissionController}
 * subject.
 */
export type PermissionSubjectEntry<Permission extends GenericPermission> = {
  permissions: SubjectPermissions<Permission>;
} & PermissionSubjectMetadata;

/**
 * All subjects of a {@link PermissionController}.
 */
export type PermissionControllerSubjects<Permission extends GenericPermission> =
  Record<OriginString, PermissionSubjectEntry<Permission>>;

// TODO:TS4.4 Enable compiler flags to forbid unchecked member access
/**
 * The state of a {@link PermissionController}.
 */
export type PermissionControllerState<Permission> =
  Permission extends GenericPermission
    ? {
        subjects: PermissionControllerSubjects<Permission>;
      }
    : never;

/**
 * The state metadata of the {@link PermissionController}.
 */
const stateMetadata: StateMetadata<PermissionControllerState<any>> = {
  subjects: { persist: true, anonymous: true },
};

// Typecast: We can't reference the class generics, so we must resort to "any"
/**
 * The default state of the {@link PermissionController}.
 */
const defaultState: PermissionControllerState<any> = {
  subjects: {},
};

/**
 * Gets the state of the {@link PermissionController}.
 */
export type GetPermissionControllerState = {
  type: `${typeof controllerName}:getState`;
  handler: () => PermissionControllerState<GenericPermission>;
};

/**
 * Gets the names of all subjects from the {@link PermissionController}.
 */
export type GetSubjects = {
  type: `${typeof controllerName}:getSubjectNames`;
  handler: () => (keyof PermissionControllerSubjects<GenericPermission>)[];
};

/**
 * Checks whether the specified subject has any permissions.
 */
export type HasPermissions = {
  type: `${typeof controllerName}:hasPermissions`;
  handler: GenericPermissionController['hasPermissions'];
};

/**
 * Clears all permissions from the {@link PermissionController}.
 */
export type ClearPermissions = {
  type: `${typeof controllerName}:clearPermissions`;
  handler: () => void;
};

// TODO:feat Implement all desired actions
/**
 * The {@link ControllerMessenger} actions of the {@link PermissionController}.
 */
export type PermissionControllerActions =
  | ClearPermissions
  | GetPermissionControllerState
  | GetSubjects
  | HasPermissions;

/**
 * The generic state change event of the {@link PermissionController}.
 */
export type PermissionControllerStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [PermissionControllerState<GenericPermission>, Patch[]];
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
 * Options for {@link PermissionController.grantPermissions}.
 */
type GrantPermissionsOptions = {
  approvedPermissions: RequestedPermissions;
  subject: PermissionSubjectMetadata;
  preserveExistingPermissions?: boolean;
  requestData?: Record<string, unknown>;
};

export type GenericPermissionController = PermissionController<
  PermissionSpecificationBase<string>,
  CaveatSpecificationBase<string>
>;

/**
 * Extracts the permission type or types from the specified permission and
 * caveat specifications.
 *
 * @template PermissionSpecification - The permission specification(s) to
 * extract a permission type union from.
 * @template CaveatSpecification - The caveat specification(s) to extract a
 * permission type union from. Necessary because {@link PermissionConstraint}
 * has a generic that describes the allowed caveats for the permission.
 */
export type ExtractPermission<
  PermissionSpecification extends PermissionSpecificationBase<string>,
  CaveatSpecification extends CaveatSpecificationBase<string>,
> = PermissionSpecification extends PermissionSpecificationConstraint<PermissionSpecification>
  ? PermissionConstraint<
      PermissionSpecification['targetKey'],
      ExtractCaveats<CaveatSpecification>
    >
  : never;

/**
 * Options for the {@link PermissionController} constructor.
 *
 * @template TargetKey - A union of string literal types corresponding to the
 * keys of all permission target. Must match the given permission
 * specifications object.
 * @template Caveat - A union of the types of all caveats available to the new
 * controller. Must match the given caveat specifications object.
 * @template Permission - A union of the types of all permissions available to
 * the new controller. Must match the given permission and caveat specification
 * objects.
 */
export type PermissionControllerOptions<
  PermissionSpecification extends PermissionSpecificationBase<string>,
  CaveatSpecification extends CaveatSpecificationBase<string>,
> = PermissionSpecificationConstraint<PermissionSpecification> extends never
  ? never
  : {
      messenger: PermissionControllerMessenger;
      caveatSpecifications: CaveatSpecificationsMap<CaveatSpecification>;
      permissionSpecifications: PermissionSpecificationsMap<PermissionSpecification>;
      unrestrictedMethods: string[];
      state?: Partial<
        PermissionControllerState<
          ExtractPermission<PermissionSpecification, CaveatSpecification>
        >
      >;
    };

/**
 * The permission controller. See the documentation for details.
 *
 * Assumes the existence of an {@link ApprovalController} reachable via the
 * {@link ControllerMessenger}.
 *
 * @template TargetKey - A union of string literal types corresponding to the
 * keys of all permission target. Must match the permission specifications of
 * the controller.
 * @template Caveat - A union of the types of all caveats available to the new
 * controller. Must match the caveat specifications of the controller.
 * @template Permission - A union of the types of all permissions available to
 * the new controller. Must match the the permission and caveat specifications
 * of the controller.
 */
export class PermissionController<
  PermissionSpecification extends PermissionSpecificationBase<string>,
  CaveatSpecification extends CaveatSpecificationBase<string>,
> extends BaseController<
  typeof controllerName,
  PermissionControllerState<
    ExtractPermission<PermissionSpecification, CaveatSpecification>
  >,
  PermissionControllerMessenger
> {
  private readonly _caveatSpecifications: Readonly<
    CaveatSpecificationsMap<CaveatSpecification>
  >;

  /**
   * The {@link CaveatSpecifications} of the controller.
   */
  public get caveatSpecifications(): Readonly<
    CaveatSpecificationsMap<CaveatSpecification>
  > {
    return this._caveatSpecifications;
  }

  private readonly _permissionSpecifications: Readonly<
    PermissionSpecificationsMap<PermissionSpecification>
  >;

  /**
   * The {@link PermissionSpecificationsMap} of the controller.
   */
  public get permissionSpecifications(): Readonly<
    PermissionSpecificationsMap<PermissionSpecification>
  > {
    return this._permissionSpecifications;
  }

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
   * stack in order for it to work. See the documentation for more details.
   */
  public createPermissionMiddleware: ReturnType<
    typeof getPermissionMiddlewareFactory
  >;

  /**
   * @param options - Permission controller options.
   * @param options.caveatSpecifications - The specifications of all caveats
   * available to the controller. See {@link CaveatSpecificationsMap} and the
   * documentation for more details.
   * @param options.permissionSpecifications - The specifications of all
   * permissions available to the controller. See
   * {@link PermissionSpecificationsMap} and the documentation for more details.
   * @param options.unrestrictedMethods - The callable names of all JSON-RPC
   * methods ignored by the new controller.
   * @param options.messenger - The controller messenger. See
   * {@link BaseController} for more information.
   * @param options.state - Existing state to hydrate the controller with at
   * initialization.
   */
  constructor(
    options: PermissionControllerOptions<
      PermissionSpecification,
      CaveatSpecification
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
      // Typecast: The state metadata object is declared outside of the
      // controller instance and therefore incorrectly genericized.
      metadata: stateMetadata as any,
      messenger,
      state: {
        ...(defaultState as PermissionControllerState<
          ExtractPermission<PermissionSpecification, CaveatSpecification>
        >),
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
      getRestrictedMethod: this._getRestrictedMethod.bind(this),
      isUnrestrictedMethod: this.unrestrictedMethods.has.bind(
        this.unrestrictedMethods,
      ),
    });
  }

  /**
   * Constructor helper for validating permission specifications. This is
   * intended to prevent the use of invalid target keys which, while impossible
   * to add in TypeScript, could rather easily occur in plain JavaScript.
   *
   * Throws an error if validation fails.
   *
   * @param specifications - The permission specifications passed to this
   * controller's constructor.
   */
  private validatePermissionSpecifications(
    permissionSpecifications: PermissionSpecificationsMap<PermissionSpecification>,
    caveatSpecifications: CaveatSpecificationsMap<CaveatSpecification>,
  ) {
    Object.entries<PermissionSpecification>(permissionSpecifications).forEach(
      ([targetKey, { targetKey: innerTargetKey, allowedCaveats }]) => {
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
      `${controllerName}:getSubjectNames`,
      () => this.getSubjectNames(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:hasPermissions`,
      (origin: OriginString) => this.hasPermissions(origin),
    );
  }

  /**
   * Clears the state of the controller.
   */
  clearState(): void {
    this.update((_draftState) => {
      // Typecast: The default state is declared outside of the controller
      // instance and therefore incorrectly genericized.
      return { ...defaultState } as PermissionControllerState<
        ExtractPermission<PermissionSpecification, CaveatSpecification>
      >;
    });
  }

  /**
   * Gets the implementation of the specified restricted method.
   *
   * @param method - The name of the restricted method.
   * @returns The restricted method implementation.
   */
  getRestrictedMethod(
    method: string,
  ): RestrictedMethodBase<RestrictedMethodParameters, Json> | undefined {
    const targetKey = this.getTargetKey(
      method as ExtractPermission<
        PermissionSpecification,
        CaveatSpecification
      >['parentCapability'],
    );
    if (!targetKey) {
      return undefined;
    }

    return this.permissionSpecifications[targetKey].methodImplementation;
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
   * @param target - The method name as invoked by a third party (i.e., not a method key).
   * @returns The permission if it exists, or undefined otherwise.
   */
  getPermission<
    SubjectPermission extends ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >,
  >(
    origin: OriginString,
    target: SubjectPermission['parentCapability'],
  ): SubjectPermission | undefined {
    return this.state.subjects[origin]?.permissions[
      target
    ] as SubjectPermission;
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
      PermissionSpecification,
      CaveatSpecification
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
      PermissionSpecification,
      CaveatSpecification
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
          PermissionSpecification,
          CaveatSpecification
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

          // Typecast: ts(2589)
          this.deletePermission(
            draftState as any,
            permissions as any,
            origin,
            target,
          );
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
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
  ): void {
    if (this.getSubjectNames().length === 0) {
      return;
    }

    this.update((draftState) => {
      Object.entries(draftState.subjects).forEach(([origin, subject]) => {
        const { permissions } = subject;

        if (hasProperty(permissions as Record<string, unknown>, target)) {
          this.deletePermission(
            // Typecast: ts(2589)
            draftState as any,
            permissions as any,
            origin,
            target,
          );
        }
      });
    });
  }

  private deletePermission(
    draftState: PermissionControllerState<
      ExtractPermission<PermissionSpecification, CaveatSpecification>
    >,
    permissions: SubjectPermissions<
      ExtractPermission<PermissionSpecification, CaveatSpecification>
    >,
    origin: OriginString,
    target: ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
  ): void {
    if (Object.keys(permissions).length > 1) {
      delete permissions[target];
    } else {
      delete draftState.subjects[origin];
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
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<
      PermissionSpecification,
      TargetName
    >,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): boolean {
    return Boolean(this.getCaveat(origin, target, caveatType));
  }

  /**
   * Gets the caveat of the specified type, if any, for the the permission of
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
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<
      PermissionSpecification,
      TargetName
    >,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
  ): ExtractCaveat<CaveatSpecification, CaveatType> | undefined {
    const permission = this.getPermission(origin, target);
    if (!permission) {
      throw new PermissionDoesNotExistError(origin, target);
    }

    return findCaveat(permission, caveatType) as
      | ExtractCaveat<CaveatSpecification, CaveatType>
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
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<
      PermissionSpecification,
      TargetName
    >,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<CaveatSpecification, CaveatType>,
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
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<
      PermissionSpecification,
      TargetName
    >,
    CaveatValue extends ExtractCaveatValue<CaveatSpecification, CaveatType>,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: CaveatValue,
    // caveatValue: ExtractCaveatValue<
    //   CaveatSpecification,
    //   CaveatType
    // >,
  ): void {
    if (!this.hasCaveat(origin, target, caveatType)) {
      throw new CaveatDoesNotExistError(origin, target, caveatType);
    }

    this.setCaveat(origin, target, caveatType, caveatValue);
  }

  /**
   * Internal method for setting the caveat of a permission.
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
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<
      PermissionSpecification,
      TargetName
    >,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<CaveatSpecification, CaveatType>,
  ): void {
    this.update((draftState) => {
      const subject = draftState.subjects[origin];

      // This should be impossible in our usage, but TypeScript wants it
      /* istanbul ignore if */
      if (!subject) {
        throw new UnrecognizedSubjectError(origin);
      }

      // Typecast: immer's WritableDraft is incompatible with our generics
      const permission = subject.permissions[target];

      // This should also be impossible in our usage, but TypeScript wants it
      /* istanbul ignore if */
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      const caveat = this.constructCaveat(origin, target, {
        type: caveatType,
        value: caveatValue,
      });

      // Typecasts: ts(2589)
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

      this.validateModifiedPermission(
        // Typecast: Immer WritableDraft incompatibility
        permission as unknown as ExtractPermission<
          PermissionSpecification,
          CaveatSpecification
        >,
        origin,
        target,
      );
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
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    CaveatType extends ExtractAllowedCaveatTypes<
      PermissionSpecification,
      TargetName
    >,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): void {
    this.update((draftState) => {
      const permission = draftState.subjects[origin]?.permissions[target];
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      if (!permission.caveats) {
        throw new CaveatDoesNotExistError(origin, target, caveatType);
      }

      const caveatIndex = permission.caveats.findIndex(
        (existingCaveat) => existingCaveat.type === caveatType,
      );
      if (!permission.caveats || caveatIndex === -1) {
        throw new CaveatDoesNotExistError(origin, target, caveatType);
      }

      if (permission.caveats.length === 1) {
        // Typecast: Immer WritableDraft incompatibility
        permission.caveats = null as any;
      } else {
        permission.caveats.splice(caveatIndex, 1);
      }

      this.validateModifiedPermission(
        // Typecast: Immer WritableDraft incompatibility
        permission as unknown as ExtractPermission<
          PermissionSpecification,
          CaveatSpecification
        >,
        origin,
        target,
      );
    });
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
  private validateModifiedPermission<
    Permission extends ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >,
  >(
    permission: Permission,
    origin: OriginString,
    targetName: Permission['parentCapability'],
  ): void {
    const targetKey = this.getTargetKey(permission.parentCapability);
    /* istanbul ignore next: this should be impossible */
    if (!targetKey) {
      throw new Error(
        `Fatal: Existing permission target key "${targetKey}" has no specification.`,
      );
    }

    this.validatePermission(
      this.permissionSpecifications[targetKey],
      permission,
      origin,
      targetName,
    );
  }

  /**
   * Used for retrieving the key that manages the restricted method
   * associated with the current RPC `method` key.
   *
   * Used to support our namespaced method feature, which allows blocks
   * of methods to be hidden behind a restricted method with a trailing `_` character.
   *
   * @param method - The requested RPC method.
   * @returns The internal key of the method.
   */
  private getTargetKey(
    method: ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
  ): PermissionSpecification['targetKey'] | undefined {
    if (hasProperty(this._permissionSpecifications, method)) {
      return method as PermissionSpecification['targetKey'];
    }

    const wildCardMethodsWithoutWildCard: Record<string, boolean> = {};
    for (const targetKey of Object.keys(this._permissionSpecifications)) {
      const wildCardMatch = targetKey.match(/(.+)\*$/u);
      if (wildCardMatch) {
        wildCardMethodsWithoutWildCard[wildCardMatch[1]] = true;
      }
    }

    // Check for potentially nested namespaces:
    // Ex: wildzone_
    // Ex: eth_plugin_
    const segments = method.split('_');
    let targetKey = '';

    while (
      segments.length > 0 &&
      !hasProperty(this._permissionSpecifications, targetKey) &&
      !wildCardMethodsWithoutWildCard[targetKey]
    ) {
      targetKey += `${segments.shift()}_`;
    }

    if (wildCardMethodsWithoutWildCard[targetKey]) {
      return `${targetKey}*` as PermissionSpecification['targetKey'];
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
  }: GrantPermissionsOptions): SubjectPermissions<
    ExtractPermission<PermissionSpecification, CaveatSpecification>
  > {
    const { origin } = subject;

    if (!origin || typeof origin !== 'string') {
      throw new InvalidSubjectIdentifierError(origin);
    }

    const permissions: SubjectPermissions<
      ExtractPermission<PermissionSpecification, CaveatSpecification>
    > = ((preserveExistingPermissions && {
      ...this.getPermissions(origin),
    }) ||
      {}) as SubjectPermissions<
      ExtractPermission<PermissionSpecification, CaveatSpecification>
    >;

    for (const [requestedTarget, approvedPermission] of Object.entries(
      approvedPermissions,
    )) {
      const targetKey = this.getTargetKey(
        requestedTarget as ExtractPermission<
          PermissionSpecification,
          CaveatSpecification
        >['parentCapability'],
      );
      if (!targetKey) {
        throw methodNotFound({ method: requestedTarget });
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
        PermissionSpecification,
        CaveatSpecification
      >['parentCapability'];
      const specification = this.permissionSpecifications[targetKey];

      const caveats = this.constructCaveats(
        origin,
        targetName,
        approvedPermission.caveats,
      );

      const permissionOptions: PermissionOptions<
        ExtractPermission<PermissionSpecification, CaveatSpecification>
      > = {
        caveats,
        invoker: origin,
        target: targetName,
      };

      const permission = (
        specification.factory
          ? specification.factory(permissionOptions, requestData)
          : constructPermission(permissionOptions)
      ) as ExtractPermission<PermissionSpecification, CaveatSpecification>;
      this.validatePermission(specification, permission, origin, targetName);
      permissions[targetName] = permission;
    }

    this.setValidatedPermissions(origin, permissions);
    return permissions;
  }

  /**
   * Validates the specified permission by:
   * - Ensuring that it only includes caveats allowed by its specification.
   * - Calling the validator of its specification, if any.
   *
   * An error is thrown if validation fails.
   *
   * @param specification - The specification of the permission.
   * @param permission - The permission to validate.
   * @param origin - The origin associated with the permission.
   * @param targetName - The target name of the permission.
   */
  private validatePermission<
    Permission extends ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >,
  >(
    specification: PermissionSpecificationBase<string>,
    permission: Permission,
    origin: OriginString,
    targetName: Permission['parentCapability'],
  ): void {
    const { allowedCaveats, validator } = specification;
    if (permission.caveats !== null) {
      permission.caveats.forEach(({ type }) => {
        if (!allowedCaveats?.includes(type)) {
          throw new ForbiddenCaveatError(type, origin, targetName);
        }
      });
    }

    if (validator) {
      validator(permission, origin, targetName);
    }
  }

  /**
   * Assigns the specified permissions to the subject with the given origin.
   * Overwrites all existing permissions, and creates a subject entry if it
   * doesn't already exist.
   *
   * **ATTN: Assumes that the new permissions have been validated.**
   *
   * @param origin - The origin of the grantee subject.
   * @param permissions - The new permissions for the grantee subject.
   */
  private setValidatedPermissions(
    origin: OriginString,
    permissions: Record<
      string,
      ExtractPermission<PermissionSpecification, CaveatSpecification>
    >,
  ): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        // Typecast: immer's WritableDraft is incompatible with our generics
        draftState.subjects[origin] = { origin, permissions: {} };
      }

      draftState.subjects[origin].permissions = permissions as any;
    });
  }

  /**
   * Constructs the requested caveats for the permission of the specified
   * subject origin and target name.
   *
   * Throws an error if validation fails.
   *
   * @see {@link PermissionController.constructCaveat} for details.
   * @param origin - The origin of the permission subject.
   * @param target - The permission target name.
   * @param requestedCaveats - The requested caveats to construct.
   * @returns The constructed caveats.
   */
  private constructCaveats(
    origin: OriginString,
    target: ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    requestedCaveats?: unknown[] | null,
  ): NonEmptyArray<ExtractCaveats<CaveatSpecification>> | undefined {
    const caveatArray = requestedCaveats?.map((requestedCaveat) =>
      this.constructCaveat(origin, target, requestedCaveat),
    );
    return caveatArray && caveatArray.length > 0
      ? (caveatArray as NonEmptyArray<ExtractCaveats<CaveatSpecification>>)
      : undefined;
  }

  /**
   * Constructs a caveat for the permission of the specified subject origin and
   * target name, per the requested caveat argument. This methods validates
   * everything about the requested caveat, except that its `value` property
   * is JSON-compatible. It also ensures that a caveat specification exist for
   * the requested type, and calls the specification validator, if it exists, on
   * the constructed caveat.
   *
   * Throws an error if validation fails.
   *
   * @param origin - The origin of the permission subject.
   * @param target - The permission target name.
   * @param requestedCaveat - The requested caveat to construct.
   * @returns The constructed caveat.
   */
  private constructCaveat(
    origin: OriginString,
    target: ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    requestedCaveat: unknown,
  ): ExtractCaveats<CaveatSpecification> {
    if (!isPlainObject(requestedCaveat)) {
      throw new InvalidCaveatError(requestedCaveat, origin, target);
    }

    if (Object.keys(requestedCaveat).length !== 2) {
      throw new InvalidCaveatFieldsError(requestedCaveat, origin, target);
    }

    if (typeof requestedCaveat.type !== 'string') {
      throw new InvalidCaveatTypeError(requestedCaveat, origin, target);
    }

    const specification =
      this.caveatSpecifications[
        requestedCaveat.type as CaveatSpecification['type']
      ];

    if (!specification) {
      throw new UnrecognizedCaveatTypeError(
        requestedCaveat.type,
        origin,
        target,
      );
    }

    if (!hasProperty(requestedCaveat, 'value')) {
      throw new CaveatMissingValueError(requestedCaveat, origin, target);
    }

    // TODO: Consider validating that this is Json?
    const caveat = _constructCaveat(
      requestedCaveat.type,
      (requestedCaveat.value as Json) ?? null,
    );
    specification.validator?.(caveat, origin, target);
    return caveat as ExtractCaveats<CaveatSpecification>;
  }

  /**
   * Initiates a permission request that requires user approval. This should
   * always be used to grant additional permissions to a subject, unless user
   * approval has been obtained through some other means.
   *
   * @see {@link ApprovalController} For the user approval logic.
   * @see {@link PermissionController.acceptPermissionsRequest} For the method
   * that _accepts_ the request and resolves the user approval promise.
   * @see {@link PermissionController.rejectPermissionsRequest} For the method
   * that _rejects_ the request and the user approval promise.
   * @param origin - The origin of the grantee subject.
   * @param requestedPermissions - The requested permissions.
   * @param id - The id of the permissions request.
   * @param preserveExistingPermissions - Whether to preserve the subject's
   * existing permissions.
   * @returns The granted permissions and request metadata.
   */
  async requestPermissions(
    origin: OriginString,
    requestedPermissions: RequestedPermissions,
    id: string = nanoid(),
    preserveExistingPermissions = true,
  ): Promise<
    [
      Record<
        string,
        ExtractPermission<PermissionSpecification, CaveatSpecification>
      >,
      { id: string; origin: OriginString },
    ]
  > {
    this.validateRequestedPermissions(origin, requestedPermissions);
    const metadata: PermissionsRequest['metadata'] = {
      id,
      origin,
    };

    const permissionsRequest: PermissionsRequest = {
      metadata,
      permissions: requestedPermissions,
    };

    const { permissions: approvedPermissions, ...requestData } =
      await this.requestUserApproval(permissionsRequest);
    if (Object.keys(approvedPermissions).length === 0) {
      // The request should already have been rejected if this is the case.
      throw internalError(
        `Approved permissions request for origin "${origin}" contains no permissions.`,
        { requestedPermissions },
      );
    }

    return [
      this.grantPermissions({
        subject: { origin },
        approvedPermissions,
        preserveExistingPermissions,
        requestData,
      }),
      metadata,
    ];
  }

  /**
   * Adds a request to the {@link ApprovalController} using the
   * {@link AddApprovalRequest} action.
   *
   * @param permissionsRequest - The permissions request object.
   * @returns The approved permissions request object.
   */
  private async requestUserApproval(permissionsRequest: PermissionsRequest) {
    const { origin, id } = permissionsRequest.metadata;
    return (await this.messagingSystem.call(
      'ApprovalController:addRequest',
      {
        id,
        origin,
        requestData: permissionsRequest,
        type: MethodNames.requestPermissions,
      },
      true,
    )) as PermissionsRequest;
  }

  /**
   * Validates requested permissions. Throws if validation fails.
   *
   * All properties of {@link RequestedPermissions} values are ignored during
   * request processing in this controller except `caveats`, which is validated
   * by {@link PermissionController.computeCaveats}, caveat validators, and
   * permission validators.
   *
   * This method still validates the `parentCapability` field, since a mismatch
   * between a {@link RequestedPermissions} key and `parentCapability` makes it
   * impossible to determine which permission the consumer intended to request.
   * At the time of writing, our types also do not prevent this kind of
   * mismatch.
   *
   * @param origin - The origin of the grantee subject.
   * @param requestedPermissions - The requested permissions.
   */
  private validateRequestedPermissions(
    origin: OriginString,
    requestedPermissions: RequestedPermissions,
  ): void {
    if (
      !requestedPermissions ||
      typeof requestedPermissions !== 'object' ||
      Array.isArray(requestedPermissions) ||
      Object.keys(requestedPermissions).length === 0
    ) {
      throw invalidParams({ data: { origin, requestedPermissions } });
    }

    const perms: RequestedPermissions = requestedPermissions;

    for (const methodName of Object.keys(perms)) {
      const target = (
        perms[methodName] as unknown as ExtractPermission<
          PermissionSpecification,
          CaveatSpecification
        >
      ).parentCapability;
      if (target !== undefined && methodName !== target) {
        throw invalidParams({ data: { origin, requestedPermissions } });
      }

      if (!this.getTargetKey(methodName)) {
        throw methodNotFound({
          method: methodName,
          data: { origin, requestedPermissions },
        });
      }
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
   * @returns Whether the specified request exists.
   */
  private hasApprovalRequest(options: { id: string }): boolean {
    // Typecast: There are only some valid parameter combinations, but we
    // just won't worry about that here.
    return this.messagingSystem.call(
      'ApprovalController:hasRequest',
      // Typecast: Passing just an id is definitely valid, so I don't know
      // what's going on here.
      options as any,
    );
  }

  /**
   * Internal function for rejecting a permission request.
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
   * TODO
   *
   * @param origin - The origin of the subject to execute the method on behalf
   * of.
   * @param methodName - The name of the method to execute.
   * @param params - The parameters to pass to the method implementation.
   * @returns The result of the executed method.
   */
  async executeRestrictedMethod(
    origin: OriginString,
    methodName: ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    params?: RestrictedMethodParameters,
  ): Promise<Json> {
    // Throws if the method does not exist
    const methodImplementation = this._getRestrictedMethod(methodName, origin);

    const result = await this._executeRestrictedMethod(
      methodImplementation,
      { origin },
      methodName,
      params,
    );

    if (result === undefined) {
      throw new Error(
        `Internal request for method "${methodName}" as origin "${origin}" has no result.`,
      );
    }

    return result;
  }

  /**
   * TODO
   *
   * @param methodImplementation - The implementation of the method to call.
   * @param subject - Metadata about the subject that made the request.
   * @param req - The request object associated with the request.
   * @returns
   */
  private _executeRestrictedMethod(
    methodImplementation: RestrictedMethodBase<
      RestrictedMethodParameters,
      Json
    >,
    subject: PermissionSubjectMetadata,
    method: ExtractPermission<
      PermissionSpecification,
      CaveatSpecification
    >['parentCapability'],
    params: RestrictedMethodParameters = [],
  ): ReturnType<RestrictedMethodBase<RestrictedMethodParameters, Json>> {
    const { origin } = subject;

    const permission = this.getPermission(origin, method);
    if (!permission) {
      throw unauthorized({ data: { origin, method } });
    }

    return decorateWithCaveats<CaveatSpecification>(
      methodImplementation,
      permission,
      this.caveatSpecifications,
    )({ method, params, context: { origin } });
  }

  /**
   * Like {@link PermissionController.getRestrictedMethod}, except the request
   * for the restricted method is associated with a specific subject, and a
   * JSON-RPC error is thrown if the method does not exist.
   *
   * @see {@link PermissionController.executeRestrictedMethod} and
   * {@link PermissionController.createPermissionMiddleware} for usage.
   * @param method - The name of the method to get.
   * @param request - The request associated with the request for the method.
   * @returns - The restricted method implementation, if it exists.
   */
  private _getRestrictedMethod(
    method: string,
    origin: OriginString,
  ): RestrictedMethodBase<RestrictedMethodParameters, Json> {
    const methodImplementation = this.getRestrictedMethod(
      method as ExtractPermission<
        PermissionSpecification,
        CaveatSpecification
      >['parentCapability'],
    );
    if (!methodImplementation) {
      throw methodNotFound({ method, data: { origin } });
    }

    return methodImplementation;
  }
}
