import type { JsonRpcRequest, JsonRpcResponse, Json } from '@metamask/utils';
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
export declare const cronjob: import("redux").Reducer<import("../slice").HandlerState<Request, Response>, import("redux").AnyAction>;
export declare const setCronjobRequest: import("@reduxjs/toolkit").ActionCreatorWithPayload<Request, `${string}/setRequest`>, setCronjobRequestFromHistory: import("@reduxjs/toolkit").ActionCreatorWithPayload<Request, `${string}/setRequestFromHistory`>, setCronjobResponse: import("@reduxjs/toolkit").ActionCreatorWithPayload<Response, `${string}/setResponse`>, clearCronjobResponse: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/clearResponse`>;
export declare const getCronjobRequest: ((state: {
    onCronjob: ReturnType<(typeof slice)['getInitialState']>;
}) => Request) & import("reselect").OutputSelectorFields<(args_0: import("../slice").HandlerState<Request, Response>) => Request, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export {};
