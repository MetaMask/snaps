import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
  AddApprovalRequest,
  AcceptRequest as AcceptApprovalRequest,
  RejectRequest as RejectApprovalRequest,
  HasApprovalRequest,
} from '@metamask/controllers';
import type { Patch } from 'immer';
import deepFreeze from 'deep-freeze-strict';
import { Json } from 'json-rpc-engine';

import { isPlainObject, hasProperty, NonEmptyArray } from '../utils';
import {
  CaveatConstraint,
  CaveatSpecifications,
  constructCaveat,
  GenericCaveat,
} from './Caveat';
import {
  constructPermission,
  ExtractValidCaveatTypes,
  GenericPermission,
  MutableCaveats,
  OriginString,
  PermissionConstraint,
  PermissionSpecifications,
  RequestedPermissions,
  RestrictedMethod,
  TargetName,
} from './Permission';
import {
  PermissionDoesNotExistError,
  methodNotFound,
  UnrecognizedSubjectError,
  PermissionHasNoCaveatsError,
  CaveatDoesNotExistError,
  CaveatTypeDoesNotExistError,
  CaveatMissingValueError,
  InvalidCaveatFieldsError,
  InvalidSubjectIdentifierError,
  InvalidCaveatTypeError,
  CaveatAlreadyExistsError,
  InvalidCaveatError,
} from './errors';
import { PermissionEnforcer, PermissionsRequest } from './PermissionEnforcer';
import { MethodNames } from './enums';

/**
 * Metadata associated with {@link PermissionController} subjects.
 */
export type PermissionSubjectMetadata = {
  origin: OriginString;
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
export type PermissionControllerState<Permission extends GenericPermission> = {
  subjects: PermissionControllerSubjects<Permission>;
};

/**
 * The state metadata of the {@link PermissionController}.
 */
const stateMetadata = {
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
  type: `${typeof controllerName}:getSubjects`;
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

// TODO: Implement all desired actions
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
 * A utility type for extracting the {@link CaveatConstraint.value} type from
 * a union of caveat types.
 *
 * @template CaveatUnion - The caveat type union to extract a value type from.
 * @template CaveatType - The type of the caveat whose value to extract.
 */
export type ExtractCaveatValue<
  CaveatUnion extends GenericCaveat,
  CaveatType extends string,
> = CaveatUnion extends CaveatConstraint<CaveatType, infer CaveatValue>
  ? CaveatValue
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
type PermissionControllerOptions<
  TargetKey extends string,
  Caveat extends GenericCaveat | never,
  Permission extends PermissionConstraint<TargetKey, Caveat>,
> = {
  messenger: PermissionControllerMessenger;
  caveatSpecifications: CaveatSpecifications<Caveat>;
  permissionSpecifications: PermissionSpecifications<TargetKey, Permission>;
  unrestrictedMethods: string[];
  state?: Partial<PermissionControllerState<Permission>>;
};

/**
 * Options for {@link PermissionController.grantPermissions}.
 */
type GrantPermissionsOptions = {
  approvedPermissions: RequestedPermissions;
  subject: PermissionSubjectMetadata;
  shouldPreserveExistingPermissions?: boolean;
  requestData?: Record<string, unknown>;
};

export type GenericPermissionController = PermissionController<
  string,
  GenericCaveat,
  GenericPermission
>;

/**
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
  TargetKey extends string,
  Caveat extends GenericCaveat | never,
  Permission extends PermissionConstraint<TargetKey, Caveat>,
> extends BaseController<
  typeof controllerName,
  PermissionControllerState<Permission>,
  PermissionControllerMessenger
> {
  private readonly _caveatSpecifications: Readonly<
    CaveatSpecifications<Caveat>
  >;

  /**
   * The {@link CaveatSpecifications} of this controller.
   */
  public get caveatSpecifications(): Readonly<CaveatSpecifications<Caveat>> {
    return this._caveatSpecifications;
  }

  private readonly _enforcer: Readonly<
    PermissionEnforcer<TargetKey, Caveat, Permission>
  >;

  /**
   * The {@link PermissionEnforcer} of this controller.
   */
  public get enforcer(): Readonly<
    PermissionEnforcer<TargetKey, Caveat, Permission>
  > {
    return this._enforcer;
  }

  private readonly _permissionSpecifications: Readonly<
    PermissionSpecifications<TargetKey, Permission>
  >;

  /**
   * The {@link PermissionSpecifications} of this controller.
   */
  public get permissionSpecifications(): Readonly<
    PermissionSpecifications<TargetKey, Permission>
  > {
    return this._permissionSpecifications;
  }

  private readonly _unrestrictedMethods: ReadonlySet<string>;

  /**
   * The names of all JSON-RPC methods that will be ignored by this controller.
   */
  public get unrestrictedMethods(): ReadonlySet<string> {
    return this._unrestrictedMethods;
  }

  /**
   * @param options - Permission controller options.
   * @param options.caveatSpecifications - The specifications of all caveats
   * available to this controller. See {@link CaveatSpecifications} and the
   * documentation for more details.
   * @param options.permissionSpecifications - The specifications of all
   * permissions available to this controller. See
   * {@link PermissionSpecifications} and the documentation for more details.
   * @param options.unrestrictedMethods - The callable names of all JSON-RPC
   * methods ignored by the new controller.
   * @param options.messenger - The controller messenger. See
   * {@link BaseController} for more information.
   * @param options.state - Existing state to hydrate the controller with at
   * initialization.
   */
  constructor(
    options: PermissionControllerOptions<TargetKey, Caveat, Permission>,
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
      metadata: stateMetadata,
      messenger,
      state: {
        ...(defaultState as PermissionControllerState<Permission>),
        ...state,
      },
    });

    this._caveatSpecifications = deepFreeze({ ...caveatSpecifications });
    this._permissionSpecifications = deepFreeze({
      ...permissionSpecifications,
    });
    this._unrestrictedMethods = new Set(unrestrictedMethods);

    this.registerMessageHandlers();
    this._enforcer = this.constructEnforcer();
  }

  /**
   * Constructor helper for registering this controller's messaging system
   * actions.
   */
  private registerMessageHandlers(): void {
    this.messagingSystem.registerActionHandler(
      `${controllerName}:clearPermissions`,
      () => this.clearState(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getSubjects`,
      () => this.getSubjects(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:hasPermissions`,
      (origin: string) => this.hasPermissions(origin),
    );
  }

  clearState(): void {
    this.update((_draftState) => {
      return { ...defaultState };
    });
  }

  getSubjects(): OriginString[] {
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
  getPermission<SubjectPermission extends Permission>(
    origin: OriginString,
    target: SubjectPermission['parentCapability'],
  ): SubjectPermission | undefined {
    return this.state.subjects[origin]?.permissions[
      target
    ] as SubjectPermission;
  }

  getPermissions(
    origin: OriginString,
  ): SubjectPermissions<Permission> | undefined {
    return this.state.subjects[origin]?.permissions;
  }

  hasPermission(
    origin: OriginString,
    target: Permission['parentCapability'],
  ): boolean {
    return Boolean(this.getPermission(origin, target));
  }

  hasPermissions(origin: OriginString): boolean {
    return Boolean(this.state.subjects[origin]);
  }

  private validateModifiedPermission(permission: Permission): void {
    const targetKey = this.getTargetKey(permission.parentCapability);
    /* istanbul ignore next: this should be impossible */
    if (!targetKey) {
      throw new Error(
        `Fatal: Existing permission target key "${targetKey}" has no specification.`,
      );
    }
    this.permissionSpecifications[targetKey].validator?.(permission);
  }

  /**
   * Adds permissions to the given subject. Overwrites existing identical
   * permissions (same subject and method). Other existing permissions
   * remain unaffected.
   *
   * **ATTN: Assumes that the new permissions have been validated.**
   *
   * @param origin - The origin of the grantee subject.
   * @param permissions - The new permissions for the grantee subject.
   */
  private setValidatedPermissions(
    origin: OriginString,
    permissions: Record<TargetName, Permission>,
    shouldPreserveExistingPermissions = false,
  ): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        // Typecast: immer's WritableDraft is incompatible with our generics
        draftState.subjects[origin] = { origin, permissions: {} as any };
      }

      if (shouldPreserveExistingPermissions) {
        Object.assign(draftState.subjects[origin].permissions, permissions);
      } else {
        // Typecast: ts(2589)
        draftState.subjects[origin].permissions = permissions as any;
      }
    });
  }

  revokePermission(
    origin: OriginString,
    target: Permission['parentCapability'],
  ): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        throw new UnrecognizedSubjectError(origin);
      }

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
  }

  revokePermissionForAllSubjects(target: Permission['parentCapability']): void {
    if (this.getSubjects().length === 0) {
      return;
    }

    this.update((draftState) => {
      Object.values(draftState.subjects).forEach((subject) => {
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
    draftState: PermissionControllerState<Permission>,
    permissions: SubjectPermissions<Permission>,
    origin: OriginString,
    target: Permission['parentCapability'],
  ): void {
    if (Object.keys(permissions).length > 1) {
      delete permissions[target];
    } else {
      delete draftState.subjects[origin];
    }
  }

  revokeAllPermissions(origin: OriginString): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        throw new UnrecognizedSubjectError(origin);
      }
      delete draftState.subjects[origin];
    });
  }

  hasCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<
      Permission,
      TargetKey,
      TargetName
    >,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): boolean {
    return (
      this.getPermission(origin, target)?.caveats?.some(
        (caveat) => caveat.type === caveatType,
      ) ?? false
    );
  }

  addCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<
      Permission,
      TargetKey,
      TargetName
    >,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<Caveat, CaveatType>,
  ): void {
    if (this.hasCaveat(origin, target, caveatType)) {
      throw new CaveatAlreadyExistsError(origin, target, caveatType);
    }

    this.setCaveat(origin, target, caveatType, caveatValue);
  }

  updateCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<
      Permission,
      TargetKey,
      TargetName
    >,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<Caveat, CaveatType>,
  ): void {
    if (!this.hasCaveat(origin, target, caveatType)) {
      throw new CaveatDoesNotExistError(origin, target, caveatType);
    }

    this.setCaveat(origin, target, caveatType, caveatValue);
  }

  private setCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<
      Permission,
      TargetKey,
      TargetName
    >,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<Caveat, CaveatType>,
  ): void {
    this.update((draftState) => {
      // Typecast: immer's WritableDraft is incompatible with our generics
      const permission: MutableCaveats<Permission> = (
        draftState.subjects as PermissionControllerSubjects<Permission>
      )[origin]?.permissions[target];
      /* istanbul ignore if: This should be impossible, but TypeScript wants it */
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      const caveat = this.computeCaveat(origin, target, {
        type: caveatType,
        value: caveatValue,
      });

      // Typecasts: ts(2589)
      if (permission.caveats) {
        const caveatIndex = permission.caveats.findIndex(
          (existingCaveat) => existingCaveat.type === caveat.type,
        );

        if (caveatIndex === -1) {
          permission.caveats.push(caveat as any);
        } else {
          permission.caveats.splice(caveatIndex, 1, caveat as any);
        }
      } else {
        // Typecast: At this point, we don't know if the specific permission
        // is allowed to have caveats, but it should be impossible to call
        // this method for a permission that may not have any caveats.
        // If all else fails, the permission validator is also called.
        permission.caveats = [caveat] as any;
      }

      this.validateModifiedPermission(permission as Permission);
    });
  }

  removeCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<
      Permission,
      TargetKey,
      TargetName
    >,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): void {
    this.update((draftState) => {
      // Typecast: immer's WritableDraft is incompatible with our generics
      const permission: MutableCaveats<Permission> = (
        draftState.subjects as PermissionControllerSubjects<Permission>
      )[origin]?.permissions[target];
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      if (!permission.caveats) {
        throw new PermissionHasNoCaveatsError(origin, target);
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

      this.validateModifiedPermission(permission as Permission);
    });
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
  getTargetKey(method: Permission['parentCapability']): TargetKey | undefined {
    if (hasProperty(this._permissionSpecifications, method)) {
      return method as TargetKey;
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

    if (hasProperty(this._permissionSpecifications, targetKey)) {
      return targetKey as TargetKey;
    } else if (wildCardMethodsWithoutWildCard[targetKey]) {
      return `${targetKey}*` as TargetKey;
    }

    return undefined;
  }

  getRestrictedMethod(
    method: Permission['parentCapability'],
  ): RestrictedMethod<Json, Json> | undefined {
    const targetKey = this.getTargetKey(method);
    if (!targetKey) {
      return undefined;
    }

    return this.permissionSpecifications[targetKey].methodImplementation;
  }

  grantPermissions({
    requestData,
    approvedPermissions,
    shouldPreserveExistingPermissions = false,
    subject,
  }: GrantPermissionsOptions): SubjectPermissions<Permission> {
    const { origin } = subject;

    if (!origin || typeof origin !== 'string') {
      throw new InvalidSubjectIdentifierError(origin);
    }

    const permissions: SubjectPermissions<Permission> =
      ((shouldPreserveExistingPermissions && {
        ...this.getPermissions(origin),
      }) ||
        {}) as SubjectPermissions<Permission>;

    for (const requestedTarget of Object.keys(approvedPermissions)) {
      const targetKey = this.getTargetKey(
        requestedTarget as Permission['parentCapability'],
      );
      if (!targetKey) {
        throw methodNotFound({ method: requestedTarget });
      }

      // The requested target must be a valid target name if we found its key.
      // We reassign it to change its type.
      const targetName = requestedTarget as Permission['parentCapability'];
      const specification = this.permissionSpecifications[targetKey];

      const caveats = this.computeCaveats(
        origin,
        targetName,
        approvedPermissions[targetName].caveats,
      );

      const permissionOptions = {
        caveats,
        invoker: origin,
        target: targetName,
      };

      const permission = (
        specification.factory
          ? specification.factory(permissionOptions, requestData)
          : constructPermission(permissionOptions)
      ) as Permission;
      specification.validator?.(permission);
      permissions[targetName] = permission;
    }

    this.setValidatedPermissions(origin, permissions);
    return permissions;
  }

  /**
   * @param caveats The caveats to validate.
   * @returns Whether the given caveats are valid.
   */
  private computeCaveats(
    origin: OriginString,
    target: Permission['parentCapability'],
    caveats?: unknown[] | null,
  ): NonEmptyArray<Caveat> | undefined {
    const caveatArray = caveats?.map((requestedCaveat) =>
      this.computeCaveat(origin, target, requestedCaveat),
    );
    return caveatArray && caveatArray.length > 0
      ? (caveatArray as NonEmptyArray<Caveat>)
      : undefined;
  }

  private computeCaveat(
    origin: OriginString,
    target: Permission['parentCapability'],
    requestedCaveat: unknown,
  ): Caveat {
    if (!isPlainObject(requestedCaveat)) {
      throw new InvalidCaveatError(requestedCaveat);
    }

    if (Object.keys(requestedCaveat).length !== 2) {
      throw new InvalidCaveatFieldsError(requestedCaveat, origin, target);
    }

    if (requestedCaveat.type !== 'string') {
      throw new InvalidCaveatTypeError(requestedCaveat.type);
    }

    const specification =
      this.caveatSpecifications[
        requestedCaveat.type as keyof CaveatSpecifications<Caveat>
      ];

    if (!specification) {
      throw new CaveatTypeDoesNotExistError(
        requestedCaveat.type,
        origin,
        target,
      );
    }

    if (!hasProperty(requestedCaveat, 'value')) {
      throw new CaveatMissingValueError(requestedCaveat, origin, target);
    }

    // TODO: Consider validating that this is Json?
    const caveat = constructCaveat(
      requestedCaveat.type,
      (requestedCaveat.value as Json) ?? null,
    );
    specification.validator?.(origin, target, caveat);
    return caveat as Caveat;
  }

  private constructEnforcer(): PermissionEnforcer<
    TargetKey,
    Caveat,
    Permission
  > {
    return new PermissionEnforcer<TargetKey, Caveat, Permission>({
      caveatSpecifications: this.caveatSpecifications,
      getPermission: this.getPermission.bind(this),
      getRestrictedMethod: this.getRestrictedMethod.bind(this),
      grantPermissions: this.grantPermissions.bind(this),
      isRestrictedMethod: (method: string) => {
        return Boolean(
          this.getTargetKey(method as Permission['parentCapability']),
        );
      },
      isUnrestrictedMethod: (method: string) => {
        return this.unrestrictedMethods.has(method);
      },
      requestUserApproval: async (permissionsRequest: PermissionsRequest) => {
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
      },
      acceptPermissionsRequest: (id: string, value?: unknown) =>
        this.messagingSystem.call(
          'ApprovalController:acceptRequest',
          id,
          value,
        ),
      rejectPermissionsRequest: (id: string, error: Error) =>
        this.messagingSystem.call(
          'ApprovalController:rejectRequest',
          id,
          error,
        ),
      hasApprovalRequest: (opts: {
        id?: string;
        origin?: OriginString;
        type?: string;
      }) =>
        // Typecast: There are only some valid parameter combinations, but we
        // just won't worry about that here. It's unclear if the messaging
        // even handles them.
        this.messagingSystem.call('ApprovalController:hasRequest', opts as any),
    });
  }
}
