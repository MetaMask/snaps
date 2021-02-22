import { JsonRpcEngineEndCallback, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { PermittedHandlerExport } from '../../types';

const getAppKeyExport: PermittedHandlerExport<GetAppKeyHooks, [string], string> = {
  methodNames: ['snap_getAppKey'],
  implementation: getAppKeyHandler,
  methodDescription: 'Get the app key of the snap.',
};
export default getAppKeyExport;

export interface GetAppKeyHooks {

  /**
   * A bound function that gets the app key for a particular snap.
   * @param requestedAccount - The requested account to get the app key for, if
   * any.
   * @returns The requested app key.
   */
  getAppKey: (requestedAccount?: string) => Promise<string>;
}

async function getAppKeyHandler(
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
    return end(ethErrors.rpc.invalidParams({
      message: 'Must omit params completely or specify a single hexadecimal string Ethereum account.',
    }));
  }

  try {
    res.result = await getAppKey(requestedAccount);
    return end();
  } catch (error) {
    return end(error);
  }
}
