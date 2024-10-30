import type { CreateInterfaceMethodHooks } from './createInterface';
import type { ProviderRequestMethodHooks } from './experimentalProviderRequest';
import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetClientStatusHooks } from './getClientStatus';
import type { GetCurrencyRateMethodHooks } from './getCurrencyRate';
import type { GetInterfaceStateMethodHooks } from './getInterfaceState';
import type { GetSnapsHooks } from './getSnaps';
import type { ReadDeviceHooks } from './readDevice';
import type { RequestDeviceHooks } from './requestDevice';
import type { RequestSnapsHooks } from './requestSnaps';
import type { ResolveInterfaceMethodHooks } from './resolveInterface';
import type { UpdateInterfaceMethodHooks } from './updateInterface';
import type { WriteDeviceHooks } from './writeDevice';

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
  ReadDeviceHooks &
  RequestDeviceHooks &
  WriteDeviceHooks;

export * from './handlers';
export * from './middleware';
