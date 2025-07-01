import type { CancelBackgroundEventMethodHooks } from './cancelBackgroundEvent';
import type { ClearStateHooks } from './clearState';
import type { CloseWebSocketMethodHooks } from './closeWebSocket';
import type { CreateInterfaceMethodHooks } from './createInterface';
import type { EndTraceMethodHooks } from './endTrace';
import type { ProviderRequestMethodHooks } from './experimentalProviderRequest';
import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetBackgroundEventsMethodHooks } from './getBackgroundEvents';
import type { GetClientStatusHooks } from './getClientStatus';
import type { GetCurrencyRateMethodHooks } from './getCurrencyRate';
import type { GetInterfaceStateMethodHooks } from './getInterfaceState';
import type { GetSnapsHooks } from './getSnaps';
import type { GetStateHooks } from './getState';
import type { GetWebSocketsMethodHooks } from './getWebSockets';
import type { ListEntropySourcesHooks } from './listEntropySources';
import type { OpenWebSocketMethodHooks } from './openWebSocket';
import type { RequestSnapsHooks } from './requestSnaps';
import type { ResolveInterfaceMethodHooks } from './resolveInterface';
import type { ScheduleBackgroundEventMethodHooks } from './scheduleBackgroundEvent';
import type { SendWebSocketMessageMethodHooks } from './sendWebSocketMessage';
import type { SetStateHooks } from './setState';
import type { StartTraceMethodHooks } from './startTrace';
import type { TrackErrorMethodHooks } from './trackError';
import type { TrackEventMethodHooks } from './trackEvent';
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
  SetStateHooks &
  OpenWebSocketMethodHooks &
  CloseWebSocketMethodHooks &
  SendWebSocketMessageMethodHooks &
  GetWebSocketsMethodHooks &
  TrackEventMethodHooks &
  TrackErrorMethodHooks &
  StartTraceMethodHooks &
  EndTraceMethodHooks;

export * from './handlers';
export * from './middleware';
