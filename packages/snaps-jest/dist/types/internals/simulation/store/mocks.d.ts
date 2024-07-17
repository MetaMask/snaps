import type { Json } from '@metamask/utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ApplicationState } from './store';
export declare type JsonRpcMock = {
    method: string;
    result: Json;
};
export declare type MocksState = {
    jsonRpc: Record<string, Json>;
};
export declare const mocksSlice: import("@reduxjs/toolkit").Slice<MocksState, {
    addJsonRpcMock: (state: import("immer/dist/internal").WritableDraft<MocksState>, action: PayloadAction<JsonRpcMock>) => void;
    removeJsonRpcMock: (state: import("immer/dist/internal").WritableDraft<MocksState>, action: PayloadAction<string>) => void;
}, "mocks">;
export declare const addJsonRpcMock: import("@reduxjs/toolkit").ActionCreatorWithPayload<JsonRpcMock, "mocks/addJsonRpcMock">, removeJsonRpcMock: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "mocks/removeJsonRpcMock">;
/**
 * Get the JSON-RPC mocks from the state.
 *
 * @param state - The application state.
 * @returns The JSON-RPC mocks.
 */
export declare const getJsonRpcMocks: (state: ApplicationState) => Record<string, Json>;
/**
 * Get the JSON-RPC mock for a given method from the state.
 */
export declare const getJsonRpcMock: ((state: {
    mocks: MocksState;
    notifications: import("./notifications").NotificationsState;
    state: import("./state").State;
    ui: import("./ui").UiState;
}, method: string) => Json) & import("reselect").OutputSelectorFields<(args_0: Record<string, Json>, args_1: string) => Json, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
