import type { EndTraceMethodHooks } from './endTrace';
import type { GetClientStatusMethodHooks } from './getClientStatus';
import type { GetStateMethodHooks } from './getState';
import type { InvokeKeyringMethodHooks } from './invokeKeyring';
import type { ListEntropySourcesMethodHooks } from './listEntropySources';
import type { SetStateMethodHooks } from './setState';
import type { StartTraceMethodHooks } from './startTrace';
import type { TrackErrorMethodHooks } from './trackError';
import type { TrackEventMethodHooks } from './trackEvent';

export type PermittedRpcMethodHooks = GetClientStatusMethodHooks &
  GetStateMethodHooks &
  ListEntropySourcesMethodHooks &
  SetStateMethodHooks &
  TrackEventMethodHooks &
  TrackErrorMethodHooks &
  StartTraceMethodHooks &
  EndTraceMethodHooks &
  InvokeKeyringMethodHooks;

export * from './handlers';
export * from './middleware';
