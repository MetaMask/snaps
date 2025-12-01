import {
  bytesToHex,
  CaipAccountId,
  Hex,
  parseCaipAccountId,
  stringToBytes,
} from '@metamask/utils';
import { invokeMethod, Module } from './base';

export class Evm extends Module {
  async signMessage(account: CaipAccountId, message: string): Promise<string> {
    const { address } = parseCaipAccountId(account);

    return await invokeMethod<Hex>(this.scope, {
      method: 'personal_sign',
      params: [bytesToHex(stringToBytes(message)), address],
    });
  }
}
