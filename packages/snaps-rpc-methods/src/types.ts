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
} from '@metamask/snaps-sdk';
import type {
  Snap,
  SnapRpcHookArgs,
  TruncatedSnap,
} from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';

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

export type SnapControllerGetAction = {
  type: `SnapController:getSnap`;
  handler: (snapId: string) => Snap | undefined;
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

export type SnapControllerHandleRequestAction = {
  type: `SnapController:handleRequest`;
  handler: (args: SnapRpcHookArgs & { snapId: string }) => Promise<unknown>;
};

export type SnapControllerGetSnapStateAction = {
  type: `SnapController:getSnapState`;
  handler: (
    snapId: string,
    encrypted: boolean,
  ) => Promise<Record<string, Json> | null>;
};

export type SnapControllerUpdateSnapStateAction = {
  type: `SnapController:updateSnapState`;
  handler: (
    snapId: string,
    newSnapState: Record<string, Json>,
    encrypted: boolean,
  ) => Promise<void>;
};

export type SnapControllerClearSnapStateAction = {
  type: `SnapController:clearSnapState`;
  handler: (snapId: string, encrypted: boolean) => void;
};

export type SnapControllerGetSnapFileAction = {
  type: `SnapController:getSnapFile`;
  handler: (
    snapId: string,
    path: string,
    encoding?: AuxiliaryFileEncoding,
  ) => Promise<string | null>;
};

export type SnapInterfaceControllerCreateInterfaceAction = {
  type: `SnapInterfaceController:createInterface`;
  handler: (
    snapId: string,
    content: ComponentOrElement,
    context?: InterfaceContext,
    contentType?: ContentType,
  ) => string;
};

export type SnapInterfaceControllerGetInterfaceAction = {
  type: `SnapInterfaceController:getInterface`;
  handler: (
    snapId: string,
    id: string,
  ) => {
    snapId: string;
    content: unknown;
    state: InterfaceState;
    context: InterfaceContext | null;
    contentType: ContentType | null;
    displayed: boolean;
  };
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
