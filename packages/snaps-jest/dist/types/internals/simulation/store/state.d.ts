import type { PayloadAction } from '@reduxjs/toolkit';
/**
 * The Snap state object.
 *
 * @property encrypted - The encrypted state. Can be null if the Snap does not
 * have an encrypted state.
 * @property unencrypted - The unencrypted state. Can be null if the Snap does
 * not have an unencrypted state.
 */
export declare type State = {
    encrypted: string | null;
    unencrypted: string | null;
};
/**
 * The state slice, which stores the state of the Snap.
 */
export declare const stateSlice: import("@reduxjs/toolkit").Slice<State, {
    setState: (state: import("immer/dist/internal").WritableDraft<State>, action: {
        payload: {
            state: string | null;
            encrypted: boolean;
        };
        type: string;
    }) => import("immer/dist/internal").WritableDraft<State>;
    clearState: (state: import("immer/dist/internal").WritableDraft<State>, action: PayloadAction<{
        encrypted: boolean;
    }>) => import("immer/dist/internal").WritableDraft<State>;
}, "state">;
export declare const setState: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    state: string | null;
    encrypted: boolean;
}, "state/setState">, clearState: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    encrypted: boolean;
}, "state/clearState">;
/**
 * Get the state from the store.
 *
 * @param encrypted - Whether to get the encrypted or unencrypted state.
 * @returns A selector that returns the state.
 */
export declare function getState(encrypted: boolean): ((state: {
    mocks: import("./mocks").MocksState;
    notifications: import("./notifications").NotificationsState;
    state: State;
    ui: import("./ui").UiState;
}) => string | null) & import("reselect").OutputSelectorFields<(args_0: {
    mocks: import("./mocks").MocksState;
    notifications: import("./notifications").NotificationsState;
    state: State;
    ui: import("./ui").UiState;
}) => string | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
