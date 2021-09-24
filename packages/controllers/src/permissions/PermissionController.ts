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

import { isPlainObject, hasProperty } from '../utils';
import {
  CaveatSpecs,
  constructCaveat,
  ExtractCaveatValue,
  GenericCaveat,
} from './Caveat';
import {
  OriginString,
  MethodName,
  RequestedPermissions,
  RestrictedMethodImplementation,
  constructPermission,
  GenericPermission,
  PermSpecs,
  PermConstraint,
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

export type PermissionSubjectMetadata = {
  origin: OriginString;
};

const controllerName = 'PermissionController';

export type SubjectPermissions<Permission extends GenericPermission> = Record<
  Permission['parentCapability'],
  Permission
>;

export type PermissionSubjectEntry<Permission extends GenericPermission> = {
  permissions: SubjectPermissions<Permission>;
} & PermissionSubjectMetadata;

export type PermissionControllerSubjects<Permission extends GenericPermission> =
  Record<OriginString, PermissionSubjectEntry<Permission>>;

// TODO:TS4.4 Enable compiler flags to forbid unchecked member access
export type PermissionControllerState<Permission extends GenericPermission> = {
  subjects: PermissionControllerSubjects<Permission>;
};

const stateMetadata = {
  subjects: { persist: true, anonymous: true },
};

// Typecast: We can't reference the class generics, so we must resort to "any"
const defaultState: PermissionControllerState<any> = {
  subjects: {},
};

export type GetPermissionsState = {
  type: `${typeof controllerName}:getState`;
  handler: () => PermissionControllerState<GenericPermission>;
};

export type GetSubjects = {
  type: `${typeof controllerName}:getSubjects`;
  handler: () => (keyof PermissionControllerSubjects<GenericPermission>)[];
};

export type ClearPermissions = {
  type: `${typeof controllerName}:clearPermissions`;
  handler: () => void;
};

// TODO: Implement all desired actions
export type PermissionControllerActions =
  | GetPermissionsState
  | GetSubjects
  | ClearPermissions;

export type PermissionsStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [PermissionControllerState<GenericPermission>, Patch[]];
};

/**
 * The controller only emits its generic state change events. Consumers should
 * use selector subscriptions to subscribe to relevant substate.
 */
export type PermissionControllerEvents = PermissionsStateChange;

type AllowedActions =
  | AddApprovalRequest
  | HasApprovalRequest
  | AcceptApprovalRequest
  | RejectApprovalRequest;

export type PermissionControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  PermissionControllerActions | AllowedActions,
  PermissionControllerEvents,
  AllowedActions['type'],
  never
>;

// type ExtractPermissionOptions<
//   PSpec,
//   Perm extends GenericPermission,
// > = PSpec extends PermissionSpecificationConstraint<
//   Perm['parentCapability'],
//   PermConstraint<>,
//   infer PermOpts,
//   Record<string, unknown>,
//   RestrictedMethodImplementation<Json, Json>
// >
//   ? PermOpts
//   : never;

// type ExtractRequestData<
//   PSpec,
//   Perm extends GenericPermission,
// > = PSpec extends PermissionSpecificationConstraint<
//   Perm['parentCapability'],
//   PermissionOptions,
//   infer RequestData,
//   RestrictedMethodImplementation<Json, Json>
// >
//   ? RequestData
//   : never;

// type ExtractMethodImplementation<
//   PSpec,
//   Perm extends GenericPermission,
// > = PSpec extends PermissionSpecificationConstraint<
//   Perm['parentCapability'],
//   PermissionOptions,
//   Record<string, unknown>,
//   infer Impl
// >
//   ? Impl
//   : never;

type ExtractValidCaveatTypes<
  Perm extends GenericPermission,
  TargetName extends string,
> = Perm extends {
  parentCapability: TargetName;
  caveats: null;
}
  ? never
  : Perm extends PermConstraint<TargetName, infer ValidCaveats>
  ? ValidCaveats extends GenericCaveat
    ? ValidCaveats['type']
    : never
  : never;

type PermissionControllerOptions<
  TargetKey extends string,
  Caveat extends GenericCaveat | never,
  Permission extends PermConstraint<TargetKey, Caveat>,
> = {
  messenger: PermissionControllerMessenger;
  caveatSpecifications: CaveatSpecs<Caveat>;
  permissionSpecifications: PermSpecs<TargetKey, Permission>;
  unrestrictedMethods: string[];
  state?: Partial<PermissionControllerState<Permission>>;
};

type GrantPermissionsOptions = {
  approvedPermissions: RequestedPermissions;
  subject: PermissionSubjectMetadata;
  shouldPreserveExistingPermissions?: boolean;
  requestData?: Record<string, unknown>;
};

export class PermissionController<
  TargetKey extends string,
  Caveat extends GenericCaveat | never,
  Permission extends PermConstraint<TargetKey, Caveat>,
> extends BaseController<
  typeof controllerName,
  PermissionControllerState<Permission>,
  PermissionControllerMessenger
> {
  private readonly _caveatSpecifications: Readonly<CaveatSpecs<Caveat>>;

  public get caveatSpecifications(): Readonly<CaveatSpecs<Caveat>> {
    return this._caveatSpecifications;
  }

  private readonly _enforcer: Readonly<
    PermissionEnforcer<TargetKey, Caveat, Permission>
  >;

  public get enforcer(): Readonly<
    PermissionEnforcer<TargetKey, Caveat, Permission>
  > {
    return this._enforcer;
  }

  private readonly _permissionSpecifications: Readonly<
    PermSpecs<TargetKey, Permission>
  >;

  public get permissionSpecifications(): Readonly<
    PermSpecs<TargetKey, Permission>
  > {
    return this._permissionSpecifications;
  }

  private readonly _unrestrictedMethods: ReadonlySet<string>;

  public get unrestrictedMethods(): ReadonlySet<string> {
    return this._unrestrictedMethods;
  }

  constructor({
    messenger,
    state = {},
    caveatSpecifications,
    permissionSpecifications,
    unrestrictedMethods,
  }: PermissionControllerOptions<TargetKey, Caveat, Permission>) {
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
      `${controllerName}:getSubjects`,
      () => this.getSubjects(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:clearPermissions`,
      () => this.clearState(),
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
    permissions: Record<MethodName, Permission>,
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
    CaveatType extends ExtractValidCaveatTypes<Permission, TargetName>,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): boolean {
    return (
      this.getPermission(origin, target)?.caveats?.some(
        (caveat) => caveat.type === caveatType,
      ) ?? false
    );
  }

  addCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<Permission, TargetName>,
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
    CaveatType extends ExtractValidCaveatTypes<Permission, TargetName>,
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

  // private getCaveat<
  //   TargetName extends Permission['parentCapability'],
  //   CaveatType extends ExtractValidCaveatTypes<Permission, TargetName>,
  // >(
  //   origin: OriginString,
  //   target: TargetName,
  //   caveatType: CaveatType,
  // ): CaveatType | undefined {
  //   const permission = this.getPermission(origin, target);
  //   if (!permission) {
  //     throw new PermissionDoesNotExistError(origin, target);
  //   }

  //   return findCaveat(permission, caveatType);
  // }

  private setCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<Permission, TargetName>,
  >(
    origin: OriginString,
    target: TargetName,
    caveatType: CaveatType,
    caveatValue: ExtractCaveatValue<Caveat, CaveatType>,
  ): void {
    this.update((draftState) => {
      // Typecast: immer's WritableDraft is incompatible with our generics
      const permission = (
        draftState.subjects as PermissionControllerSubjects<Permission>
      )[origin]?.permissions[target] as Permission;
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

      this.validateModifiedPermission(permission);
    });
  }

  removeCaveat<
    TargetName extends Permission['parentCapability'],
    CaveatType extends ExtractValidCaveatTypes<Permission, TargetName>,
  >(origin: OriginString, target: TargetName, caveatType: CaveatType): void {
    this.update((draftState) => {
      // Typecast: immer's WritableDraft is incompatible with our generics
      const permission: Permission = (
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

      this.validateModifiedPermission(permission);
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

  getRestrictedMethodImplementation(
    method: Permission['parentCapability'],
  ): RestrictedMethodImplementation<Json, Json> | undefined {
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
    caveats?: unknown[],
  ): Caveat[] | undefined {
    const caveatArray = caveats?.map((requestedCaveat) =>
      this.computeCaveat(origin, target, requestedCaveat),
    );
    return caveatArray && caveatArray.length > 0 ? caveatArray : undefined;
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
        requestedCaveat.type as keyof CaveatSpecs<Caveat>
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

    const caveat = constructCaveat(requestedCaveat.type, requestedCaveat.value);
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
      getRestrictedMethodImplementation:
        this.getRestrictedMethodImplementation.bind(this),
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
