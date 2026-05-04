import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
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
