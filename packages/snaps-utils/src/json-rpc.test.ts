import { SubjectType } from '@metamask/permission-controller';
import { is } from 'superstruct';

import type { RpcOrigins } from './json-rpc';
import {
  AllowedOriginsStruct,
  assertIsJsonRpcSuccess,
  assertIsRpcOrigins,
  isOriginAllowed,
} from './json-rpc';

describe('AllowedOriginsStruct', () => {
  it.each([
    { allowedOrigins: [] },
    { allowedOrigins: ['foo'] },
    { allowedOrigins: ['foo', 'bar'] },
  ])('returns `true` for %p', (value) => {
    expect(is(value, AllowedOriginsStruct)).toBe(true);
  });

  it.each([
    {},
    { allowedOrigins: null },
    { allowedOrigins: undefined },
    { allowedOrigins: 0 },
    { allowedOrigins: 1 },
    { allowedOrigins: '' },
    { allowedOrigins: 'foo' },
    { allowedOrigins: ['foo', null] },
    { allowedOrigins: ['foo', undefined] },
    { allowedOrigins: ['foo', 0] },
    { allowedOrigins: ['foo', 1] },
    { allowedOrigins: ['foo', 'bar', null] },
    { allowedOrigins: ['foo', 'bar', undefined] },
    { allowedOrigins: ['foo', 'bar', 0] },
    { allowedOrigins: ['foo', 'bar', 1] },
  ])('returns `false` for %p', (value) => {
    expect(is(value, AllowedOriginsStruct)).toBe(false);
  });
});

describe('assertIsRpcOrigins', () => {
  it.each([
    { dapps: true },
    { snaps: true },
    { dapps: true, snaps: true },
    {
      dapps: { allowedOrigins: ['foo'] },
      snaps: { allowedOrigins: ['bar'] },
    },
    {
      dapps: { allowedOrigins: ['foo'] },
      snaps: true,
    },
    {
      dapps: true,
      snaps: { allowedOrigins: ['bar'] },
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
    { dapps: { allowedOrigins: [] }, snaps: false },
    { dapps: false, snaps: { allowedOrigins: [] } },
    { dapps: { allowedOrigins: [] }, snaps: { allowedOrigins: [] } },
    { dapps: false, snaps: false },
  ])('throws if no origins are allowed', (value) => {
    expect(() => assertIsRpcOrigins(value)).toThrow(
      'Invalid JSON-RPC origins: Must specify at least one JSON-RPC origin.',
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
      dapps: { allowedOrigins: ['foo'] },
      snaps: { allowedOrigins: ['bar'] },
    };

    expect(isOriginAllowed(origins, SubjectType.Snap, 'bar')).toBe(true);
    expect(isOriginAllowed(origins, SubjectType.Website, 'foo')).toBe(true);
  });

  it('returns `false` if the origin is not allowed', () => {
    const origins: RpcOrigins = {
      dapps: { allowedOrigins: ['foo'] },
      snaps: { allowedOrigins: ['bar'] },
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
