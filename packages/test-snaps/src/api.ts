import type {
  EIP6963AnnounceProviderEvent,
  EIP6963RequestProviderEvent,
  MetaMaskInpageProvider,
  RequestArguments,
} from '@metamask/providers';
import { logError } from '@metamask/snaps-utils';
import { assert, type JsonRpcError, type JsonRpcParams } from '@metamask/utils';
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { createApi } from '@reduxjs/toolkit/query/react';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: MetaMaskInpageProvider & {
      setProvider?: (provider: MetaMaskInpageProvider) => void;
      detected?: MetaMaskInpageProvider[];
      providers?: MetaMaskInpageProvider[];
    };
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    'eip6963:requestProvider': EIP6963RequestProviderEvent;
    'eip6963:announceProvider': EIP6963AnnounceProviderEvent;
  }
}

export enum Tag {
  Accounts = 'Accounts',
  EntropySources = 'Entropy Sources',
  InstalledSnaps = 'Installed Snaps',
  TestState = 'Test State',
  UnencryptedTestState = 'Unencrypted Test State',
}

/**
 * Check if the current provider supports snaps by calling `wallet_getSnaps`.
 *
 * @param provider - The provider to use to check for snaps support. Defaults to
 * `window.ethereum`.
 * @returns True if the provider supports snaps, false otherwise.
 */
async function hasSnapsSupport(
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
async function getMetaMaskEIP6963Provider() {
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
     */
    function onAnnounceProvider(event: EIP6963AnnounceProviderEvent) {
      const { info, provider } = event.detail;

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
async function getSnapsProvider() {
  if (typeof window === 'undefined') {
    return null;
  }

  const eip6963Provider = await getMetaMaskEIP6963Provider();

  if (eip6963Provider && (await hasSnapsSupport(eip6963Provider))) {
    return eip6963Provider;
  }

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

  return null;
}

/**
 * Base request function for all API calls.
 *
 * @param args - The request arguments.
 * @param args.method - The RPC method to call.
 * @param args.params - The parameters to pass to the RPC method.
 * @returns The response from the RPC method.
 */
export const request: BaseQueryFn<RequestArguments> = async ({
  method,
  params,
}) => {
  try {
    const provider = await getSnapsProvider();

    assert(provider, 'No Ethereum provider found.');

    const data = await provider.request({ method, params });

    return { data };
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(error.message ?? error.toString());
    logError(error);

    return { error };
  }
};

export type GetSnapsResult = Record<
  string,
  { error?: string; version: string }
>;

export type InvokeSnapArgs = {
  snapId: string;
  method: string;
  params?: JsonRpcParams;
  tags?: Tag[];
};

export type InvokeSnapResult = unknown;

export type InstallSnapArgs = {
  snapId: string;
  version: string;
};

export type InstallSnapsArgs = Record<string, { version?: string }>;

export type InstallSnapResult = Record<string, { error: JsonRpcError }>;

export const baseApi = createApi({
  reducerPath: 'base',
  baseQuery: request,
  tagTypes: [Tag.Accounts, Tag.InstalledSnaps, Tag.TestState],
  endpoints(build) {
    return {
      getAccounts: build.query<string[], void>({
        query: () => ({
          method: 'eth_requestAccounts',
        }),
        providesTags: [Tag.Accounts],
      }),

      getSnaps: build.query<GetSnapsResult, void>({
        query: () => ({
          method: 'wallet_getSnaps',
        }),
        providesTags: [Tag.InstalledSnaps],
      }),

      invokeQuery: build.query<InvokeSnapResult, InvokeSnapArgs>({
        query: ({ snapId, method, params }) => ({
          method: 'wallet_invokeSnap',
          params: { snapId, request: params ? { method, params } : { method } },
        }),
        providesTags: (_result, _error, { tags = [] }) => tags,
      }),

      request: build.query<RequestArguments, unknown>({
        query: (args: RequestArguments) => args,
      }),

      invokeMutation: build.mutation<InvokeSnapResult, InvokeSnapArgs>({
        query: ({ snapId, method, params }) => ({
          method: 'wallet_invokeSnap',
          params: { snapId, request: params ? { method, params } : { method } },
        }),
        invalidatesTags: (_result, _error, { tags = [] }) => tags,
      }),

      installSnap: build.mutation<InstallSnapResult, InstallSnapArgs>({
        query: ({ snapId, version }) => ({
          method: 'wallet_requestSnaps',
          params: {
            [snapId]: {
              version,
            },
          },
        }),
        invalidatesTags: [Tag.InstalledSnaps],
      }),

      installSnaps: build.mutation<InstallSnapResult, InstallSnapsArgs>({
        query: (params) => ({
          method: 'wallet_requestSnaps',
          params,
        }),
        invalidatesTags: [Tag.InstalledSnaps],
      }),
    };
  },
});

export const {
  useGetAccountsQuery,
  useLazyGetAccountsQuery,
  useGetSnapsQuery,
  useInvokeQueryQuery: useInvokeQuery,
  useLazyRequestQuery,
  useInvokeMutationMutation: useInvokeMutation,
  useInstallSnapMutation,
  useInstallSnapsMutation,
} = baseApi;
