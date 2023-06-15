import {
  assertEthereumOutboundRequest,
  assertSnapOutboundRequest,
  constructError,
} from './utils';

describe('Utils', () => {
  describe('constructError', () => {
    it('will return the original error if it is an error', () => {
      const error = constructError(new Error('unhandledrejection'));
      expect(error).toStrictEqual(new Error('unhandledrejection'));
    });

    it('will return undefined if it is not passed an Error or a string', () => {
      const error = constructError(undefined);
      expect(error).toBeUndefined();
    });

    it('will return an Error object with the message of the original error if it was a string', () => {
      const error = constructError('some reason');
      expect(error?.message).toBe('some reason');
    });
  });
});

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

  it('disallows eth_requestAccounts', () => {
    expect(() =>
      assertSnapOutboundRequest({ method: 'eth_requestAccounts' }),
    ).toThrow(
      'The global Snap API only allows RPC methods starting with `wallet_*` and `snap_*`.',
    );
  });

  it('disallows wallet_requestSnaps', () => {
    expect(() =>
      assertSnapOutboundRequest({ method: 'wallet_requestSnaps' }),
    ).toThrow('The method does not exist / is not available.');
  });

  it('disallows wallet_requestPermissions', () => {
    expect(() =>
      assertSnapOutboundRequest({ method: 'wallet_requestPermissions' }),
    ).toThrow('The method does not exist / is not available.');
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

  it('disallows wallet_requestPermissions', () => {
    expect(() =>
      assertEthereumOutboundRequest({ method: 'wallet_requestPermissions' }),
    ).toThrow('The method does not exist / is not available.');
  });

  it('disallows eth_requestAccounts', () => {
    expect(() =>
      assertEthereumOutboundRequest({ method: 'eth_requestAccounts' }),
    ).toThrow('The method does not exist / is not available.');
  });

  it('disallows wallet_requestSnaps', () => {
    expect(() =>
      assertEthereumOutboundRequest({ method: 'wallet_requestSnaps' }),
    ).toThrow('The method does not exist / is not available.');
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
