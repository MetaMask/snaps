import type { CaipAccountId, Hex } from '@metamask/utils';
import {
  assert,
  bytesToHex,
  hexToNumber,
  parseCaipAccountId,
  stringToBytes,
} from '@metamask/utils';

import { Module } from './base';

/**
 * The EVM module implementing the base-spec for Ethereum-like scopes.
 */
export class Evm extends Module {
  /**
   * Sign a message using `personal_sign`.
   *
   * @param account - The CAIP-10 account ID.
   * @param message - The message to sign.
   * @returns The signature as a hexadecimal string.
   */
  async signMessage(account: CaipAccountId, message: string): Promise<string> {
    const { address } = parseCaipAccountId(account);

    return await this.invokeMethod<Hex>({
      method: 'personal_sign',
      params: [bytesToHex(stringToBytes(message)), address],
    });
  }

  /**
   * Sign a message using `eth_signTypedData_v4`.
   *
   * @param account - The CAIP-10 account ID.
   * @param message - The message to sign.
   * @returns The signature as a hexadecimal string.
   */
  async signTypedData(
    account: CaipAccountId,
    message: string,
  ): Promise<string> {
    const {
      chain: { reference },
      address,
    } = parseCaipAccountId(account);

    return await this.invokeMethod<Hex>({
      method: 'eth_signTypedData_v4',
      params: [
        address,
        {
          types: {
            EIP712Domain: [
              {
                name: 'name',
                type: 'string',
              },
              {
                name: 'version',
                type: 'string',
              },
              {
                name: 'chainId',
                type: 'uint256',
              },
              {
                name: 'verifyingContract',
                type: 'address',
              },
            ],
            Person: [
              {
                name: 'name',
                type: 'string',
              },
              {
                name: 'wallet',
                type: 'address',
              },
            ],
            Mail: [
              {
                name: 'from',
                type: 'Person',
              },
              {
                name: 'to',
                type: 'Person',
              },
              {
                name: 'contents',
                type: 'string',
              },
            ],
          },
          primaryType: 'Mail',
          domain: {
            name: 'Ether Mail',
            version: '1',
            chainId: hexToNumber(reference),
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          },
          message: {
            from: {
              name: 'Snap',
              wallet: address,
            },
            to: {
              name: 'Bob',
              wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            },
            contents: message,
          },
        },
      ],
    });
  }

  /**
   * Get the genesis hash of the selected scope.
   *
   * @returns The genesis hash as a hexadecimal string.
   */
  async getGenesisHash(): Promise<string> {
    const block = await this.invokeMethod<{ hash: string }>({
      method: 'eth_getBlockByNumber',
      params: ['0x0', false],
    });

    assert(block, 'Multichain API did not return a valid block.');

    return block.hash;
  }
}
