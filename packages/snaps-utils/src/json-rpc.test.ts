import { SubjectType } from '@metamask/permission-controller';

import type { RpcOrigins } from './json-rpc';
import {
  assertIsJsonRpcSuccess,
  assertIsKeyringOrigins,
  assertIsRpcOrigins,
  isOriginAllowed,
} from './json-rpc';

describe('assertIsRpcOrigins', () => {
  it.each([
    { dapps: true },
    { snaps: true },
    { dapps: true, snaps: true },
    {
      dapps: true,
      snaps: true,
      allowedOrigins: ['foo', 'bar'],
    },
    {
      dapps: false,
      snaps: true,
      allowedOrigins: ['foo', 'bar'],
    },
    {
      dapps: true,
      allowedOrigins: ['foo', 'bar'],
    },
    {
      allowedOrigins: ['foo', 'bar'],
    },
  ])('does not throw for %p', (origins) => {
    expect(() => assertIsRpcOrigins(origins)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    1,
    '',
    'foo',
    [],
    ['foo'],
    {},
    { foo: true },
    { dapps: false, snaps: false },
  ])('throws for %p', (origins) => {
    expect(() => assertIsRpcOrigins(origins)).toThrow(
      'Invalid JSON-RPC origins:',
    );
  });

  it.each([
    { dapps: false },
    { snaps: false },
    { allowedOrigins: [] },
    { dapps: false, snaps: false },
    { dapps: false, snaps: false, allowedOrigins: [] },
  ])('throws if no origins are allowed', (value) => {
    expect(() => assertIsRpcOrigins(value)).toThrow(
      'Invalid JSON-RPC origins: Must specify at least one JSON-RPC origin.',
    );
  });
});

describe('assertIsKeyringOrigin', () => {
  it.each([
    {
      allowedOrigins: ['foo', 'bar'],
    },
    {
      allowedOrigins: ['foo'],
    },
    {
      allowedOrigins: [],
    },
    {},
  ])('does not throw for %p', (origins) => {
    expect(() => assertIsKeyringOrigins(origins)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    1,
    '',
    'foo',
    ['foo'],
    { foo: true },
    { dapps: false, snaps: false },
  ])('throws for %p', (origins) => {
    expect(() => assertIsKeyringOrigins(origins)).toThrow(
      'Invalid keyring origins:',
    );
  });
});

describe('isOriginAllowed', () => {
  it('returns `true` if all origins are allowed', () => {
    const origins: RpcOrigins = {
      dapps: true,
      snaps: true,
    };

    expect(isOriginAllowed(origins, SubjectType.Snap, 'foo')).toBe(true);
    expect(isOriginAllowed(origins, SubjectType.Website, 'bar')).toBe(true);
  });

  it('returns `true` if the origin is `metamask`', () => {
    const origins: RpcOrigins = {
      dapps: false,
      snaps: false,
    };

    // In reality we would fallback to SubjectType.Website in this case
    expect(isOriginAllowed(origins, SubjectType.Website, 'metamask')).toBe(
      true,
    );
  });

  it('returns `false` if no origins are allowed', () => {
    const origins: RpcOrigins = {
      dapps: false,
      snaps: false,
    };

    expect(isOriginAllowed(origins, SubjectType.Snap, 'foo')).toBe(false);
    expect(isOriginAllowed(origins, SubjectType.Website, 'bar')).toBe(false);
  });

  it('returns `true` if the origin is allowed', () => {
    const origins: RpcOrigins = {
      allowedOrigins: ['foo', 'bar'],
    };

    expect(isOriginAllowed(origins, SubjectType.Snap, 'bar')).toBe(true);
    expect(isOriginAllowed(origins, SubjectType.Website, 'foo')).toBe(true);
  });

  it('returns `false` if the origin is not allowed', () => {
    const origins: RpcOrigins = {
      allowedOrigins: [],
    };

    expect(isOriginAllowed(origins, SubjectType.Snap, 'foo')).toBe(false);
    expect(isOriginAllowed(origins, SubjectType.Website, 'bar')).toBe(false);
  });
});

describe('assertIsJsonRpcSuccess', () => {
  it.each([
    {
      id: 1,
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: '1',
      jsonrpc: '2.0',
      result: {
        foo: 'bar',
      },
    },
    {
      id: 'foo',
      jsonrpc: '2.0',
      result: null,
    },
    {
      id: 1,
      jsonrpc: '2.0',
      result: [
        {
          foo: 'bar',
        },
      ],
    },
  ])(
    'does not throw if the value is a JSON-RPC success response',
    (response) => {
      expect(() => {
        assertIsJsonRpcSuccess(response);
      }).not.toThrow();
    },
  );

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    {
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: 1,
      result: 'foo',
    },
    {
      id: 1,
      jsonrpc: '2.0',
    },
    {
      id: 1,
      jsonrpc: '1.0',
      result: 'foo',
    },
    {
      id: 1,
      jsonrpc: 2.0,
      result: 'foo',
    },
    {
      id: 1,
      jsonrpc: '2.0',
      result: undefined,
    },
    {
      id: {},
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: [],
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: true,
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: false,
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: undefined,
      jsonrpc: '2.0',
      result: 'foo',
    },
  ])('throws if the value is not a JSON-RPC success response', (response) => {
    expect(() => {
      assertIsJsonRpcSuccess(response);
    }).toThrow('Invalid JSON-RPC response.');
  });

  it('throws the message if the value is a JSON-RPC error response', () => {
    expect(() => {
      assertIsJsonRpcSuccess({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -1, message: 'foo' },
      });
    }).toThrow('JSON-RPC request failed: foo');
  });
});
