import {
  JsonRpcRequest,
  JsonRpcEngineNextCallback,
  JsonRpcEngineEndCallback,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';

export type HandlerMiddlewareFunction<T, U, V> = (
  req: JsonRpcRequest<U>,
  res: PendingJsonRpcResponse<V>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: T,
) => void | Promise<void>;

type BaseHandlerExport = {
  methodNames: string[];
};

/**
 * We use a mapped object type in order to create a type that requires the
 * presence of the names of all hooks for the given handler.
 * This can then be used to select only the necessary hooks whenever a method
 * is called for purposes of POLA.
 */
export type HookNames<T> = {
  [Property in keyof T]: true;
};

export type PermittedHandlerExport<T, U, V> = {
  implementation: HandlerMiddlewareFunction<T, U, V>;
  hookNames: HookNames<T>;
} & BaseHandlerExport;
