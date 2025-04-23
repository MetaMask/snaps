import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  getJsonRpcRequestWithDefaults,
  getMetaMaskEIP6963Provider,
  getRelativeTime,
  getSnapsProvider,
  hasSnapsSupport,
  parseJson,
} from './utils';

describe('hasSnapsSupport', () => {
  it('returns true if the provider has snaps support', async () => {
    const provider = {
      request: vi.fn().mockResolvedValue({}),
    };

    // @ts-expect-error: Mock provider.
    const result = await hasSnapsSupport(provider);
    expect(result).toBe(true);
  });

  it('returns false if the provider does not have snaps support', async () => {
    const provider = {
      request: vi.fn().mockRejectedValue(new Error('Mock error.')),
    };

    // @ts-expect-error: Mock provider.
    const result = await hasSnapsSupport(provider);
    expect(result).toBe(false);
  });
});

describe('getMetaMaskEIP6963Provider', () => {
  it('returns the MetaMask EIP-6963 provider', async () => {
    const listener = () => {
      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: {
            info: {
              rdns: ['com.example'],
              version: '1.0.0',
            },
            provider: 'not MetaMask',
          },
        }),
      );

      window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {}));

      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: {
            info: {
              rdns: ['io.metamask'],
              version: '1.0.0',
            },
            provider: 'provider',
          },
        }),
      );
    };

    window.addEventListener('eip6963:requestProvider', listener);

    const result = await getMetaMaskEIP6963Provider();
    expect(result).toBe('provider');

    window.removeEventListener('eip6963:requestProvider', listener);
  });

  it('returns `null` if no provider is found after the timeout', async () => {
    vi.useFakeTimers();

    const result = getMetaMaskEIP6963Provider();

    vi.advanceTimersByTime(1000);

    const resolvedResult = await result;
    expect(resolvedResult).toBeNull();

    vi.useRealTimers();
  });
});

describe('getSnapsProvider', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the main MetaMask provider if it supports Snaps', async () => {
    const provider = {
      request: vi.fn().mockResolvedValue({}),
    };

    vi.stubGlobal('ethereum', provider);

    const result = await getSnapsProvider();
    expect(result).toBe(provider);
  });

  it('returns the `ethereum.providers` MetaMask provider if it supports Snaps', async () => {
    const provider = {
      providers: [
        {
          request: vi.fn().mockResolvedValue({}),
        },
      ],
    };

    vi.stubGlobal('ethereum', provider);

    const result = await getSnapsProvider();
    expect(result).toBe(provider.providers[0]);
  });

  it('returns the `ethereum.detected` MetaMask provider if it supports Snaps', async () => {
    const provider = {
      detected: [
        {
          request: vi.fn().mockResolvedValue({}),
        },
      ],
    };

    vi.stubGlobal('ethereum', provider);

    const result = await getSnapsProvider();
    expect(result).toBe(provider.detected[0]);
  });

  it('returns the MetaMask EIP-6963 provider if it supports Snaps', async () => {
    const provider = {
      request: vi.fn().mockResolvedValue({}),
    };

    const listener = () => {
      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: {
            info: {
              rdns: ['io.metamask'],
              version: '1.0.0',
            },
            provider,
          },
        }),
      );
    };

    window.addEventListener('eip6963:requestProvider', listener);

    const result = await getSnapsProvider();
    expect(result).toBe(provider);

    window.removeEventListener('eip6963:requestProvider', listener);
  });

  it('returns `null` if no `ethereum.providers` provider supports Snaps', async () => {
    const provider = {
      providers: [],
    };

    vi.stubGlobal('ethereum', provider);

    const result = await getSnapsProvider();
    expect(result).toBeNull();
  });

  it('returns `null` if no `ethereum.detected` provider supports Snaps', async () => {
    const provider = {
      detected: [],
    };

    vi.stubGlobal('ethereum', provider);

    const result = await getSnapsProvider();
    expect(result).toBeNull();
  });

  it('returns `null` if no provider supports Snaps', async () => {
    const result = await getSnapsProvider();
    expect(result).toBeNull();
  });
});

describe('parseJson', () => {
  it('parses valid JSON', () => {
    const json = '{"key": "value"}';
    const result = parseJson(json);
    expect(result).toStrictEqual({ key: 'value' });
  });

  it('returns `null` for invalid JSON', () => {
    const json = '{"key": "value"';
    const result = parseJson(json);
    expect(result).toBeNull();
  });
});

describe('getJsonRpcRequestWithDefaults', () => {
  it('returns a JSON-RPC request with default values', () => {
    const json = '{"method": "eth_blockNumber"}';
    const result = getJsonRpcRequestWithDefaults(json);
    expect(result).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
    });
  });

  it('returns `null` for invalid JSON', () => {
    const json = '{"method": "eth_blockNumber"';
    const result = getJsonRpcRequestWithDefaults(json);
    expect(result).toBeNull();
  });

  it('returns `null` for non-object JSON', () => {
    const json = '42';
    const result = getJsonRpcRequestWithDefaults(json);
    expect(result).toBeNull();
  });
});

describe('getRelativeTime', () => {
  it('returns the relative time from a date', () => {
    const date = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
    const result = getRelativeTime(date);

    expect(result).toBe('5m ago');
  });

  it('returns "just now" for a recent date', () => {
    const date = new Date();
    const result = getRelativeTime(date);

    expect(result).toBe('just now');
  });

  it.each([
    [0, 'just now'],
    [1, 'just now'],
    [59, '59s ago'],
    [60, '1m ago'],
    [120, '2m ago'],
    [3_600, '1h ago'],
    [7_200, '2h ago'],
    [86_400, '1d ago'],
    [604_800, '1w ago'],
    [2_592_000, '1mo ago'],
    [31_536_000, '1y ago'],
    [63_072_000, '2y ago'],
  ])(
    'returns the correct relative time for %d seconds',
    (seconds, expected) => {
      const date = new Date(Date.now() - seconds * 1000);
      const result = getRelativeTime(date);

      expect(result).toBe(expected);
    },
  );
});
