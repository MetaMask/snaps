import { MetaMaskInpageProvider } from '@metamask/providers';
import { RequestArguments } from '@metamask/snaps-utils';
import { Json, JsonRpcParams } from '@metamask/utils';
import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

type ApiResponse<Type> = {
  status: 'success' | 'error';
  data: Type;
};

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
    console.error(error);

    return { error };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getSourceCode: builder.query<string, undefined>({
      query: () => '/snaps',
      transformResponse(value: ApiResponse<{ bundle: string }>) {
        return value.data.bundle;
      },
    }),
    setSourceCode: builder.mutation({
      query: (sourceCode) => ({
        url: '/snaps',
        method: 'POST',
        body: { sourceCode },
      }),
    }),
  }),
});

export type GetSnapsResult = Record<
  string,
  { error?: string; version: string }
>;

export type InvokeSnapArgs = {
  snapId: string;
  method: string;
  params?: JsonRpcParams;
  // tags?: Tag[];
};

export type InvokeSnapResult = Json;

export const snapsApi = createApi({
  reducerPath: 'snapsApi',
  baseQuery: request,
  tagTypes: ['Snaps'],
  endpoints: (builder) => ({
    getSnaps: builder.query<GetSnapsResult, undefined>({
      providesTags: ['Snaps'],
      query: () => ({
        method: 'wallet_getSnaps',
      }),
    }),

    installSnap: builder.mutation<undefined, number>({
      invalidatesTags: ['Snaps'],
      query: (amount) => {
        const snapIds = new Array(amount)
          .fill(0)
          .map((_, index) => [`local:http://localhost:${index + 9000}`, {}]);

        return {
          method: 'wallet_requestSnaps',
          params: Object.fromEntries(snapIds),
        };
      },
    }),

    invokeSnap: builder.mutation<InvokeSnapResult, InvokeSnapArgs>({
      query: ({ snapId, method, params }) => ({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request: {
            method,
            params: params ?? [],
          },
        },
      }),
    }),
  }),
});

export const { useGetSourceCodeQuery, useSetSourceCodeMutation } = api;
export const {
  useGetSnapsQuery,
  useInstallSnapMutation,
  useInvokeSnapMutation,
} = snapsApi;
