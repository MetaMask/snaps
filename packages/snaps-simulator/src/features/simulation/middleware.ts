import { BIP44Node } from '@metamask/key-tree';
import { logError } from '@metamask/snaps-utils';
import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
  JsonRpcMiddleware,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';

/* eslint-disable @typescript-eslint/naming-convention */
export const methodHandlers = {
  metamask_getProviderState: getProviderStateHandler,
  eth_requestAccounts: getAccountsHandler,
  eth_accounts: getAccountsHandler,
};
/* eslint-enable @typescript-eslint/naming-convention */

export type MiscMiddlewareHooks = {
  getMnemonic: () => Promise<Uint8Array>;
};

/**
 * A mock handler for account related methods that always returns the first address for the selected SRP.
 *
 * @param _request - Incoming JSON-RPC request, ignored for this specific handler.
 * @param response - The outgoing JSON-RPC response, modified to return the result.
 * @param _next - The json-rpc-engine middleware next handler.
 * @param end - The json-rpc-engine middleware end handler.
 * @param hooks - Any hooks required by this handler.
 */
async function getAccountsHandler(
  _request: JsonRpcRequest<unknown>,
  response: PendingJsonRpcResponse<unknown>,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: MiscMiddlewareHooks,
) {
  const { getMnemonic } = hooks;

  const node = await BIP44Node.fromDerivationPath({
    derivationPath: [
      await getMnemonic(),
      `bip32:44'`,
      `bip32:60'`,
      `bip32:0'`,
      `bip32:0`,
      `bip32:0`,
    ],
  });

  response.result = [node.address];
  return end();
}

/**
 * A mock handler for metamask_getProviderState that always returns a specific hardcoded result.
 *
 * @param _request - Incoming JSON-RPC request, ignored for this specific handler.
 * @param response - The outgoing JSON-RPC response, modified to return the result.
 * @param _next - The json-rpc-engine middleware next handler.
 * @param end - The json-rpc-engine middleware end handler.
 */
async function getProviderStateHandler(
  _request: JsonRpcRequest<unknown>,
  response: PendingJsonRpcResponse<unknown>,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
) {
  // For now this will return a mocked result, this should probably match whatever network we are talking to
  response.result = {
    isUnlocked: true,
    chainId: '0x01',
    networkVersion: '0x01',
    accounts: [],
  };
  return end();
}

/**
 * Creates a middleware for handling misc RPC methods normally handled internally by the MM client.
 *
 * NOTE: This middleware provides all `hooks` to all handlers and should therefore NOT be used outside of the simulator.
 *
 * @param hooks - Any hooks used by the middleware handlers.
 * @returns Nothing.
 */
export function createMiscMethodMiddleware(
  hooks: MiscMiddlewareHooks,
): JsonRpcMiddleware<unknown, unknown> {
  // This should probably use createAsyncMiddleware
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async function methodMiddleware(request, response, next, end) {
    const handler =
      methodHandlers[request.method as keyof typeof methodHandlers];
    if (handler) {
      try {
        // Implementations may or may not be async, so we must await them.
        return await handler(request, response, next, end, hooks);
      } catch (error: any) {
        logError(error);
        return end(error);
      }
    }

    return next();
  };
}
