import {
  bytesToBase64,
  CaipAccountId,
  parseCaipAccountId,
  stringToBytes,
} from '@metamask/utils';
import { invokeMethod, Module } from './base';
import { MethodNotSupportedError } from '@metamask/snaps-sdk';

export class Solana extends Module {
  async signMessage(account: CaipAccountId, message: string): Promise<string> {
    const { address } = parseCaipAccountId(account);

    const bytes = stringToBytes(message);

    const result = await invokeMethod<{ signature: string }>(this.scope, {
      method: 'signMessage',
      params: { account: { address }, message: bytesToBase64(bytes) },
    });

    return result.signature;
  }

  signTypedData(_account: CaipAccountId, _message: string): Promise<string> {
    throw new MethodNotSupportedError();
  }
}
