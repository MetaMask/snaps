import type { Json, JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

/**
 * The `onKeyringRequest` handler, which is called when a Snap receives a
 * keyring request.
 *
 * Note that using this handler requires the `endowment:keyring` permission.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin of the request. This can be the ID of another
 * Snap, or the URL of a website.
 * @param args.request - The keyring request sent to the Snap. This includes
 * the method name and parameters.
 * @returns The response to the keyring request. This must be a
 * JSON-serializable value. In order to return an error, throw a `SnapError`
 * instead.
 */
export type OnKeyringRequestHandler<
  Params extends JsonRpcParams = JsonRpcParams,
> = (args: {
  origin: string;
  request: JsonRpcRequest<Params>;
}) => Promise<Json>;
