import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import { ethErrors } from 'eth-rpc-errors';
import {
  CaveatFunctionGenerator,
  caveatFunctionGenerators,
} from './caveat-functions';
import {
  OriginString,
  Permission,
  MethodName,
  RequestedPermissions,
} from './Permission';
import { methodNotFound } from './errors';
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

interface PermissionsControllerOptions {
  messenger: RestrictedControllerMessenger<
    typeof controllerName,
    GetDomains,
    AccountsChanged,
    never,
    never
  >;
  state?: Partial<PermissionsControllerState>;
  restrictedMethods: string[];
  safeMethods: string[];
  methodPrefix: string;
}

export class PermissionsController extends BaseController<
  typeof controllerName,
  PermissionsControllerState
> {
  public readonly methodPrefix: string;

  /**
   * Can be namespaced.
   */
  private readonly restrictedMethods: Readonly<Set<string>>;

  private readonly safeMethods: Readonly<Set<string>>;

  private readonly internalMethods: Readonly<Set<string>>;

  private readonly caveatFunctionGenerators: Readonly<
    Record<string, CaveatFunctionGenerator<any, any, any>>
  > = {
    ...caveatFunctionGenerators,
  };

  constructor({
    messenger,
    state = {},
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

    this.methodPrefix = methodPrefix;
    this.internalMethods = getInternalMethodNames(methodPrefix);
    this.restrictedMethods = new Set(restrictedMethods);
    this.safeMethods = new Set(safeMethods);
  }

  /**
   * Adds permissions to the given domain. Overwrites existing identical
   * permissions (same domain, and method). Other existing permissions
   * remain unaffected.
   *
   * @param {string} domainName - The grantee domain.
   * @param {Array} newPermissions - The unique, new permissions for the grantee domain.
   */
  updatePermissions(
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

  grantPermissions(
    domain: DomainMetadata,
    requestedPermissions: RequestedPermissions,
  ): Record<MethodName, Permission> {
    const { origin } = domain;
    if (!origin || typeof origin !== 'string') {
      throw ethErrors.rpc.invalidRequest(`Invalid domain: '${domain}'.`);
    }

    // Enforce actual approving known methods:
    for (const methodName in requestedPermissions) {
      if (!this.getMethodKeyFor(methodName)) {
        throw methodNotFound({ methodName });
      }
    }

    const permissions: { [methodName: string]: Permission } = {};

    for (const method of Object.keys(requestedPermissions)) {
      const newPerm = new Permission({
        target: method,
        invoker: origin,
        caveats: requestedPermissions[method].caveats,
      });

      if (newPerm.caveats && !this.validateCaveats(newPerm.caveats)) {
        throw ethErrors.rpc.internal({
          message: 'Invalid caveats.',
          data: newPerm,
        });
      }

      permissions[method] = newPerm;
    }

    this.updatePermissions(origin, permissions);
    return permissions;
  }

  /**
   * TODO: Implement.
   *
   * @param caveats The caveats to validate.
   * @returns Whether the given caveats are valid.
   */
  validateCaveats(_caveats: Caveat<any>[]): boolean {
    return true;
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
    for (const methodName of this.restrictedMethods) {
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
}

function getInternalMethodNames(methodPrefix: string) {
  return new Set([
    `${methodPrefix}getPermissions`,
    `${methodPrefix}requestPermissions`,
  ]);
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
