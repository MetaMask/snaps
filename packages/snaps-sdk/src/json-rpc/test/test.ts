import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { array, number, object, string } from 'superstruct';

import { getMethodHandler } from '../handler';

// Test snap code.

export const onRpcRequest: OnRpcRequestHandler = getMethodHandler({
  // `foo` JSON-RPC method.
  foo: {
    schema: object({
      foo: string(),
    }),

    /**
     * Test JSON-RPC handler.
     *
     * @param params - The request parameters.
     * @param origin - The origin of the request.
     * @returns The string `'foo'`.
     * @example
     * Foo
     */
    handler: async (params, origin) => {
      // eslint-disable-next-line no-console
      console.log(params, origin);
      return 'foo';
    },
  },

  // `bar` JSON-RPC method.
  bar: {
    schema: array(number()),
    handler: async (params) => {
      // eslint-disable-next-line no-console
      console.log(params);
      return 'bar';
    },
  },
});
