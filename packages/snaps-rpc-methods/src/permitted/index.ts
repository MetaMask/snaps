import type { CancelBackgroundEventMethodActions } from './cancelBackgroundEvent';
import type { ClearStateMethodActions } from './clearState';
import type { CloseWebSocketMethodActions } from './closeWebSocket';
import type { CreateInterfaceMethodActions } from './createInterface';
import type { EndTraceMethodActions, EndTraceMethodHooks } from './endTrace';
import type { GetAllSnapsMethodActions } from './getAllSnaps';
import type { GetBackgroundEventsMethodActions } from './getBackgroundEvents';
import type {
  GetClientStatusMethodActions,
  GetClientStatusMethodHooks,
} from './getClientStatus';
import type { GetFileMethodActions } from './getFile';
import type { GetInterfaceContextMethodActions } from './getInterfaceContext';
import type { GetInterfaceStateMethodActions } from './getInterfaceState';
import type { GetSnapsMethodActions } from './getSnaps';
import type { GetStateMethodActions, GetStateMethodHooks } from './getState';
import type { GetWebSocketsMethodActions } from './getWebSockets';
import type {
  InvokeKeyringMethodActions,
  InvokeKeyringMethodHooks,
} from './invokeKeyring';
import type { InvokeSnapSugarMethodActions } from './invokeSnapSugar';
import type {
  ListEntropySourcesMethodActions,
  ListEntropySourcesMethodHooks,
} from './listEntropySources';
import type {
  MessengerCallMethodActions,
  MessengerCallMethodHooks,
} from './messengerCall';
import type { OpenWebSocketMethodActions } from './openWebSocket';
import type { RequestSnapsMethodActions } from './requestSnaps';
import type { ResolveInterfaceMethodActions } from './resolveInterface';
import type { ScheduleBackgroundEventMethodActions } from './scheduleBackgroundEvent';
import type { SendWebSocketMessageMethodActions } from './sendWebSocketMessage';
import type { SetStateMethodActions, SetStateMethodHooks } from './setState';
import type {
  StartTraceMethodActions,
  StartTraceMethodHooks,
} from './startTrace';
import type {
  TrackErrorMethodActions,
  TrackErrorMethodHooks,
} from './trackError';
import type {
  TrackEventMethodActions,
  TrackEventMethodHooks,
} from './trackEvent';
import type { UpdateInterfaceMethodActions } from './updateInterface';

export type PermittedRpcMethodActions =
  | CancelBackgroundEventMethodActions
  | ClearStateMethodActions
  | CloseWebSocketMethodActions
  | CreateInterfaceMethodActions
  | EndTraceMethodActions
  | GetAllSnapsMethodActions
  | GetBackgroundEventsMethodActions
  | GetClientStatusMethodActions
  | GetFileMethodActions
  | GetInterfaceContextMethodActions
  | GetInterfaceStateMethodActions
  | GetSnapsMethodActions
  | GetStateMethodActions
  | GetWebSocketsMethodActions
  | InvokeKeyringMethodActions
  | InvokeSnapSugarMethodActions
  | ListEntropySourcesMethodActions
  | OpenWebSocketMethodActions
  | RequestSnapsMethodActions
  | ResolveInterfaceMethodActions
  | ScheduleBackgroundEventMethodActions
  | SendWebSocketMessageMethodActions
  | SetStateMethodActions
  | StartTraceMethodActions
  | TrackErrorMethodActions
  | TrackEventMethodActions
  | UpdateInterfaceMethodActions
  | MessengerCallMethodActions;

export type PermittedRpcMethodHooks = GetClientStatusMethodHooks &
  GetStateMethodHooks &
  ListEntropySourcesMethodHooks &
  SetStateMethodHooks &
  TrackEventMethodHooks &
  TrackErrorMethodHooks &
  StartTraceMethodHooks &
  EndTraceMethodHooks &
  InvokeKeyringMethodHooks &
  MessengerCallMethodHooks;

export * from './middleware';
