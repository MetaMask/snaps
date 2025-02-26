import type { CancelBackgroundEventMethodHooks } from './cancelBackgroundEvent';
import type { ClearStateHooks } from './clearState';
import type { CreateInterfaceMethodHooks } from './createInterface';
import type { ProviderRequestMethodHooks } from './experimentalProviderRequest';
import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetBackgroundEventsMethodHooks } from './getBackgroundEvents';
import type { GetClientStatusHooks } from './getClientStatus';
import type { GetCurrencyRateMethodHooks } from './getCurrencyRate';
import type { GetInterfaceStateMethodHooks } from './getInterfaceState';
import type { GetSnapsHooks } from './getSnaps';
import type { GetStateHooks } from './getState';
import type { ListEntropySourcesHooks } from './listEntropySources';
import type { RequestSnapsHooks } from './requestSnaps';
import type { ResolveInterfaceMethodHooks } from './resolveInterface';
import type { ScheduleBackgroundEventMethodHooks } from './scheduleBackgroundEvent';
import type { SetStateHooks } from './setState';
import type { UpdateInterfaceMethodHooks } from './updateInterface';

export type PermittedRpcMethodHooks = ClearStateHooks &
  GetAllSnapsHooks &
  GetClientStatusHooks &
  GetSnapsHooks &
  GetStateHooks &
  ListEntropySourcesHooks &
  RequestSnapsHooks &
  CreateInterfaceMethodHooks &
  UpdateInterfaceMethodHooks &
  GetInterfaceStateMethodHooks &
  ResolveInterfaceMethodHooks &
  GetCurrencyRateMethodHooks &
  ProviderRequestMethodHooks &
  ScheduleBackgroundEventMethodHooks &
  CancelBackgroundEventMethodHooks &
  GetBackgroundEventsMethodHooks &
  SetStateHooks;

export * from './handlers';
export * from './middleware';
