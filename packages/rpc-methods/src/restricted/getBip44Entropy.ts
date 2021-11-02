import {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { BIP44CoinTypeNode, JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import { RestrictedHandlerExport } from '../../types';

const METHOD_PREFIX = 'snap_getBip44Entropy_';

export const getBip44EntropyHandler: RestrictedHandlerExport<
  GetBip44EntropyHooks,
  void,
  JsonBIP44CoinTypeNode
> = {
  methodNames: [`${METHOD_PREFIX}*`],
  getImplementation: getGetBip44EntropyHandler,
  methodDescription: 'Control private keys for a particular coin type.',
  permissionDescription: 'Control private keys for a particular coin type.',
  hookNames: {
    getMnemonic: true,
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
    res: PendingJsonRpcResponse<JsonBIP44CoinTypeNode>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
    _engine: unknown,
  ): Promise<void> {
    try {
      const bip44Code = req.method.substr(METHOD_PREFIX.length);
      if (!ALL_DIGIT_REGEX.test(bip44Code)) {
        return end(
          ethErrors.rpc.methodNotFound({
            message: `Invalid BIP-44 code: ${bip44Code}`,
          }),
        );
      }

      res.result = new BIP44CoinTypeNode([
        `bip39:${await getMnemonic()}`,
        `bip32:44'`,
        `bip32:${Number(bip44Code)}'`,
      ]).toJSON();
      return end();
    } catch (err) {
      return end(err);
    }
  };
}
