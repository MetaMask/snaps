import type { CaipAccountId, Hex } from '@metamask/utils';
import {
  assert,
  bytesToHex,
  hexToNumber,
  parseCaipAccountId,
  stringToBytes,
} from '@metamask/utils';

import { Module } from './base';

export class Evm extends Module {
  async signMessage(account: CaipAccountId, message: string): Promise<string> {
    const { address } = parseCaipAccountId(account);

    return await this.invokeMethod<Hex>({
      method: 'personal_sign',
      params: [bytesToHex(stringToBytes(message)), address],
    });
  }

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

  async getGenesisHash(): Promise<string> {
    const block = await this.invokeMethod<{ hash: string }>({
      method: 'eth_getBlockByNumber',
      params: ['0x0', false],
    });

    assert(block, 'Multichain API did not return a valid block.');

    return block.hash;
  }
}
