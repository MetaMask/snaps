import type { TransactionFormData } from './utils';

export type TransactionPreset = {
  name: string;
  transaction: TransactionFormData;
};

export const TRANSACTION_PRESETS: TransactionPreset[] = [
  {
    name: 'ERC-20',
    transaction: {
      transactionOrigin: 'metamask.io',
      chainId: 'eip155:1',
      from: '0xa9d29f1acd75f93815f48011e2ac347ff164c7f4',
      to: '0x6b175474e89094c44da98b954eedeac495271d0f',
      value: '0',
      gas: '77727',
      nonce: '0',
      maxFeePerGas: '120',
      maxPriorityFeePerGas: '0.24',
      data: '0xa9059cbb000000000000000000000000dde3d2ed021aa02ff90110df1beb708894b4a4e9000000000000000000000000000000000000000000000002b5e3af16b1880000',
    },
  },
  {
    name: 'ERC-721',
    transaction: {
      transactionOrigin: 'metamask.io',
      chainId: 'eip155:1',
      from: '0x71ee35256e47ae7b80c4b986cb6923027f8bd8b8',
      to: '0xe42cad6fc883877a76a26a16ed92444ab177e306',
      value: '0',
      gas: '93439',
      nonce: '0',
      maxFeePerGas: '60.9',
      maxPriorityFeePerGas: '0.094',
      data: '0x23b872dd00000000000000000000000071ee35256e47ae7b80c4b986cb6923027f8bd8b80000000000000000000000009d311dd340fdcfefdb0b5742bd9012db4c9454cb000000000000000000000000000000000000000000000000000000000003989b',
    },
  },
  {
    name: 'ERC-1155',
    transaction: {
      transactionOrigin: 'metamask.io',
      chainId: 'eip155:1',
      from: '0x970b9713268ffa52b41021e8cc68e612cfcc43b4',
      to: '0x760c862191ebd06fe91ec76f7e8b7356308489e2',
      value: '0',
      gas: '56971',
      nonce: '0',
      maxFeePerGas: '15.65',
      maxPriorityFeePerGas: '0',
      data: '0xf242432a000000000000000000000000970b9713268ffa52b41021e8cc68e612cfcc43b4000000000000000000000000e828abd66d651cae1c1ba353995241fc3e5a336c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  {
    name: 'Ether',
    transaction: {
      transactionOrigin: 'metamask.io',
      chainId: 'eip155:1',
      from: '0xaf50a1b549d2cc59f9d9cc405759096467bb0390',
      to: '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520',
      value: '0.003',
      gas: '21000',
      nonce: '0',
      maxFeePerGas: '32.22',
      maxPriorityFeePerGas: '2.6',
      data: '',
    },
  },
];
