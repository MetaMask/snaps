import type {
  EIP6963AnnounceProviderEvent,
  MetaMaskInpageProvider,
} from '@metamask/providers';

/**
 * Check if the current provider supports snaps by calling `wallet_getSnaps`.
 *
 * @param provider - The provider to use to check for snaps support. Defaults to
 * `window.ethereum`.
 * @returns True if the provider supports snaps, false otherwise.
 */
export async function hasSnapsSupport(
  provider: MetaMaskInpageProvider = window.ethereum,
) {
  try {
    await provider.request({
      method: 'wallet_getSnaps',
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Get a MetaMask provider using EIP6963. This will return the first provider
 * reporting as MetaMask. If no provider is found after 500ms, this will
 * return null instead.
 *
 * @returns A MetaMask provider if found, otherwise null.
 */
export async function getMetaMaskEIP6963Provider() {
  return new Promise<MetaMaskInpageProvider | null>((resolve) => {
    // Timeout looking for providers after 500ms
    const timeout = setTimeout(() => {
      resolveWithCleanup(null);
    }, 500);

    /**
     * Resolve the promise with a MetaMask provider and clean up.
     *
     * @param provider - A MetaMask provider if found, otherwise null.
     */
    function resolveWithCleanup(provider: MetaMaskInpageProvider | null) {
      window.removeEventListener(
        'eip6963:announceProvider',
        onAnnounceProvider,
      );

      clearTimeout(timeout);
      resolve(provider);
    }

    /**
     * Listener for the EIP6963 announceProvider event.
     *
     * Resolves the promise if a MetaMask provider is found.
     *
     * @param event - The EIP6963 announceProvider event.
     * @param event.detail - The details of the EIP6963 announceProvider event.
     */
    function onAnnounceProvider({ detail }: EIP6963AnnounceProviderEvent) {
      if (!detail) {
        return;
      }

      const { info, provider } = detail;

      if (info.rdns.includes('io.metamask')) {
        resolveWithCleanup(provider);
      }
    }

    window.addEventListener('eip6963:announceProvider', onAnnounceProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  });
}

/**
 * Get a provider that supports snaps. This will loop through all the detected
 * providers and return the first one that supports snaps.
 *
 * @returns The provider, or `null` if no provider supports snaps.
 */
export async function getSnapsProvider() {
  if (await hasSnapsSupport()) {
    return window.ethereum;
  }

  if (window.ethereum?.detected) {
    for (const provider of window.ethereum.detected) {
      if (await hasSnapsSupport(provider)) {
        return provider;
      }
    }
  }

  if (window.ethereum?.providers) {
    for (const provider of window.ethereum.providers) {
      if (await hasSnapsSupport(provider)) {
        return provider;
      }
    }
  }

  const eip6963Provider = await getMetaMaskEIP6963Provider();

  if (eip6963Provider && (await hasSnapsSupport(eip6963Provider))) {
    return eip6963Provider;
  }

  return null;
}

/**
 * Parse a JSON string and return the parsed object.
 *
 * @param json - The JSON string to parse.
 * @returns The parsed object, or `null` if the string is not valid JSON.
 */
export function parseJson(json: string) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Get the JSON-RPC request with default values.
 *
 * @param json - The JSON string to parse.
 * @returns The JSON-RPC request object, or `null` if the string is not valid
 * JSON.
 */
export function getJsonRpcRequestWithDefaults(json: string) {
  const parsed = parseJson(json);
  if (typeof parsed === 'object' && parsed !== null) {
    return {
      jsonrpc: '2.0',
      id: 1,
      ...parsed,
    };
  }

  return null;
}

/**
 * Get the relative time from a date. Returns a string like "2m ago" or
 * "3 days ago".
 *
 * @param date - The date to get the relative time from.
 * @param now - The current date to compare to.
 * @returns The relative time string.
 */
export function getRelativeTime(date: Date, now: Date = new Date()): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const formatter = new Intl.RelativeTimeFormat('en-US', {
    style: 'narrow',
  });

  if (seconds < 10) {
    return 'just now';
  }

  if (seconds < 60) {
    return formatter.format(-seconds, 'second');
  }

  if (minutes < 60) {
    return formatter.format(-minutes, 'minute');
  }

  if (hours < 24) {
    return formatter.format(-hours, 'hour');
  }

  if (hours < 48) {
    return formatter.format(-1, 'day');
  }

  if (days < 30) {
    return formatter.format(-weeks, 'week');
  }

  if (days < 365) {
    return formatter.format(-months, 'month');
  }

  return formatter.format(-years, 'year');
}
