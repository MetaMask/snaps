import type {
  CancelBackgroundEventParams,
  CancelBackgroundEventResult,
} from './cancel-background-event';
import type { ClearStateParams, ClearStateResult } from './clear-state';
import type {
  CloseWebSocketParams,
  CloseWebSocketResult,
} from './close-web-socket';
import type {
  CreateInterfaceParams,
  CreateInterfaceResult,
} from './create-interface';
import type { DialogParams, DialogResult } from './dialog';
import type { EndTraceParams, EndTraceResult } from './end-trace';
import type {
  GetBackgroundEventsParams,
  GetBackgroundEventsResult,
} from './get-background-events';
import type {
  GetBip32EntropyParams,
  GetBip32EntropyResult,
} from './get-bip32-entropy';
import type {
  GetBip32PublicKeyParams,
  GetBip32PublicKeyResult,
} from './get-bip32-public-key';
import type {
  GetBip44EntropyParams,
  GetBip44EntropyResult,
} from './get-bip44-entropy';
import type {
  GetClientStatusParams,
  GetClientStatusResult,
} from './get-client-status';
import type {
  GetCurrencyRateParams,
  GetCurrencyRateResult,
} from './get-currency-rate';
import type { GetEntropyParams, GetEntropyResult } from './get-entropy';
import type { GetFileParams, GetFileResult } from './get-file';
import type {
  GetInterfaceContextParams,
  GetInterfaceContextResult,
} from './get-interface-context';
import type {
  GetInterfaceStateParams,
  GetInterfaceStateResult,
} from './get-interface-state';
import type { GetLocaleParams, GetLocaleResult } from './get-locale';
import type {
  GetPreferencesParams,
  GetPreferencesResult,
} from './get-preferences';
import type { GetSnapsParams, GetSnapsResult } from './get-snaps';
import type { GetStateParams, GetStateResult } from './get-state';
import type {
  GetWebSocketsParams,
  GetWebSocketsResult,
} from './get-web-sockets';
import type {
  InvokeKeyringParams,
  InvokeKeyringResult,
} from './invoke-keyring';
import type { InvokeSnapParams, InvokeSnapResult } from './invoke-snap';
import type {
  ListEntropySourcesParams,
  ListEntropySourcesResult,
} from './list-entropy-sources';
import type {
  ManageAccountsParams,
  ManageAccountsResult,
} from './manage-accounts';
import type { ManageStateParams, ManageStateResult } from './manage-state';
import type { NotifyParams, NotifyResult } from './notify';
import type {
  OpenWebSocketParams,
  OpenWebSocketResult,
} from './open-web-socket';
import type { RequestSnapsParams, RequestSnapsResult } from './request-snaps';
import type {
  ResolveInterfaceParams,
  ResolveInterfaceResult,
} from './resolve-interface';
import type {
  ScheduleBackgroundEventParams,
  ScheduleBackgroundEventResult,
} from './schedule-background-event';
import type {
  SendWebSocketMessageParams,
  SendWebSocketMessageResult,
} from './send-web-socket-message';
import type { SetStateParams, SetStateResult } from './set-state';
import type { StartTraceParams, StartTraceResult } from './start-trace';
import type { TrackErrorParams, TrackErrorResult } from './track-error';
import type { TrackEventParams, TrackEventResult } from './track-event';
import type {
  UpdateInterfaceParams,
  UpdateInterfaceResult,
} from './update-interface';
import type { Method } from '../../internals';

/**
 * The methods that are available to the Snap. Each method is a tuple of the
 * request parameters and the result returned by the method.
 */
export type SnapMethods = {
  /* eslint-disable @typescript-eslint/naming-convention */
  snap_clearState: [ClearStateParams, ClearStateResult];
  snap_dialog: [DialogParams, DialogResult];
  snap_endTrace: [EndTraceParams, EndTraceResult];
  snap_getBip32Entropy: [GetBip32EntropyParams, GetBip32EntropyResult];
  snap_getBip32PublicKey: [GetBip32PublicKeyParams, GetBip32PublicKeyResult];
  snap_getBip44Entropy: [GetBip44EntropyParams, GetBip44EntropyResult];
  snap_getClientStatus: [GetClientStatusParams, GetClientStatusResult];
  snap_getCurrencyRate: [GetCurrencyRateParams, GetCurrencyRateResult];
  snap_getEntropy: [GetEntropyParams, GetEntropyResult];
  snap_getFile: [GetFileParams, GetFileResult];
  snap_getLocale: [GetLocaleParams, GetLocaleResult];
  snap_getPreferences: [GetPreferencesParams, GetPreferencesResult];
  snap_getState: [GetStateParams, GetStateResult];
  snap_listEntropySources: [ListEntropySourcesParams, ListEntropySourcesResult];
  snap_manageAccounts: [ManageAccountsParams, ManageAccountsResult];
  snap_manageState: [ManageStateParams, ManageStateResult];
  snap_notify: [NotifyParams, NotifyResult];
  snap_scheduleBackgroundEvent: [
    ScheduleBackgroundEventParams,
    ScheduleBackgroundEventResult,
  ];
  snap_cancelBackgroundEvent: [
    CancelBackgroundEventParams,
    CancelBackgroundEventResult,
  ];
  snap_getBackgroundEvents: [
    GetBackgroundEventsParams,
    GetBackgroundEventsResult,
  ];
  snap_createInterface: [CreateInterfaceParams, CreateInterfaceResult];
  snap_updateInterface: [UpdateInterfaceParams, UpdateInterfaceResult];
  snap_getInterfaceState: [GetInterfaceStateParams, GetInterfaceStateResult];
  snap_getInterfaceContext: [
    GetInterfaceContextParams,
    GetInterfaceContextResult,
  ];
  snap_resolveInterface: [ResolveInterfaceParams, ResolveInterfaceResult];
  snap_setState: [SetStateParams, SetStateResult];
  snap_startTrace: [StartTraceParams, StartTraceResult];
  snap_trackEvent: [TrackEventParams, TrackEventResult];
  snap_trackError: [TrackErrorParams, TrackErrorResult];
  snap_openWebSocket: [OpenWebSocketParams, OpenWebSocketResult];
  snap_closeWebSocket: [CloseWebSocketParams, CloseWebSocketResult];
  snap_getWebSockets: [GetWebSocketsParams, GetWebSocketsResult];
  snap_sendWebSocketMessage: [
    SendWebSocketMessageParams,
    SendWebSocketMessageResult,
  ];
  wallet_getSnaps: [GetSnapsParams, GetSnapsResult];
  wallet_invokeKeyring: [InvokeKeyringParams, InvokeKeyringResult];
  wallet_invokeSnap: [InvokeSnapParams, InvokeSnapResult];
  wallet_snap: [InvokeSnapParams, InvokeSnapResult];
  wallet_requestSnaps: [RequestSnapsParams, RequestSnapsResult];
  /* eslint-enable @typescript-eslint/naming-convention */
};

/**
 * The request function that is available to the Snap. It takes a request
 * object and returns a promise that resolves to the result of the request.
 *
 * @param request - The request object.
 * @param request.method - The method to call.
 * @param request.params - The parameters to pass to the method. This is
 * inferred from the method, based on the {@link SnapMethods} type, and may be
 * optional.
 * @returns A promise that resolves to the result of the request. This is
 * inferred from the request method, based on the {@link SnapMethods} type.
 * @example
 * // Get the user's locale
 * const result = await request({
 *   method: 'snap_getLocale',
 * });
 * @example
 * // Get a file
 * const result = await request({
 *   method: 'snap_getFile',
 *   params: {
 *     path: 'foo/bar.txt',
 *   },
 * });
 */
export type RequestFunction = <MethodName extends keyof SnapMethods>(
  request: Method<MethodName, SnapMethods[MethodName][0]>,
) => Promise<SnapMethods[MethodName][1]>;
