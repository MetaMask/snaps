import type { Json, JsonRpcRequest, JsonRpcResponse } from '@metamask/utils';
declare type Request = {
    origin: string;
    request?: JsonRpcRequest;
};
declare type Response = JsonRpcResponse<Json>;
export declare const INITIAL_STATE: {
    request: {
        origin: string;
    };
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
export declare const jsonRpc: import("redux").Reducer<import("../slice").HandlerState<Request, Response>, import("redux").AnyAction>;
export declare const setJsonRpcRequest: import("@reduxjs/toolkit").ActionCreatorWithPayload<Request, `${string}/setRequest`>, setJsonRpcRequestFromHistory: import("@reduxjs/toolkit").ActionCreatorWithPayload<Request, `${string}/setRequestFromHistory`>, setJsonRpcResponse: import("@reduxjs/toolkit").ActionCreatorWithPayload<Response, `${string}/setResponse`>, clearJsonRpcResponse: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/clearResponse`>;
export declare const getJsonRpcRequest: ((state: {
    onRpcRequest: ReturnType<(typeof slice)['getInitialState']>;
}) => Request) & import("reselect").OutputSelectorFields<(args_0: import("../slice").HandlerState<Request, Response>) => Request, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export {};
