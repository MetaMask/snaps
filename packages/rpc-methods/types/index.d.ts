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

export interface PermittedHandlerExport<T, U, V> extends BaseHandlerExport {
  implementation: HandlerMiddlewareFunction<T, U, V>;
}

export interface RestrictedHandlerExport<T, U, V> extends BaseHandlerExport {
  implementationGetter: RestrictedHandlerMiddlewareGetter<T, U, V>;
  permissionDescription: string;
}
