import {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { PermittedHandlerExport } from '../../types';

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
  },
};

export type GetAppKeyHooks = {
  /**
   * A bound function that gets the app key for a particular snap.
   * @param requestedAccount - The requested account to get the app key for, if
   * any.
   * @returns The requested app key.
   */
  getAppKey: (requestedAccount?: string) => Promise<string>;
};

async function getAppKeyImplementation(
  req: JsonRpcRequest<[string]>,
  res: PendingJsonRpcResponse<string>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getAppKey }: GetAppKeyHooks,
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
    res.result = await getAppKey(requestedAccount);
    return end();
  } catch (error) {
    return end(error);
  }
}
