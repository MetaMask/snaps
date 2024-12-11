import type { CancelBackgroundEventMethodHooks } from './cancelBackgroundEvent';
import type { CreateInterfaceMethodHooks } from './createInterface';
import type { ProviderRequestMethodHooks } from './experimentalProviderRequest';
import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetBackgroundEventsMethodHooks } from './getBackgroundEvents';
import type { GetClientStatusHooks } from './getClientStatus';
import type { GetCurrencyRateMethodHooks } from './getCurrencyRate';
import type { GetInterfaceStateMethodHooks } from './getInterfaceState';
import type { GetSnapsHooks } from './getSnaps';
import type { RequestSnapsHooks } from './requestSnaps';
import type { ResolveInterfaceMethodHooks } from './resolveInterface';
import type { ScheduleBackgroundEventMethodHooks } from './scheduleBackgroundEvent';
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
  ScheduleBackgroundEventMethodHooks &
  CancelBackgroundEventMethodHooks &
  GetBackgroundEventsMethodHooks;

export * from './handlers';
export * from './middleware';
