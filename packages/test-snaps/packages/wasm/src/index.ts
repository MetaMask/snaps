import { rpcErrors } from '@metamask/rpc-errors';
import { OnRpcRequestHandler } from '@metamask/snaps-types';

// eslint-disable-next-line import/extensions
import program from '../build/program.wasm';

let wasm: WebAssembly.Instance;

/**
 * Load and initialize the WASM module. This modifies the global `wasm`
 * variable, with the instantiated module.
 *
 * @throws If the WASM module failed to initialize.
 */
const initializeWasm = async () => {
  try {
    wasm = await WebAssembly.instantiate(program);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize WebAssembly module.', error);
    throw error;
  }
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The resulting number returned by WASM.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  if (!wasm) {
    await initializeWasm();
  }

  if (wasm.exports[request.method]) {
    // @ts-expect-error - WASM exports are not typed.
    return wasm.exports[request.method](...request.params);
  }

  throw rpcErrors.methodNotFound({ data: { request } });
};
