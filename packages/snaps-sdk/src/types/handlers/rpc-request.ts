import type { Json, JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

/**
 * The `onRpcRequest` handler, which is called when a Snap receives a JSON-RPC
 * request. This can be called from another Snap, or from a website, depending
 * on the Snap's `endowment:rpc` permission.
 *
 * Note that using this handler requires the `endowment:rpc` permission.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin of the request. This can be the ID of another
 * Snap, or the URL of a website.
 * @param args.request - The JSON-RPC request sent to the snap. This includes
 * the method name and parameters.
 * @returns The response to the JSON-RPC request. This must be a
 * JSON-serializable value. In order to return an error, throw a `SnapError`
 * instead.
 */
export type OnRpcRequestHandler<Params extends JsonRpcParams = JsonRpcParams> =
  (args: { origin: string; request: JsonRpcRequest<Params> }) => Promise<Json>;
