import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

// This is only imported for its type. It is not used at runtime.
// eslint-disable-next-line import-x/order
import type { instantiate } from '../build/program';

// This is the WASM module, generated by AssemblyScript, inlined as an object
// containing the functions exported by the WASM module.
// eslint-disable-next-line import-x/extensions
import * as program from '../build/program.wasm';

/**
 * The type of the WASM module. This is generated by AssemblyScript.
 */
type Program = Awaited<ReturnType<typeof instantiate>>;

/**
 * The type of the WASM module's methods. This is generated by AssemblyScript.
 */
type Method = Exclude<keyof Program, 'memory'>;

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `fibonacci`: Calculate the nth Fibonacci number. This method takes a
 * single parameter, `n` (as array), which is the index of the Fibonacci number
 * to calculate. This uses the WASM module to calculate the Fibonacci number.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentwebassembly
 * @see https://developer.mozilla.org/docs/WebAssembly
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  // For this example, we don't validate the request. We assume that the
  // request is valid, and that the snap is only called with valid requests. In
  // a real snap, you should validate the request before calling the WASM
  // module.
  const method = request.method as Method;
  const params = request.params as Parameters<Program[typeof method]>;

  if (program[method]) {
    return program[method](...params);
  }

  throw new MethodNotFoundError({ method: request.method });
};
