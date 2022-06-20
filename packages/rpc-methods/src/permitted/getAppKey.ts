import { ethErrors } from 'eth-rpc-errors';
import {
  PermittedHandlerExport,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from '@metamask/types';

/**
 * `snap_getAppKey` gets the Snap's app key.
 */
export const getAppKeyHandler: PermittedHandlerExport<
  GetAppKeyHooks,
  [string],
  string
> = {
  methodNames: ['snap_getAppKey'],
  implementation: getAppKeyImplementation,
  hookNames: {
    getAppKey: true,
    getUnlockPromise: true,
  },
};

export type GetAppKeyHooks = {
  /**
   * A bound function that gets the app key for a particular snap.
   *
   * @param requestedAccount - The requested account to get the app key for, if
   * any.
   * @returns The requested app key.
   */
  getAppKey: (requestedAccount?: string) => Promise<string>;

  /**
   * Waits for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

/**
 * The `snap_getAppKey` method implementation.
 * Tries to fetch an "app key" for the requesting snap and adds it to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getAppKey - A function that retrieves an "app key" for the requesting snap.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked and prompts the user to unlock their MetaMask if it is locked.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */
async function getAppKeyImplementation(
  req: JsonRpcRequest<[string]>,
  res: PendingJsonRpcResponse<string>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getAppKey, getUnlockPromise }: GetAppKeyHooks,
): Promise<void> {
  const [requestedAccount] = req?.params || [];

  if (
    requestedAccount !== undefined &&
    (!requestedAccount || typeof requestedAccount !== 'string')
  ) {
    return end(
      ethErrors.rpc.invalidParams({
        message:
          'Must omit params completely or specify a single hexadecimal string Ethereum account.',
      }),
    );
  }

  try {
    await getUnlockPromise(true);
    res.result = await getAppKey(requestedAccount);
    return end();
  } catch (error) {
    return end(error);
  }
}
