import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import type { Patch } from 'immer';
import deepFreeze from 'deep-freeze-strict';
import { Json } from 'json-rpc-engine';

import { isPlainObject } from '../utils';
import { Caveat, CaveatSpecifications, constructCaveat } from './Caveat';
import {
  OriginString,
  Permission,
  MethodName,
  RequestedPermissions,
  RestrictedMethodImplementation,
  PermissionSpecifications,
  findCaveat,
  constructPermission,
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

export type PermissionsSubjectMetadata = {
  origin: OriginString;
};

const controllerName = 'PermissionController';

export type SubjectPermissions = Record<MethodName, Permission>;

export type PermissionsSubjectEntry = {
  permissions: SubjectPermissions;
} & PermissionsSubjectMetadata;

export type PermissionControllerSubjects = Record<
  OriginString,
  PermissionsSubjectEntry
>;

// TODO: TypeScript doesn't understand that a given subject may not exist. Can we fix it?
// Yes we can, in TS4.4
export type PermissionControllerState = {
  subjects: PermissionControllerSubjects;
};

const stateMetadata = {
  subjects: { persist: true, anonymous: true },
};

const defaultState: PermissionControllerState = {
  subjects: {},
};

export type GetPermissionsState = {
  type: `${typeof controllerName}:getState`;
  handler: () => PermissionControllerState;
};

export type GetSubjects = {
  type: `${typeof controllerName}:getSubjects`;
  handler: () => (keyof PermissionControllerSubjects)[];
};

export type ClearPermissions = {
  type: `${typeof controllerName}:clearPermissions`;
  handler: () => void;
};

export type PermissionControllerActions =
  | GetPermissionsState
  | GetSubjects
  | ClearPermissions;

export type PermissionsStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [PermissionControllerState, Patch[]];
};

export type PermissionControllerEvents = PermissionsStateChange;

export type PermissionControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  PermissionControllerActions,
  PermissionControllerEvents,
  never,
  never
>;

type PermissionControllerOptions = {
  messenger: PermissionControllerMessenger;
  caveatSpecifications: CaveatSpecifications;
  permissionSpecifications: PermissionSpecifications;
  safeMethods: string[];
  state?: Partial<PermissionControllerState>;
};

type GrantPermissionsOptions = {
  approvedPermissions: RequestedPermissions;
  subject: PermissionsSubjectMetadata;
  shouldPreserveExistingPermissions?: boolean;
  requestData?: Record<string, unknown>;
};

export class PermissionController extends BaseController<
  typeof controllerName,
  PermissionControllerState
> {
  protected messagingSystem: PermissionControllerMessenger;

  private readonly _permissionSpecifications: Readonly<PermissionSpecifications>;

  public get permissionSpecifications(): Readonly<PermissionSpecifications> {
    return this._permissionSpecifications;
  }

  private readonly _safeMethods: ReadonlySet<string>;

  public get safeMethods(): ReadonlySet<string> {
    return this._safeMethods;
  }

  private readonly _caveatSpecifications: Readonly<CaveatSpecifications>;

  public get caveatSpecifications(): Readonly<CaveatSpecifications> {
    return this._caveatSpecifications;
  }

  constructor({
    messenger,
    state = {},
    caveatSpecifications,
    permissionSpecifications,
    safeMethods,
  }: PermissionControllerOptions) {
    super({
      name: controllerName,
      metadata: stateMetadata,
      messenger,
      state: { ...defaultState, ...state },
    });

    this._caveatSpecifications = deepFreeze({ ...caveatSpecifications });
    this._permissionSpecifications = deepFreeze({
      ...permissionSpecifications,
    });
    this._safeMethods = new Set(safeMethods);

    // This assignment is redundant, but TypeScript doesn't know that it becomes
    // assigned if we don't do it.
    this.messagingSystem = messenger;

    this.registerMessageHandlers();
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

  getSubjects(): (keyof PermissionControllerSubjects)[] {
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
  getPermission(origin: string, target: string): Permission | undefined {
    return this.state.subjects[origin]?.permissions[target];
  }

  getPermissions(origin: string): Record<MethodName, Permission> | undefined {
    return this.state.subjects[origin]?.permissions;
  }

  hasPermission(origin: string, target: string): boolean {
    return Boolean(this.getPermission(origin, target));
  }

  hasPermissions(origin: string): boolean {
    return Boolean(this.state.subjects[origin]);
  }

  private validatePermission(permission: Permission): void {
    const specification = this.getPermissionSpecification(
      this.getTargetKey(permission.parentCapability),
    );
    specification.validator?.(permission);
  }

  /**
   * Adds permissions to the given subject. Overwrites existing identical
   * permissions (same subject and method). Other existing permissions
   * remain unaffected.
   *
   * **Note: Assumes that the new permissions have been validated.**
   *
   * @param origin - The origin of the grantee subject.
   * @param permissions - The new permissions for the grantee subject.
   */
  private setValidatedPermissions(
    origin: string,
    permissions: Record<MethodName, Permission>,
    shouldPreserveExistingPermissions = false,
  ): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        draftState.subjects[origin] = { origin, permissions: {} };
      }

      if (shouldPreserveExistingPermissions) {
        Object.assign(draftState.subjects[origin].permissions, permissions);
      } else {
        // Typecast: ts(2589)
        draftState.subjects[origin].permissions = permissions as any;
      }
    });
  }

  revokePermission(origin: string, target: string): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        throw new UnrecognizedSubjectError(origin);
      }

      const { permissions } = draftState.subjects[origin];
      if (!permissions[target]) {
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

  revokePermissionForAllSubjects(target: string): void {
    if (this.getSubjects().length === 0) {
      return;
    }

    this.update((draftState) => {
      Object.values(draftState.subjects).forEach((subject) => {
        const { permissions } = subject;

        // Typecast: ts(2589)
        if (permissions[target]) {
          this.deletePermission(
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
    draftState: PermissionControllerState,
    permissions: SubjectPermissions,
    origin: string,
    target: string,
  ): void {
    if (Object.keys(permissions).length > 1) {
      delete permissions[target];
    } else {
      delete draftState.subjects[origin];
    }
  }

  revokeAllPermissions(origin: string): void {
    this.update((draftState) => {
      if (!draftState.subjects[origin]) {
        throw new UnrecognizedSubjectError(origin);
      }
      delete draftState.subjects[origin];
    });
  }

  hasCaveat(origin: string, target: string, caveatType: string): boolean {
    return (
      this.getPermission(origin, target)?.caveats?.some(
        (caveat) => caveat.type === caveatType,
      ) ?? false
    );
  }

  addCaveat(
    origin: string,
    target: string,
    caveatType: string,
    caveatValue: Json,
  ): void {
    if (this.hasCaveat(origin, target, caveatType)) {
      throw new CaveatAlreadyExistsError(origin, target, caveatType);
    }

    this.setCaveat(origin, target, caveatType, caveatValue);
  }

  updateCaveat(
    origin: string,
    target: string,
    caveatType: string,
    caveatValue: Json,
  ): void {
    if (!this.hasCaveat(origin, target, caveatType)) {
      throw new CaveatDoesNotExistError(origin, target, caveatType);
    }

    this.setCaveat(origin, target, caveatType, caveatValue);
  }

  private getCaveat(
    origin: string,
    target: string,
    caveatType: string,
  ): Caveat<Json> | undefined {
    const permission = this.getPermission(origin, target);
    if (!permission) {
      throw new PermissionDoesNotExistError(origin, target);
    }

    return findCaveat(permission, caveatType);
  }

  private setCaveat(
    origin: string,
    target: string,
    caveatType: string,
    caveatValue: Json,
  ): void {
    this.update((draftState) => {
      const permission = draftState.subjects[origin]?.permissions[target];
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
        permission.caveats = [caveat as any];
      }

      // Typecast: ts(2589)
      this.validatePermission(permission as any);
    });
  }

  removeCaveat(origin: string, target: string, caveatType: string): void {
    this.update((draftState) => {
      const permission = draftState.subjects[origin]?.permissions[target];
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

      // Typecast: ts(2589)
      this.validatePermission(permission as any);
    });
  }

  /**
   * Used for retrieving the key that manages the restricted method
   * associated with the current RPC `method` key.
   *
   * Used to support our namespaced method feature, which allows blocks
   * of methods to be hidden behind a restricted method with a trailing `_` character.
   *
   * @param method string - The requested RPC method.
   * @returns The internal key of the method.
   */
  getTargetKey(method: string): string {
    if (method in this._permissionSpecifications) {
      return method;
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
      !(targetKey in this._permissionSpecifications) &&
      !wildCardMethodsWithoutWildCard[targetKey]
    ) {
      targetKey += `${segments.shift()}_`;
    }

    if (targetKey in this._permissionSpecifications) {
      return targetKey;
    } else if (wildCardMethodsWithoutWildCard[targetKey]) {
      return `${targetKey}*`;
    }

    return '';
  }

  getRestrictedMethodImplementation(
    method: string,
  ): RestrictedMethodImplementation<Json, Json> | undefined {
    const targetKey = this.getTargetKey(method);
    if (!targetKey) {
      return undefined;
    }

    return this.getPermissionSpecification(method).methodImplementation;
  }

  private getPermissionSpecification(targetKey: string) {
    const specification = this._permissionSpecifications[targetKey];
    /* istanbul ignore if: This should be impossible, but TypeScript wants it */
    if (!specification) {
      throw new Error(
        `Existing permission target key "${targetKey}" has no specification.`,
      );
    }

    return specification;
  }

  grantPermissions(opts: GrantPermissionsOptions): SubjectPermissions {
    const {
      requestData,
      approvedPermissions,
      shouldPreserveExistingPermissions = false,
      subject,
    } = opts;
    const { origin } = subject;

    if (!origin || typeof origin !== 'string') {
      throw new InvalidSubjectIdentifierError(origin);
    }

    const permissions: { [methodName: string]: Permission } =
      (shouldPreserveExistingPermissions && {
        ...this.getPermissions(origin),
      }) ||
      {};

    for (const target of Object.keys(approvedPermissions)) {
      const targetKey = this.getTargetKey(target);
      if (!targetKey) {
        throw methodNotFound({ method: target });
      }

      const specification = this.getPermissionSpecification(targetKey);

      const caveats = this.computeCaveats(
        origin,
        target,
        approvedPermissions[target].caveats || undefined,
      );

      const permissionOptions = { caveats, invoker: origin, target };

      let permission: Permission;
      if (specification.factory) {
        permission = specification.factory(permissionOptions, requestData);
      } else {
        permission = constructPermission(permissionOptions);
        specification.validator?.(permission);
      }

      permissions[targetKey] = permission;
    }

    this.setValidatedPermissions(origin, permissions);
    return permissions;
  }

  /**
   * @param caveats The caveats to validate.
   * @returns Whether the given caveats are valid.
   */
  private computeCaveats(
    origin: string,
    target: string,
    caveats?: Caveat<Json>[],
  ): Caveat<Json>[] | undefined {
    const caveatArray = caveats?.map((requestedCaveat) =>
      this.computeCaveat(origin, target, requestedCaveat),
    );
    return caveatArray && caveatArray.length > 0 ? caveatArray : undefined;
  }

  private computeCaveat(
    origin: string,
    target: string,
    requestedCaveat: Caveat<Json>,
  ): Caveat<Json> {
    if (!isPlainObject(requestedCaveat)) {
      throw new InvalidCaveatError(requestedCaveat);
    }

    if (Object.keys(requestedCaveat).length !== 2) {
      throw new InvalidCaveatFieldsError(requestedCaveat, origin, target);
    }

    if (requestedCaveat.type !== 'string') {
      throw new InvalidCaveatTypeError(requestedCaveat.type);
    }

    const specification = this.caveatSpecifications[requestedCaveat.type];
    if (!specification) {
      throw new CaveatTypeDoesNotExistError(
        requestedCaveat.type,
        origin,
        target,
      );
    }

    if (!('value' in requestedCaveat)) {
      throw new CaveatMissingValueError(requestedCaveat, origin, target);
    }

    const caveat = constructCaveat(requestedCaveat.type, requestedCaveat.value);

    specification.validator?.(origin, target, caveat);
    return caveat;
  }
}
