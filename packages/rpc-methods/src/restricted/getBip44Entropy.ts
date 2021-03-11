import { JsonRpcEngineEndCallback, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { deriveKeyFromPath } from '@metamask/key-tree';
import { RestrictedHandlerExport } from '../../types';

const METHOD_PREFIX = 'snap_getBip44Entropy_';

export const getBip44EntropyHandler: RestrictedHandlerExport<GetBip44EntropyHooks, void, string> = {
  methodNames: [`${METHOD_PREFIX}*`],
  getImplementation: getGetBip44EntropyHandler,
  methodDescription: 'Control private keys for coin_type "$1"',
  permissionDescription: 'Control private keys for coin_type "$1"',
  hookNames: {
    'getMnemonic': true,
  },
};

export interface GetBip44EntropyHooks {

  /**
   * @returns The mnemonic of the user's primary keyring.
   */
  getMnemonic: () => Promise<string>;
}

const ALL_DIGIT_REGEX = /^\d+$/u;

function getGetBip44EntropyHandler({ getMnemonic }: GetBip44EntropyHooks) {
  return async function getBip44Entropy(
    req: JsonRpcRequest<void>,
    res: PendingJsonRpcResponse<string>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
    _engine: unknown,
  ): Promise<void> {
    try {
      const bip44Code = req.method.substr(METHOD_PREFIX.length);
      if (!ALL_DIGIT_REGEX.test(bip44Code)) {
        return end(ethErrors.rpc.methodNotFound({
          message: `Invalid BIP-44 code: ${bip44Code}`,
        }));
      }

      const mnemonic = await getMnemonic();
      const multipath = `bip39:${mnemonic}/bip32:44'/bip32:${bip44Code}'`;
      res.result = deriveKeyFromPath(multipath).toString('base64');
      return end();
    } catch (err) {
      return end(err);
    }
  };
}
