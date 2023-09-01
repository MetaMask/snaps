import type { MetaMaskInpageProvider } from '@metamask/providers';
import type { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { logError } from '@metamask/snaps-utils';
import type { JsonRpcError, JsonRpcParams } from '@metamask/utils';
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { createApi } from '@reduxjs/toolkit/query/react';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export enum Tag {
  Accounts = 'Accounts',
  InstalledSnaps = 'Installed Snaps',
  TestState = 'Test State',
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
    const data = await window.ethereum.request({ method, params });

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
        transformResponse: (snaps: InstallSnapResult, _, { snapId }) => {
          if (snaps[snapId].error) {
            logError(snaps[snapId].error);
            throw new Error(snaps[snapId].error.message);
          }

          return snaps;
        },
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
} = baseApi;
