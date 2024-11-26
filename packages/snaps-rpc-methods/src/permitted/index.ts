import type { CreateInterfaceMethodHooks } from './createInterface';
import type { ProviderRequestMethodHooks } from './experimentalProviderRequest';
import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetClientStatusHooks } from './getClientStatus';
import type { GetCurrencyRateMethodHooks } from './getCurrencyRate';
import type { GetInterfaceStateMethodHooks } from './getInterfaceState';
import type { GetSnapsHooks } from './getSnaps';
import type { ManageAccountsMethodHooks } from './manageAccounts';
import type { RequestSnapsHooks } from './requestSnaps';
import type { ResolveInterfaceMethodHooks } from './resolveInterface';
import type { UpdateInterfaceMethodHooks } from './updateInterface';

export type PermittedRpcMethodHooks = GetAllSnapsHooks &
  GetClientStatusHooks &
  GetSnapsHooks &
  RequestSnapsHooks &
  CreateInterfaceMethodHooks &
  UpdateInterfaceMethodHooks &
  GetInterfaceStateMethodHooks &
  ResolveInterfaceMethodHooks &
  GetCurrencyRateMethodHooks &
  ProviderRequestMethodHooks &
  ManageAccountsMethodHooks;

export * from './handlers';
export * from './middleware';
