import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import { OriginString, PermissionsDomainEntry } from './Permission';

const name = 'PermissionsController';

export type PermissionsControllerDomains = Record<
  OriginString,
  PermissionsDomainEntry
>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PermissionsControllerState = {
  domains: PermissionsControllerDomains;
};

const metadata = {
  domains: { persist: true, anonymous: true },
};

const defaultState: PermissionsControllerState = {
  domains: {},
};

export interface GetDomains {
  type: `${typeof name}:getDomains`;
  handler: () => (keyof PermissionsControllerDomains)[];
}

export interface AccountsChanged {
  type: `${typeof name}:accountsChanged`;
  payload: [{ domain: OriginString; accounts: string[] }];
}

interface PermissionsControllerOptions {
  messenger: RestrictedControllerMessenger<
    typeof name,
    GetDomains,
    AccountsChanged,
    never,
    never
  >;
  state: Partial<PermissionsControllerState>;
  safeMethods: string[];
}

// TODO: Use this error message.
// 'Unauthorized to perform action. Try requesting the required permission(s) first. For more information, see: https://docs.metamask.io/guide/rpc-api.html#permissions'

export class PermissionsController extends BaseController<
  typeof name,
  PermissionsControllerState
> {
  private safeMethods: Set<string>;

  constructor({
    messenger,
    state = {},
    safeMethods,
  }: PermissionsControllerOptions) {
    super({
      name,
      metadata,
      messenger,
      state: { ...defaultState, ...state },
    });

    this.safeMethods = new Set(safeMethods);
  }
}
