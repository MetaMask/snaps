import { panel, text } from '@metamask/snaps-sdk';
import { create } from 'superstruct';

import {
  InterfaceStruct,
  JsonRpcMockOptionsStruct,
  SnapOptionsStruct,
  SnapResponseStruct,
  TransactionOptionsStruct,
} from './structs';

const INVALID_VALUES = [
  null,
  undefined,
  true,
  false,
  0,
  1,
  NaN,
  Infinity,
  -Infinity,
  '',
  ' ',
  'a',
  '0',
  '1',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function () {},
  Symbol('a'),
];

describe('TransactionOptionsStruct', () => {
  it('accepts an empty object', () => {
    const transaction = create({}, TransactionOptionsStruct);

    expect(transaction).toStrictEqual({
      chainId: 'eip155:1',
      data: '0x',
      from: expect.any(String),
      gasLimit: '0x5208',
      maxFeePerGas: '0x01',
      maxPriorityFeePerGas: '0x01',
      nonce: '0x00',
      origin: 'metamask.io',
      to: expect.any(String),
      value: '0x00',
    });
  });

  it('accepts a valid object', () => {
    const transaction = create(
      {
        chainId: 'eip155:1',
        data: '0x',
        from: '0x000000000000000000000000000000000000',
        gasLimit: '0x5208',
        maxFeePerGas: '0x01',
        maxPriorityFeePerGas: '0x01',
        nonce: '0x00',
        origin: 'metamask.io',
        to: '0x000000000000000000000000000000000000',
        value: '0x00',
      },
      TransactionOptionsStruct,
    );

    expect(transaction).toStrictEqual({
      chainId: 'eip155:1',
      data: '0x',
      from: '0x000000000000000000000000000000000000',
      gasLimit: '0x5208',
      maxFeePerGas: '0x01',
      maxPriorityFeePerGas: '0x01',
      nonce: '0x00',
      origin: 'metamask.io',
      to: '0x000000000000000000000000000000000000',
      value: '0x00',
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, TransactionOptionsStruct)).toThrow();
  });
});

describe('SnapOptionsStruct', () => {
  it('accepts an empty object', () => {
    const options = create({}, SnapOptionsStruct);

    expect(options).toStrictEqual({
      timeout: 1000,
    });
  });

  it('accepts a valid object', () => {
    const options = create(
      {
        timeout: 5000,
      },
      SnapOptionsStruct,
    );

    expect(options).toStrictEqual({
      timeout: 5000,
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, SnapOptionsStruct)).toThrow();
  });
});

describe('JsonRpcMockOptionsStruct', () => {
  it('accepts a valid object', () => {
    const options = create(
      {
        method: 'eth_chainId',
        result: '0x1',
      },
      JsonRpcMockOptionsStruct,
    );

    expect(options).toStrictEqual({
      method: 'eth_chainId',
      result: '0x1',
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, JsonRpcMockOptionsStruct)).toThrow();
  });
});

describe('InterfaceStruct', () => {
  it('accepts a valid object', () => {
    const options = create(
      {
        content: panel([text('Hello, world!')]),
      },
      InterfaceStruct,
    );

    expect(options).toStrictEqual({
      content: {
        type: 'panel',
        children: [
          {
            type: 'text',
            value: 'Hello, world!',
          },
        ],
      },
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, InterfaceStruct)).toThrow();
  });
});

describe('SnapResponseStruct', () => {
  it('accepts a valid object', () => {
    const options = create(
      {
        id: '1',
        response: {
          result: '0x1',
        },
        notifications: [
          {
            id: '1',
            type: 'native',
            message: 'Hello, world!',
          },
        ],
      },
      SnapResponseStruct,
    );

    expect(options).toStrictEqual({
      id: '1',
      response: {
        result: '0x1',
      },
      notifications: [
        {
          id: '1',
          type: 'native',
          message: 'Hello, world!',
        },
      ],
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, SnapResponseStruct)).toThrow();
  });
});
