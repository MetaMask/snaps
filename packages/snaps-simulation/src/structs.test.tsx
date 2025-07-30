import { Box, Text } from '@metamask/snaps-sdk/jsx';
import { create } from '@metamask/superstruct';

import {
  BaseNameLookupOptionsStruct,
  InterfaceStruct,
  JsonRpcMockOptionsStruct,
  NameLookupOptionsStruct,
  SignatureOptionsStruct,
  SnapOptionsStruct,
  SnapResponseStruct,
  SnapResponseWithInterfaceStruct,
  SnapResponseWithoutInterfaceStruct,
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
  // eslint-disable-next-line no-empty-function
  () => {},
  // eslint-disable-next-line no-empty-function
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

describe('SignatureOptionsStruct', () => {
  it('accepts an empty object', () => {
    const signature = create({}, SignatureOptionsStruct);

    expect(signature).toStrictEqual({
      data: '0x',
      from: expect.any(String),
      origin: 'metamask.io',
      signatureMethod: 'personal_sign',
    });
  });

  it('accepts a valid object', () => {
    const signature = create(
      {
        data: { foo: 'bar' },
        from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        origin: 'metamask.io',
        signatureMethod: 'eth_signTypedData_v3',
      },
      SignatureOptionsStruct,
    );

    expect(signature).toStrictEqual({
      data: { foo: 'bar' },
      from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      origin: 'metamask.io',
      signatureMethod: 'eth_signTypedData_v3',
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
        content: (
          <Box>
            <Text>Hello, world!</Text>
          </Box>
        ),
      },
      InterfaceStruct,
    );

    expect(options).toStrictEqual({
      content: (
        <Box>
          <Text>Hello, world!</Text>
        </Box>
      ),
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, InterfaceStruct)).toThrow();
  });
});

describe('SnapResponseWithInterfaceStruct', () => {
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
        tracked: {
          errors: [
            {
              name: 'Error',
              message: 'An error occurred',
              stack:
                'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
              cause: null,
            },
          ],
          events: [
            {
              event: 'Test Event',
              properties: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                test_property: 'test value',
              },
            },
          ],
        },
        getInterface: () => undefined,
      },
      SnapResponseWithInterfaceStruct,
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
      tracked: {
        errors: [
          {
            name: 'Error',
            message: 'An error occurred',
            stack:
              'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
            cause: null,
          },
        ],
        events: [
          {
            event: 'Test Event',
            properties: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              test_property: 'test value',
            },
          },
        ],
      },
      getInterface: expect.any(Function),
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, SnapResponseWithInterfaceStruct)).toThrow();
  });
});

describe('SnapResponseWithoutInterfaceStruct', () => {
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
        tracked: {
          errors: [
            {
              name: 'Error',
              message: 'An error occurred',
              stack:
                'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
              cause: null,
            },
          ],
          events: [
            {
              event: 'Test Event',
              properties: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                test_property: 'test value',
              },
            },
          ],
        },
      },
      SnapResponseWithoutInterfaceStruct,
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
      tracked: {
        errors: [
          {
            name: 'Error',
            message: 'An error occurred',
            stack:
              'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
            cause: null,
          },
        ],
        events: [
          {
            event: 'Test Event',
            properties: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              test_property: 'test value',
            },
          },
        ],
      },
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, SnapResponseWithoutInterfaceStruct)).toThrow();
  });
});

describe('SnapResponseStruct', () => {
  it('accepts a valid object', () => {
    const optionsWithInterface = create(
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
        tracked: {
          errors: [
            {
              name: 'Error',
              message: 'An error occurred',
              stack:
                'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
              cause: null,
            },
          ],
          events: [
            {
              event: 'Test Event',
              properties: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                test_property: 'test value',
              },
            },
          ],
        },
        getInterface: () => undefined,
      },
      SnapResponseStruct,
    );

    expect(optionsWithInterface).toStrictEqual({
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
      tracked: {
        errors: [
          {
            name: 'Error',
            message: 'An error occurred',
            stack:
              'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
            cause: null,
          },
        ],
        events: [
          {
            event: 'Test Event',
            properties: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              test_property: 'test value',
            },
          },
        ],
      },
      getInterface: expect.any(Function),
    });

    const optionsWithoutInterface = create(
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
        tracked: {
          errors: [
            {
              name: 'Error',
              message: 'An error occurred',
              stack:
                'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
              cause: null,
            },
          ],
          events: [
            {
              event: 'Test Event',
              properties: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                test_property: 'test value',
              },
            },
          ],
        },
      },
      SnapResponseStruct,
    );

    expect(optionsWithoutInterface).toStrictEqual({
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
      tracked: {
        errors: [
          {
            name: 'Error',
            message: 'An error occurred',
            stack:
              'Error: An error occurred\n    at Object.<anonymous> (test.js:1:1)',
            cause: null,
          },
        ],
        events: [
          {
            event: 'Test Event',
            properties: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              test_property: 'test value',
            },
          },
        ],
      },
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, SnapResponseStruct)).toThrow();
  });
});

describe('BaseNameLookupOptionsStruct', () => {
  it('accepts a valid object', () => {
    const options = create(
      {
        chainId: 'eip155:1',
      },
      BaseNameLookupOptionsStruct,
    );

    expect(options).toStrictEqual({
      chainId: 'eip155:1',
    });
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, BaseNameLookupOptionsStruct)).toThrow();
  });
});

describe('NameLookupOptionsStruct', () => {
  it('accepts a valid object for domain lookup', () => {
    const options = create(
      {
        chainId: 'eip155:1',
        domain: 'test.domain',
      },
      NameLookupOptionsStruct,
    );

    expect(options).toStrictEqual({
      chainId: 'eip155:1',
      domain: 'test.domain',
    });
  });

  it('accepts a valid object for address lookup', () => {
    const options = create(
      {
        chainId: 'eip155:1',
        address: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
      },
      NameLookupOptionsStruct,
    );

    expect(options).toStrictEqual({
      chainId: 'eip155:1',
      address: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
    });
  });

  it('throws when trying to use both, address and domain', () => {
    const options = {
      chainId: 'eip155:1',
      address: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
      domain: 'test.domain',
    };
    expect(() => create(options, NameLookupOptionsStruct)).toThrow(
      'Expected the value to satisfy a union of `object | object`, but received: [object Object]',
    );
  });

  it.each(INVALID_VALUES)('throws for invalid value: %p', (value) => {
    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => create(value, NameLookupOptionsStruct)).toThrow();
  });
});
