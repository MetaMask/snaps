import { MethodNotSupportedError } from '@metamask/snaps-sdk';
import type { CaipAccountId } from '@metamask/utils';
import {
  bytesToBase64,
  parseCaipAccountId,
  stringToBytes,
} from '@metamask/utils';

import { Module } from './base';

export class Solana extends Module {
  async signMessage(account: CaipAccountId, message: string): Promise<string> {
    const { address } = parseCaipAccountId(account);

    const bytes = stringToBytes(message);

    const result = await this.invokeMethod<{ signature: string }>({
      method: 'signMessage',
      params: { account: { address }, message: bytesToBase64(bytes) },
    });

    return result.signature;
  }

  async signTypedData(
    _account: CaipAccountId,
    _message: string,
  ): Promise<string> {
    throw new MethodNotSupportedError();
  }

  async getGenesisHash(): Promise<string> {
    return await this.invokeMethod({ method: 'getGenesisHash' });
  }
}
