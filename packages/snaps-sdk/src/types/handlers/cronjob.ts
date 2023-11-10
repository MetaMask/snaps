import type { JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

/**
 * The `onCronjob` handler. This is called on a regular interval, as defined by
 * the Snap's manifest.
 *
 * Note that using this handler requires the `endowment:cronjob` permission.
 *
 * @param args - The request arguments.
 * @param args.request - The JSON-RPC request sent to the snap. The parameters
 * are defined by the Snap's manifest.
 */
export type OnCronjobHandler<Params extends JsonRpcParams = JsonRpcParams> =
  (args: { request: JsonRpcRequest<Params> }) => Promise<unknown>;
