import {
  JsonRpcRequest,
  JsonRpcEngineNextCallback,
  JsonRpcEngineEndCallback,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { AnnotatedJsonRpcEngine } from 'rpc-cap';

export type HandlerMiddlewareFunction<T, U, V> = (
  req: JsonRpcRequest<T>,
  res: PendingJsonRpcResponse<U>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: V,
) => void | Promise<void>;

export type RestrictedHandlerMiddlewareFunction<T, U> = (
  req: JsonRpcRequest<T>,
  res: PendingJsonRpcResponse<U>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  engine: AnnotatedJsonRpcEngine,
) => void | Promise<void>;

export type RestrictedHandlerMiddlewareGetter<T, U, V> = (hooks: V) => RestrictedHandlerMiddlewareFunction<T, U>;

export interface PermittedHandlerExport<T, U, V> {
  description: string;
  implementation: HandlerMiddlewareFunction<T, U, V>;
  methodNames: string[];
}

export interface RestrictedHandlerExport<T, U, V> {
  description: string;
  implementationGetter: RestrictedHandlerMiddlewareGetter<T, U, V>;
  methodName: string;
}
