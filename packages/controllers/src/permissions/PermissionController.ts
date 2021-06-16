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

export class PermissionsController extends BaseController<
  typeof name,
  PermissionsControllerState
> {
  private safeMethods: Set<string>;

  constructor({ messenger, state = {}, safeMethods }: PermissionsControllerOptions) {
    super({
      name,
      metadata,
      messenger,
      state: { ...defaultState, ...state },
    });

    this.safeMethods = new Set(safeMethods);
  }
}
