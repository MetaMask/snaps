import {
  JsonRpcRequest,
  JsonRpcEngineNextCallback,
  JsonRpcEngineEndCallback,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { AnnotatedJsonRpcEngine } from 'rpc-cap';

export type HandlerMiddlewareFunction<T, U, V> = (
  req: JsonRpcRequest<U>,
  res: PendingJsonRpcResponse<V>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: T,
) => void | Promise<void>;

export type RestrictedHandlerMiddlewareFunction<T, U> = (
  req: JsonRpcRequest<T>,
  res: PendingJsonRpcResponse<U>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  engine: AnnotatedJsonRpcEngine,
) => void | Promise<void>;

export type RestrictedHandlerMiddlewareGetter<T, U, V> = (hooks: T) => RestrictedHandlerMiddlewareFunction<U, V>;

interface BaseHandlerExport {
  methodNames: string[];
  methodDescription: string;
}

/**
 * We use a mapped object type in order to create a type that requires the
 * presence of the names of all hooks for the given handler.
 * This can then be used to select only the necessary hooks whenever a method
 * is called for purposes of POLA.
 */
type HookNames<T> = {
  [Property in keyof T]: true;
};

export interface PermittedHandlerExport<T, U, V> extends BaseHandlerExport {
  implementation: HandlerMiddlewareFunction<T, U, V>;
  hookNames: HookNames<T>;
}

export interface RestrictedHandlerExport<T, U, V> extends BaseHandlerExport {
  getImplementation: RestrictedHandlerMiddlewareGetter<T, U, V>;
  permissionDescription: string;
  hookNames: HookNames<T>;
}
