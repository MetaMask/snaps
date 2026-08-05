import type {
  CaipChainId,
  Json,
  JsonRpcParams,
  JsonRpcRequest,
} from '@metamask/utils';

import type { OriginMetadata } from '../origin';

/**
 * The `onProtocolRequest` handler, which is called when a Snap receives a
 * protocol request.
 *
 * Note that using this handler requires the `endowment:protocol` permission.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin of the request. This can be the ID of another
 * Snap, or the URL of a website.
 * @param args.originMetadata - Optional metadata about the origin. This is only
 * present if the origin is not directly verifiable, e.g., when the request
 * comes from a transport that cannot verify the origin.
 * @param args.scope - The scope of the request.
 * @param args.request - The protocol request sent to the Snap. This includes
 * the method name and parameters.
 * @returns The response to the protocol request. This must be a
 * JSON-serializable value. In order to return an error, throw a `SnapError`
 * instead.
 */
export type OnProtocolRequestHandler<
  Params extends JsonRpcParams = JsonRpcParams,
> = (args: {
  origin: string;
  originMetadata: OriginMetadata | null;
  scope: CaipChainId;
  request: JsonRpcRequest<Params>;
}) => Promise<Json>;
