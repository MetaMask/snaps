import type { JsonRpcRequest, JsonRpcResponse, Json } from '@metamask/utils';
declare type Request = {
    request?: JsonRpcRequest<{
        chainId: string;
        transaction: Record<string, any>;
        transactionOrigin?: string;
    }>;
};
declare type Response = JsonRpcResponse<Json>;
export declare const INITIAL_STATE: {
    request: {};
    response: null;
    history: never[];
};
declare const slice: import("@reduxjs/toolkit").Slice<import("../slice").HandlerState<Request, Response>, {
    setRequest: (state: import("immer/dist/internal").WritableDraft<import("../slice").HandlerState<Request, Response>>, action: {
        payload: Request;
        type: string;
    }) => void;
    setRequestFromHistory: (state: import("immer/dist/internal").WritableDraft<import("../slice").HandlerState<Request, Response>>, action: {
        payload: Request;
        type: string;
    }) => void;
    setResponse: (state: import("immer/dist/internal").WritableDraft<import("../slice").HandlerState<Request, Response>>, action: {
        payload: Response;
        type: string;
    }) => void;
    clearResponse: (state: import("immer/dist/internal").WritableDraft<import("../slice").HandlerState<Request, Response>>) => void;
}, string>;
export declare const transactions: import("redux").Reducer<import("../slice").HandlerState<Request, Response>, import("redux").AnyAction>;
export declare const setTransactionRequest: import("@reduxjs/toolkit").ActionCreatorWithPayload<Request, `${string}/setRequest`>, setTransactionRequestFromHistory: import("@reduxjs/toolkit").ActionCreatorWithPayload<Request, `${string}/setRequestFromHistory`>, setTransactionResponse: import("@reduxjs/toolkit").ActionCreatorWithPayload<Response, `${string}/setResponse`>, clearTransactionResponse: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/clearResponse`>;
export declare const getTransactionRequest: ((state: {
    onTransaction: ReturnType<(typeof slice)['getInitialState']>;
}) => Request) & import("reselect").OutputSelectorFields<(args_0: import("../slice").HandlerState<Request, Response>) => Request, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export {};
