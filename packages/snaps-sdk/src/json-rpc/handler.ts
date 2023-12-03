import type { Json, JsonRpcParams } from '@metamask/utils';
import { assertStruct } from '@metamask/utils';
import type { Struct } from 'superstruct';

import { MethodNotFoundError } from '../error-wrappers';
import type { OnRpcRequestHandler } from '../types';

/**
 * The `onRpcRequest` handler, which is called when a Snap receives a JSON-RPC
 * request with the specified method. This can be called from another Snap, or
 * from a website, depending on the Snap's `endowment:rpc` permission.
 *
 * @param request - The JSON-RPC request sent to the snap. This includes the
 * method name and parameters.
 * @param origin - The origin of the request. This can be the ID of another
 * Snap, or the URL of a website.
 * @returns The response to the JSON-RPC request. This must be a
 * JSON-serializable value.
 */
type HandlerFunction<Params extends JsonRpcParams> = (
  params: Params,
  origin: string,
) => Promise<Json>;

type Handler<Type extends JsonRpcParams> = {
  schema: Struct<Type>;
  handler: HandlerFunction<Type>;
};

/**
 * The options for the `getMethodHandler` function. This is a map of method
 * names to schemas and handlers. The schemas are used to validate the request
 * parameters, and the handlers are called if the request is valid.
 *
 * See also the {@link Handler} type.
 */
type MethodHandlerOptions<Map extends Record<string, JsonRpcParams>> = {
  [Key in keyof Map]: Handler<Map[Key]>;
};

/**
 * Get a method handler for a map of methods. This is a helper function to
 * simplify the creation of a `onRpcRequest` handler. It takes a map of method
 * names to schemas and handlers, and returns a handler that can be exported as
 * the `onRpcRequest` handler. This handler will validate the request against
 * the schema, and call the handler function if the request is valid.
 *
 * @example
 * export const onRpcRequest = getMethodHandler({
 *   someMethod: {
 *     schema: object({
 *       foo: string(),
 *     }),
 *     handler: async ({ request }) => {
 *       // `request.params` is typed as `{ foo: string }`.
 *       return request.params.foo;
 *     },
 *   },
 * });
 * @param options - The method handler options.
 * @returns The method handler. This can be exported as the `onRpcRequest`
 * handler.
 */
export function getMethodHandler<Map extends Record<string, JsonRpcParams>>(
  options: MethodHandlerOptions<Map>,
): OnRpcRequestHandler {
  return async ({ request, origin }) => {
    const handler = options[request.method];
    if (!handler) {
      throw new MethodNotFoundError(undefined, {
        method: request.method,
      });
    }

    const { schema, handler: handlerFn } = handler;
    const { params } = request;
    assertStruct(params, schema);

    return handlerFn(params, origin);
  };
}
