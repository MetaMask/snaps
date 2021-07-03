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
  UnrecognizedDomainError,
  PermissionHasNoCaveatsError,
  CaveatDoesNotExistError,
  CaveatTypeDoesNotExistError,
  InvalidCaveatJsonError,
  PermissionTargetDoesNotExistError,
  CaveatMissingValueError,
  InvalidCaveatFieldsError,
  InvalidDomainIdentifierError,
} from './errors';
import { Caveat } from './Caveat';

export interface DomainMetadata {
  origin: OriginString;
}

const controllerName = 'PermissionsController';

export interface PermissionsDomainEntry extends DomainMetadata {
  permissions: Record<MethodName, Permission>;
}

export type PermissionsControllerDomains = Record<
  OriginString,
  PermissionsDomainEntry
>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PermissionsControllerState = {
  domains: PermissionsControllerDomains;
};

const stateMetadata = {
  domains: { persist: true, anonymous: true },
};

const defaultState: PermissionsControllerState = {
  domains: {},
};

export interface GetDomains {
  type: `${typeof controllerName}:getDomains`;
  handler: () => (keyof PermissionsControllerDomains)[];
}

export interface AccountsChanged {
  type: `${typeof controllerName}:accountsChanged`;
  payload: [{ domain: OriginString; accounts: string[] }];
}

export interface PermittedJsonRpcMiddleware<Params, Result>
  extends JsonRpcMiddleware<Params, Result> {
  (
    req: JsonRpcRequest<Params>,
    res: PendingJsonRpcResponse<Result>,
    next: JsonRpcEngineNextCallback,
    end: JsonRpcEngineEndCallback,
    context?: Readonly<
      {
        origin: OriginString;
      } & Record<string, unknown>
    >,
  ): void;
}

type RestrictedMethodsOption = Record<
  MethodName,
  PermittedJsonRpcMiddleware<unknown, unknown>
>;

interface PermissionsControllerOptions {
  messenger: RestrictedControllerMessenger<
    typeof controllerName,
    GetDomains,
    AccountsChanged,
    never,
    never
  >;
  state?: Partial<PermissionsControllerState>;
  caveatSpecifications: CaveatSpecifications;
  methodPrefix: string;
  restrictedMethods: RestrictedMethodsOption;
  safeMethods: string[];
}

export class PermissionsController extends BaseController<
  typeof controllerName,
  PermissionsControllerState
> {
  public readonly methodPrefix: string;

  /**
   * Can be namespaced.
   */
  private readonly restrictedMethods: Readonly<
    Map<string, PermittedJsonRpcMiddleware<unknown, unknown>>
  >;

  private readonly _safeMethods: Readonly<Set<string>>;

  public get safeMethods(): Readonly<Set<string>> {
    return this._safeMethods;
  }

  private readonly _internalMethods: Readonly<Set<string>>;

  public get internalMethods(): Readonly<Set<string>> {
    return this._internalMethods;
  }

  private readonly _caveatSpecifications: Readonly<CaveatSpecifications>;

  public get caveatSpecifications(): Readonly<CaveatSpecifications> {
    return this._caveatSpecifications;
  }

  private readonly caveatTypes: Readonly<Set<string>>;

  constructor({
    messenger,
    state = {},
    caveatSpecifications,
    methodPrefix,
    restrictedMethods,
    safeMethods,
  }: PermissionsControllerOptions) {
    super({
      name: controllerName,
      metadata: stateMetadata,
      messenger,
      state: { ...defaultState, ...state },
    });

    this._caveatSpecifications = caveatSpecifications;
    this.caveatTypes = getCaveatTypes(caveatSpecifications);
    this.methodPrefix = methodPrefix;
    this._internalMethods = getInternalMethodNames(methodPrefix);
    this.restrictedMethods = getRestrictedMethodMap(restrictedMethods);
    this._safeMethods = new Set(safeMethods);
  }

  clearPermissions(): void {
    this.update((_draftState) => {
      return { ...defaultState };
    });
  }

  getDomains(): (keyof PermissionsControllerDomains)[] {
    return Object.keys(this.state.domains);
  }

  getPermission(origin: string, target: string): Permission {
    return this.state.domains[origin]?.permissions[target];
  }

  getPermissions(origin: string): Record<MethodName, Permission> {
    return this.state.domains[origin]?.permissions;
  }

  hasPermission(origin: string, target: string): boolean {
    return Boolean(this.getPermission(origin, target));
  }

  hasPermissions(origin: string): boolean {
    return Boolean(this.state.domains[origin]);
  }

  setPermission(origin: string, permission: Permission): void {
    this.update((draftState) => {
      if (!draftState.domains[origin]) {
        draftState.domains[origin] = { origin, permissions: {} };
      }
      const { parentCapability: target } = permission;
      draftState.domains[origin].permissions[target] = permission as any;
    });
  }

  /**
   * Adds permissions to the given domain. Overwrites existing identical
   * permissions (same domain, and method). Other existing permissions
   * remain unaffected.
   *
   * @param {string} domainName - The grantee domain.
   * @param {Array} newPermissions - The unique, new permissions for the grantee domain.
   */
  setPermissions(
    origin: string,
    permissions: Record<MethodName, Permission>,
  ): void {
    this.update((draftState) => {
      if (!draftState.domains[origin]) {
        draftState.domains[origin] = { origin, permissions: {} };
      }
      Object.assign(draftState.domains[origin].permissions, permissions);
    });
  }

  revokePermission(origin: string, target: string): void {
    this.update((draftState) => {
      if (!draftState.domains[origin]) {
        throw new UnrecognizedDomainError(origin);
      }

      const { permissions } = draftState.domains[origin];
      if (!permissions[target]) {
        throw new PermissionDoesNotExistError(origin, target);
      }

      if (Object.keys(permissions).length > 1) {
        delete permissions[target];
      } else {
        delete draftState.domains[origin];
      }
    });
  }

  revokeAllPermissions(origin: string): void {
    this.update((draftState) => {
      if (!draftState.domains[origin]) {
        throw new UnrecognizedDomainError(origin);
      }
      delete draftState.domains[origin];
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
      const permission = draftState.domains[origin]?.permissions[target];
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
      const permission = draftState.domains[origin]?.permissions[target];
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
    domain: DomainMetadata,
    requestedPermissions: RequestedPermissions,
  ): Record<MethodName, Permission> {
    const { origin } = domain;
    if (!origin || typeof origin !== 'string') {
      throw new InvalidDomainIdentifierError(origin);
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
): Map<string, PermittedJsonRpcMiddleware<unknown, unknown>> {
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

export interface PermissionsRequestMetadata extends DomainMetadata {
  id: string;
}

/**
 * Used for prompting the user about a proposed new permission.
 * Includes information about the domain granted, as well as the permissions
 * assigned.
 */
export interface PermissionsRequest {
  stateMetadata: PermissionsRequestMetadata;
  permissions: RequestedPermissions;
}

export type UserApprovalPrompt = (
  permissionsRequest: PermissionsRequest,
) => Promise<RequestedPermissions>;
