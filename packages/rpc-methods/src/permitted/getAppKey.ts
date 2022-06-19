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
 * @param req
 * @param res
 * @param _next
 * @param end
 * @param options0
 * @param options0.getAppKey
 * @param options0.getUnlockPromise
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
