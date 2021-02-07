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

interface BaseHandlerExport {
  description: string;
  methodNames: string[];
}

export interface PermittedHandlerExport<T, U, V> extends BaseHandlerExport {
  implementation: HandlerMiddlewareFunction<T, U, V>;
}

export interface RestrictedHandlerExport<T, U, V> extends BaseHandlerExport {
  implementationGetter: RestrictedHandlerMiddlewareGetter<T, U, V>;
}
