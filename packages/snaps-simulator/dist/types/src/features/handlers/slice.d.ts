import type { PayloadAction } from '@reduxjs/toolkit';
export declare type HandlerSliceOptions<Request, Response> = {
    name: string;
    initialState: HandlerState<Request, Response>;
};
export declare type HistoryEntry<Request> = {
    date: Date;
    request: Request;
};
export declare type HandlerState<Request, Response> = {
    request: Request;
    response: Response | null;
    history: HistoryEntry<Request>[];
    pending?: boolean;
};
/**
 * Create a slice for a handler.
 *
 * @param options - Options for the slice.
 * @param options.name - The name of the slice.
 * @param options.initialState - The initial state of the slice.
 * @returns The slice.
 */
export declare function createHandlerSlice<Request, Response>({ name, initialState, }: HandlerSliceOptions<Request, Response>): import("@reduxjs/toolkit").Slice<HandlerState<Request, Response>, {
    setRequest: (state: import("immer/dist/internal").WritableDraft<HandlerState<Request, Response>>, action: PayloadAction<Request>) => void;
    setRequestFromHistory: (state: import("immer/dist/internal").WritableDraft<HandlerState<Request, Response>>, action: PayloadAction<Request>) => void;
    setResponse: (state: import("immer/dist/internal").WritableDraft<HandlerState<Request, Response>>, action: PayloadAction<Response>) => void;
    clearResponse: (state: import("immer/dist/internal").WritableDraft<HandlerState<Request, Response>>) => void;
}, string>;
