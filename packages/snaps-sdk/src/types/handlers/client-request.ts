import type { Json, JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

/**
 * The `onClientRequest` handler, which is called when a Snap receives a JSON-RPC
 * request from the client exclusively.
 *
 * @param args - The request arguments.
 * @param args.request - The JSON-RPC request sent to the snap. This includes
 * the method name and parameters.
 * @returns The response to the JSON-RPC request. This must be a
 * JSON-serializable value. In order to return an error, throw a `SnapError`
 * instead.
 */
export type OnClientRequestHandler<
  Params extends JsonRpcParams = JsonRpcParams,
> = (args: { request: JsonRpcRequest<Params> }) => Promise<Json>;
