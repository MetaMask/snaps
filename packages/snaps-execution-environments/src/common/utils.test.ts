import {
  BLOCKED_RPC_METHODS,
  assertEthereumOutboundRequest,
  assertSnapOutboundRequest,
} from './utils';

describe('assertSnapOutboundRequest', () => {
  it('allows wallet_ and snap_ prefixed RPC methods', () => {
    expect(() =>
      assertSnapOutboundRequest({ method: 'snap_notify' }),
    ).not.toThrow();
    expect(() =>
      assertSnapOutboundRequest({ method: 'wallet_getPermissions' }),
    ).not.toThrow();
  });

  it('disallows eth_ prefixed methods', () => {
    expect(() =>
      assertSnapOutboundRequest({ method: 'eth_blockNumber' }),
    ).toThrow(
      'The global Snap API only allows RPC methods starting with `wallet_*` and `snap_*`.',
    );
  });

  it.each(
    BLOCKED_RPC_METHODS.filter(
      (method) => method.startsWith('wallet_') || method.startsWith('snap_'),
    ),
  )('disallows %s', (method) => {
    expect(() => assertSnapOutboundRequest({ method })).toThrow(
      'The method does not exist / is not available.',
    );
  });

  it('throws for invalid JSON values', () => {
    expect(() =>
      assertSnapOutboundRequest({
        method: 'snap_notify',
        params: [undefined],
      }),
    ).toThrow(
      'Provided value is not JSON-RPC compatible: Expected the value to satisfy a union of `literal | boolean | finite number | string | array | record`, but received: [object Object].',
    );
  });
});

describe('assertEthereumOutboundRequest', () => {
  it('allows wallet_ and eth_ prefixed RPC methods', () => {
    expect(() =>
      assertEthereumOutboundRequest({ method: 'eth_blockNumber' }),
    ).not.toThrow();
    expect(() =>
      assertEthereumOutboundRequest({ method: 'wallet_getPermissions' }),
    ).not.toThrow();
  });

  it('disallows snaps_ prefixed methods', () => {
    expect(() =>
      assertEthereumOutboundRequest({ method: 'snap_notify' }),
    ).toThrow('The method does not exist / is not available.');
  });

  it.each(BLOCKED_RPC_METHODS)('disallows %s', (method) => {
    expect(() => assertEthereumOutboundRequest({ method })).toThrow(
      'The method does not exist / is not available.',
    );
  });

  it('throws for invalid JSON values', () => {
    expect(() =>
      assertEthereumOutboundRequest({
        method: 'eth_blockNumber',
        params: [undefined],
      }),
    ).toThrow(
      'Provided value is not JSON-RPC compatible: Expected the value to satisfy a union of `literal | boolean | finite number | string | array | record`, but received: [object Object].',
    );
  });
});
