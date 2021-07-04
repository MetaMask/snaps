import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import deepEqual from 'fast-deep-equal';
import {
  Json,
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
  JsonRpcMiddleware,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { CaveatSpecifications } from './caveat-processing';
import {
  OriginString,
  Permission,
  MethodName,
  RequestedPermissions,
} from './Permission';
import {
  PermissionDoesNotExistError,
  methodNotFound,
  UnrecognizedActorError,
  PermissionHasNoCaveatsError,
  CaveatDoesNotExistError,
  CaveatTypeDoesNotExistError,
  InvalidCaveatJsonError,
  PermissionTargetDoesNotExistError,
  CaveatMissingValueError,
  InvalidCaveatFieldsError,
  InvalidActorIdentifierError,
} from './errors';
import { Caveat } from './Caveat';

export interface ActorMetadata {
  origin: OriginString;
}

const controllerName = 'PermissionController';

export interface PermissionsActorEntry extends ActorMetadata {
  permissions: Record<MethodName, Permission>;
}

export type PermissionControllerActors = Record<
  OriginString,
  PermissionsActorEntry
>;

export type PermissionControllerState = {
  actors: PermissionControllerActors;
};

const stateMetadata = {
  actors: { persist: true, anonymous: true },
};

const defaultState: PermissionControllerState = {
  actors: {},
};

export interface GetActorsAction {
  type: `${typeof controllerName}:getActors`;
  handler: () => (keyof PermissionControllerActors)[];
}

export interface ClearPermissionsAction {
  type: `${typeof controllerName}:clearPermissions`;
  handler: () => void;
}

export interface PermissionChangedPayload<PermissionTarget extends string> {
  actor: OriginString;
  target: PermissionTarget;
  permission: Permission;
}

export interface PermissionChangedEvent<PermissionTarget extends string> {
  type: `${typeof controllerName}:permissionChanged:${PermissionTarget}`;
  payload: [PermissionChangedPayload<PermissionTarget>];
}

export type PermissionControllerActions =
  | GetActorsAction
  | ClearPermissionsAction;

export type PermissionControllerEvents = PermissionChangedEvent<string>;

export type PermissionControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  PermissionControllerActions,
  PermissionControllerEvents,
  never,
  never
>;

export interface RestrictedMethodImplementation<Params, Result>
  extends JsonRpcMiddleware<Params, Result> {
  (
    req: JsonRpcRequest<Params>,
    res: PendingJsonRpcResponse<Result>,
    next: JsonRpcEngineNextCallback,
    end: JsonRpcEngineEndCallback,
    context?: Readonly<{
      origin: OriginString;
      [key: string]: unknown;
    }>,
  ): void;
}

type RestrictedMethodsOption = Record<
  MethodName,
  RestrictedMethodImplementation<unknown, unknown>
>;

interface PermissionControllerOptions {
  messenger: PermissionControllerMessenger;
  caveatSpecifications: CaveatSpecifications;
  methodPrefix: string;
  restrictedMethods: RestrictedMethodsOption;
  safeMethods: string[];
  state?: Partial<PermissionControllerState>;
}

export class PermissionController extends BaseController<
  typeof controllerName,
  PermissionControllerState
> {
  public readonly methodPrefix: string;

  protected messagingSystem: PermissionControllerMessenger;

  /**
   * Can be namespaced.
   */
  private readonly restrictedMethods: ReadonlyMap<
    string,
    RestrictedMethodImplementation<unknown, unknown>
  >;

  private readonly _safeMethods: ReadonlySet<string>;

  public get safeMethods(): ReadonlySet<string> {
    return this._safeMethods;
  }

  private readonly _internalMethods: ReadonlySet<string>;

  public get internalMethods(): ReadonlySet<string> {
    return this._internalMethods;
  }

  private readonly _caveatSpecifications: Readonly<CaveatSpecifications>;

  public get caveatSpecifications(): Readonly<CaveatSpecifications> {
    return this._caveatSpecifications;
  }

  protected readonly caveatTypes: ReadonlySet<string>;

  constructor({
    messenger,
    state = {},
    caveatSpecifications,
    methodPrefix,
    restrictedMethods,
    safeMethods,
  }: PermissionControllerOptions) {
    super({
      name: controllerName,
      metadata: stateMetadata,
      messenger,
      state: { ...defaultState, ...state },
    });

    this._caveatSpecifications = Object.freeze(caveatSpecifications);
    this.caveatTypes = getCaveatTypes(caveatSpecifications);
    this.methodPrefix = methodPrefix;
    this._internalMethods = getInternalMethodNames(methodPrefix);
    this.restrictedMethods = getRestrictedMethodMap(restrictedMethods);
    this._safeMethods = new Set(safeMethods);

    // This assignment is redundant, but TypeScript doesn't know that it becomes
    // assigned if we don't do it.
    this.messagingSystem = messenger;

    this.registerMessageHandlers();
  }

  protected registerMessageHandlers(): void {
    this.messagingSystem.registerActionHandler(
      `${controllerName}:getActors`,
      () => this.getActors(),
    );
    this.messagingSystem.registerActionHandler(
      `${controllerName}:clearPermissions`,
      () => this.clearPermissions(),
    );
  }

  clearPermissions(): void {
    this.update((_draftState) => {
      return { ...defaultState };
    });
  }

  getActors(): (keyof PermissionControllerActors)[] {
    return Object.keys(this.state.actors);
  }

  getPermission(origin: string, target: string): Permission {
    return this.state.actors[origin]?.permissions[target];
  }

  getPermissions(origin: string): Record<MethodName, Permission> {
    return this.state.actors[origin]?.permissions;
  }

  hasPermission(origin: string, target: string): boolean {
    return Boolean(this.getPermission(origin, target));
  }

  hasPermissions(origin: string): boolean {
    return Boolean(this.state.actors[origin]);
  }

  setPermission(origin: string, permission: Permission): void {
    this.update((draftState) => {
      if (!draftState.actors[origin]) {
        draftState.actors[origin] = { origin, permissions: {} };
      }
      const { parentCapability: target } = permission;
      draftState.actors[origin].permissions[target] = permission as any;
    });
  }

  /**
   * Adds permissions to the given actor. Overwrites existing identical
   * permissions (same actor and method). Other existing permissions
   * remain unaffected.
   *
   * @param {string} origin - The origin of the grantee actor.
   * @param {Array} newPermissions - The unique, new permissions for the grantee actor.
   */
  setPermissions(
    origin: string,
    permissions: Record<MethodName, Permission>,
  ): void {
    this.update((draftState) => {
      if (!draftState.actors[origin]) {
        draftState.actors[origin] = { origin, permissions: {} };
      }
      Object.assign(draftState.actors[origin].permissions, permissions);
    });
  }

  revokePermission(origin: string, target: string): void {
    this.update((draftState) => {
      if (!draftState.actors[origin]) {
        throw new UnrecognizedActorError(origin);
      }

      const { permissions } = draftState.actors[origin];
      if (!permissions[target]) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      if (Object.keys(permissions).length > 1) {
        delete permissions[target];
      } else {
        delete draftState.actors[origin];
      }
    });
  }

  revokeAllPermissions(origin: string): void {
    this.update((draftState) => {
      if (!draftState.actors[origin]) {
        throw new UnrecognizedActorError(origin);
      }
      delete draftState.actors[origin];
    });
  }

  getCaveat(
    origin: string,
    target: string,
    caveatType: string,
  ): Caveat<Json> | undefined {
    return this.getPermission(origin, target)?.caveats?.find(
      (caveat) => caveat.type === caveatType,
    );
  }

  hasCaveat(origin: string, target: string, caveatType: string): boolean {
    return (
      this.getPermission(origin, target)?.caveats?.some(
        (caveat) => caveat.type === caveatType,
      ) ?? false
    );
  }

  setCaveat(origin: string, target: string, caveat: Caveat<Json>): void {
    this.update((draftState) => {
      const permission = draftState.actors[origin]?.permissions[target];
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      if (permission.caveats) {
        const existingIndex = permission.caveats.findIndex(
          (existingCaveat) => existingCaveat.type === caveat.type,
        );

        if (existingIndex === -1) {
          permission.caveats.push(caveat as any);
        } else {
          permission.caveats.splice(existingIndex, 1, caveat as any);
        }
      } else {
        permission.caveats = [caveat as any];
      }
    });
  }

  removeCaveat(origin: string, target: string, caveatType: string): void {
    this.update((draftState) => {
      const permission = draftState.actors[origin]?.permissions[target];
      if (!permission) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      if (!permission.caveats) {
        throw new PermissionHasNoCaveatsError(origin, target);
      }

      const existingIndex = permission.caveats.findIndex(
        (existingCaveat) => existingCaveat.type === caveatType,
      );
      if (existingIndex === -1) {
        throw new CaveatDoesNotExistError(origin, target, caveatType);
      }

      if (permission.caveats.length > 1) {
        permission.caveats.splice(existingIndex, 1);
      } else {
        permission.caveats = null;
      }
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
  getMethodKeyFor(method: string): string {
    if (this.restrictedMethods.has(method)) {
      return method;
    }

    const wildCardMethodsWithoutWildCard: Record<string, boolean> = {};
    for (const methodName of this.restrictedMethods.keys()) {
      const wildCardMatch = methodName.match(/(.+)\*$/u);
      if (wildCardMatch) {
        wildCardMethodsWithoutWildCard[wildCardMatch[1]] = true;
      }
    }

    // Check for potentially nested namespaces:
    // Ex: wildzone_
    // Ex: eth_plugin_
    const segments = method.split('_');
    let methodKey = '';

    while (
      segments.length > 0 &&
      !this.restrictedMethods.has(methodKey) &&
      !wildCardMethodsWithoutWildCard[methodKey]
    ) {
      methodKey += `${segments.shift()}_`;
    }

    if (this.restrictedMethods.has(methodKey)) {
      return methodKey;
    } else if (wildCardMethodsWithoutWildCard[methodKey]) {
      return `${methodKey}*`;
    }

    return '';
  }

  grantPermissions(
    actor: ActorMetadata,
    requestedPermissions: RequestedPermissions,
  ): Record<MethodName, Permission> {
    const { origin } = actor;
    if (!origin || typeof origin !== 'string') {
      throw new InvalidActorIdentifierError(origin);
    }

    // Enforce actual approving known methods:
    for (const methodName in requestedPermissions) {
      if (!this.getMethodKeyFor(methodName)) {
        throw methodNotFound({ methodName });
      }
    }

    const permissions: { [methodName: string]: Permission } = {};

    for (const method of Object.keys(requestedPermissions)) {
      if (!this.restrictedMethods.has(this.getMethodKeyFor(method))) {
        throw new PermissionTargetDoesNotExistError(origin, method);
      }

      permissions[method] = new Permission({
        target: method,
        invoker: origin,
        caveats: this.computeCaveats(
          origin,
          method,
          requestedPermissions[method].caveats,
        ),
      });
    }

    this.setPermissions(origin, permissions);
    return permissions;
  }

  /**
   * @param caveats The caveats to validate.
   * @returns Whether the given caveats are valid.
   */
  computeCaveats(
    origin: string,
    target: string,
    caveats?: Caveat<Json>[],
  ): Caveat<Json>[] | undefined {
    const caveatArray = caveats?.map((caveat) => {
      if (!this.caveatTypes.has(caveat.type)) {
        throw new CaveatTypeDoesNotExistError(caveat.type, origin, target);
      }

      if (!('value' in caveat)) {
        throw new CaveatMissingValueError(caveat, origin, target);
      }

      if (Object.keys(caveat).length !== 2) {
        throw new InvalidCaveatFieldsError(caveat, origin, target);
      }

      if (!isValidJson(caveat)) {
        throw new InvalidCaveatJsonError(caveat, origin, target);
      }
      return new Caveat({ type: caveat.type, value: caveat.value });
    });
    return caveatArray && caveatArray.length > 0 ? caveatArray : undefined;
  }
}

function isValidJson(value: unknown): boolean {
  try {
    return deepEqual(value, JSON.parse(JSON.stringify(value)));
  } catch (error) {
    return false;
  }
}

function getCaveatTypes(caveatSpecifications: CaveatSpecifications) {
  return new Set(
    Object.values(caveatSpecifications).map(
      (specification) => specification.type,
    ),
  );
}

function getInternalMethodNames(methodPrefix: string) {
  return new Set([
    `${methodPrefix}getPermissions`,
    `${methodPrefix}requestPermissions`,
  ]);
}

function getRestrictedMethodMap(
  restrictedMethods: RestrictedMethodsOption,
): ReadonlyMap<string, RestrictedMethodImplementation<unknown, unknown>> {
  return Object.entries(restrictedMethods).reduce(
    (methodMap, [methodName, implementation]) => {
      if (!methodName || typeof methodName !== 'string') {
        throw new Error(`Invalid method name: ${methodName}`);
      }

      methodMap.set(methodName, implementation);
      return methodMap;
    },
    new Map(),
  );
}

// TODO: Are we using these?

export interface AccountsChangedPayload
  extends PermissionChangedPayload<'eth_accounts'> {
  accounts: string[];
}

export interface AccountsChangedEvent
  extends PermissionChangedEvent<'eth_accounts'> {
  type: `${typeof controllerName}:permissionChanged:eth_accounts`;
  payload: [AccountsChangedPayload];
}

export interface PermissionsRequestMetadata extends ActorMetadata {
  id: string;
}

/**
 * Used for prompting the user about a proposed new permission.
 * Includes information about the actor granted, as well as the permissions
 * assigned.
 */
export interface PermissionsRequest {
  stateMetadata: PermissionsRequestMetadata;
  permissions: RequestedPermissions;
}

export type UserApprovalPrompt = (
  permissionsRequest: PermissionsRequest,
) => Promise<RequestedPermissions>;
