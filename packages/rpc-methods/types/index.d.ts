import {
  JsonRpcRequest,
  JsonRpcEngineNextCallback,
  JsonRpcEngineEndCallback,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';

export type HandlerMiddlewareFunction<T, U, V> = (
  req: JsonRpcRequest<T>,
  res: PendingJsonRpcResponse<U>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: V,
) => void | Promise<void>;

export interface HandlerExport<T, U, V> {
  methodNames: string[];
  implementation: HandlerMiddlewareFunction<T, U, V>;
}
