import type { DialogApprovalTypes } from '@metamask/snaps-rpc-methods';
import type { DialogType } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
export declare type Interface = {
    type: DialogApprovalTypes[DialogType];
    id: string;
};
export declare type UiState = {
    current?: Interface | null;
};
export declare const uiSlice: import("@reduxjs/toolkit").Slice<UiState, {
    setInterface(state: import("immer/dist/internal").WritableDraft<UiState>, action: PayloadAction<Interface>): void;
    closeInterface(state: import("immer/dist/internal").WritableDraft<UiState>): void;
}, "ui">;
export declare const resolveInterface: import("@reduxjs/toolkit").ActionCreatorWithNonInferrablePayload<string>;
export declare const setInterface: import("@reduxjs/toolkit").ActionCreatorWithPayload<Interface, "ui/setInterface">, closeInterface: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/closeInterface">;
export declare const getCurrentInterface: ((state: {
    mocks: import("./mocks").MocksState;
    notifications: import("./notifications").NotificationsState;
    state: import("./state").State;
    ui: UiState;
}) => Interface | null | undefined) & import("reselect").OutputSelectorFields<(args_0: UiState) => Interface | null | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
