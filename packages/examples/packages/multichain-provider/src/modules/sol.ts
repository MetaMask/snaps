import { MethodNotSupportedError } from '@metamask/snaps-sdk';
import type { CaipAccountId } from '@metamask/utils';
import {
  bytesToBase64,
  parseCaipAccountId,
  stringToBytes,
} from '@metamask/utils';

import { Module } from './base';

/**
 * The Solana module implementing the base-spec for Solana scopes.
 */
export class Solana extends Module {
  /**
   * Sign a message using `signMessage`.
   *
   * @param account - The CAIP-10 account ID.
   * @param message - The message to sign.
   * @returns The signature as a base-58 encoded string.
   */
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

  /**
   * Get the genesis hash of the selected scope.
   *
   * @returns The genesis hash as a base-58 encoded string.
   */
  async getGenesisHash(): Promise<string> {
    return await this.invokeMethod({ method: 'getGenesisHash' });
  }
}
