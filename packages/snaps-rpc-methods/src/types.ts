import type {
  AuxiliaryFileEncoding,
  BackgroundEvent,
  ComponentOrElement,
  GetSnapsResult,
  GetWebSocketsResult,
  InterfaceContext,
  InterfaceState,
  RequestSnapsResult,
  ContentType,
  RequestSnapsParams,
  SnapId,
} from '@metamask/snaps-sdk';
import type {
  Snap,
  SnapRpcHookArgs,
  TruncatedSnap,
} from '@metamask/snaps-utils';
import type { Json, JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

export type JsonRpcRequestWithOrigin<
  Params extends JsonRpcParams = JsonRpcParams,
> = JsonRpcRequest<Params> & { origin: string };

export type HdKeyring = {
  type: 'HD Key Tree';
  seed?: Uint8Array;
  mnemonic?: Uint8Array;
};

export type KeyringControllerWithKeyringV2Action = {
  type: 'KeyringController:withKeyringV2';
  handler: (
    selector:
      | {
          type: string;
          index?: number;
        }
      | { id: string },
    operation: (args: { keyring: HdKeyring }) => Promise<unknown>,
  ) => Promise<unknown>;
};

export type KeyringControllerGetStateAction = {
  type: `KeyringController:getState`;
  handler: () => {
    isUnlocked: boolean;
    keyrings: {
      type: string;
      metadata: { id: string; name: string };
    }[];
  };
};

export type ApprovalControllerAddRequestAction = {
  type: 'ApprovalController:addRequest';
  handler: (
    opts: {
      id?: string;
      origin: string;
      type: string;
      requestData?: Record<string, unknown>;
      requestState?: Record<string, Json>;
    },
    shouldShowRequest: boolean,
  ) => Promise<Json>;
};

export type SnapInterfaceControllerCreateInterfaceAction = {
  type: 'SnapInterfaceController:createInterface';
  handler: (
    snapId: string,
    content: ComponentOrElement,
    context?: InterfaceContext,
    contentType?: ContentType,
  ) => string;
};

export type SnapInterfaceControllerGetInterfaceAction = {
  type: 'SnapInterfaceController:getInterface';
  handler: (
    snapId: string,
    id: string,
  ) => {
    content: ComponentOrElement;
    snapId: SnapId;
    state: InterfaceState;
    context: InterfaceContext | null;
  };
};

export type SnapInterfaceControllerSetInterfaceDisplayedAction = {
  type: 'SnapInterfaceController:setInterfaceDisplayed';
  handler: (snapId: string, id: string) => void;
};

export type SnapInterfaceControllerGetInterfaceStateAction = {
  type: `SnapInterfaceController:getInterfaceState`;
  handler: (snapId: string, id: string) => InterfaceState;
};

export type SnapInterfaceControllerUpdateInterfaceAction = {
  type: `SnapInterfaceController:updateInterface`;
  handler: (
    snapId: string,
    id: string,
    content: ComponentOrElement,
    context?: InterfaceContext,
  ) => void;
};

export type SnapInterfaceControllerResolveInterfaceAction = {
  type: `SnapInterfaceController:resolveInterface`;
  handler: (snapId: string, id: string, value: Json) => Promise<void>;
};

export type SnapControllerHandleRequestAction = {
  type: 'SnapController:handleRequest';
  handler: (args: SnapRpcHookArgs & { snapId: string }) => Promise<unknown>;
};

export type SnapControllerGetSnapAction = {
  type: 'SnapController:getSnap';
  handler: (snapId: string) => Snap | null;
};

export type SnapControllerClearSnapStateAction = {
  type: 'SnapController:clearSnapState';
  handler: (snapId: string, encrypted: boolean) => void;
};

export type SnapControllerGetSnapStateAction = {
  type: 'SnapController:getSnapState';
  handler: (
    snapId: string,
    encrypted: boolean,
  ) => Promise<Record<string, Json> | null>;
};

export type SnapControllerUpdateSnapStateAction = {
  type: 'SnapController:updateSnapState';
  handler: (
    snapId: string,
    newState: Record<string, Json>,
    encrypted: boolean,
  ) => Promise<void>;
};

export type SnapControllerGetAllSnapsAction = {
  type: `SnapController:getAllSnaps`;
  handler: () => TruncatedSnap[];
};

export type SnapControllerGetPermittedSnapsAction = {
  type: `SnapController:getPermittedSnaps`;
  handler: (origin: string) => GetSnapsResult;
};

export type SnapControllerInstallSnapsAction = {
  type: `SnapController:installSnaps`;
  handler: (
    origin: string,
    requestedSnaps: RequestSnapsParams,
  ) => Promise<RequestSnapsResult>;
};

export type SnapControllerGetSnapFileAction = {
  type: `SnapController:getSnapFile`;
  handler: (
    snapId: string,
    path: string,
    encoding?: AuxiliaryFileEncoding,
  ) => Promise<string | null>;
};

export type RateLimitControllerCallAction = {
  type: 'RateLimitController:call';
  handler: (
    origin: string,
    type: string,
    ...args: unknown[]
  ) => Promise<unknown>;
};

export type CronjobControllerCancelAction = {
  type: `CronjobController:cancel`;
  handler: (origin: string, id: string) => void;
};

export type CronjobControllerScheduleAction = {
  type: `CronjobController:schedule`;
  handler: (event: {
    snapId: string;
    request: {
      method: string;
      jsonrpc?: '2.0';
      id?: string | number | null;
      params?: Json[] | Record<string, Json>;
    };
    schedule: string;
    id?: string;
  }) => string;
};

export type CronjobControllerGetAction = {
  type: `CronjobController:get`;
  handler: (snapId: string) => BackgroundEvent[];
};

export type WebSocketServiceOpenAction = {
  type: `WebSocketService:open`;
  handler: (
    snapId: string,
    url: string,
    protocols?: string[],
  ) => Promise<string>;
};

export type WebSocketServiceCloseAction = {
  type: `WebSocketService:close`;
  handler: (snapId: string, id: string) => void;
};

export type WebSocketServiceSendMessageAction = {
  type: `WebSocketService:sendMessage`;
  handler: (
    snapId: string,
    id: string,
    data: string | number[],
  ) => Promise<void>;
};

export type WebSocketServiceGetAllAction = {
  type: `WebSocketService:getAll`;
  handler: (snapId: string) => GetWebSocketsResult;
};
