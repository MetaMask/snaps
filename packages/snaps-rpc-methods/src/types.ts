import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type {
  ComponentOrElement,
  ContentType,
  InterfaceContext,
  InterfaceState,
  SnapId,
} from '@metamask/snaps-sdk';
import type { Snap, SnapRpcHookArgs } from '@metamask/snaps-utils';
import type {
  Json,
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

// The types below are temporarily copied to this repo until we can migrate away from `PermittedHandlerExport`.

/**
 * A middleware function for handling a permitted method.
 */
type HandlerMiddlewareFunction<
  Hooks,
  Params extends JsonRpcParams,
  Result extends Json,
> = (
  req: JsonRpcRequest<Params>,
  res: PendingJsonRpcResponse<Result>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: Hooks,
) => void | Promise<void>;

/**
 * We use a mapped object type in order to create a type that requires the
 * presence of the names of all hooks for the given handler.
 * This can then be used to select only the necessary hooks whenever a method
 * is called for purposes of POLA.
 */
type HookNames<HookMap> = {
  [Property in keyof HookMap]: true;
};

/**
 * A handler for a permitted method.
 */
export type PermittedHandlerExport<
  Hooks,
  Params extends JsonRpcParams,
  Result extends Json,
> = {
  implementation: HandlerMiddlewareFunction<Hooks, Params, Result>;
  hookNames: HookNames<Hooks>;
  methodNames: string[];
};

export type HdKeyring = {
  type: 'hd';
  seed?: Uint8Array;
  mnemonic?: Uint8Array;
};

export type KeyringControllerWithKeyringAction = {
  type: 'KeyringController:withKeyring';
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
  ) => Promise<string>;
};

export type SnapInterfaceControllerGetInterfaceAction = {
  type: 'SnapInterfaceController:getInterface';
  handler: (
    snapId: string,
    id: string,
  ) => { content: ComponentOrElement; snapId: SnapId; state: InterfaceState };
};

export type SnapInterfaceControllerSetInterfaceDisplayedAction = {
  type: 'SnapInterfaceController:setInterfaceDisplayed';
  handler: (snapId: string, id: string) => void;
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
  ) => Promise<Record<string, Json>>;
};

export type SnapControllerUpdateSnapStateAction = {
  type: 'SnapController:updateSnapState';
  handler: (
    snapId: string,
    newState: Record<string, Json>,
    encrypted: boolean,
  ) => Promise<void>;
};

export type RateLimitControllerCallAction = {
  type: 'RateLimitController:call';
  handler: (
    origin: string,
    type: string,
    ...args: unknown[]
  ) => Promise<unknown>;
};
