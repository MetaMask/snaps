export declare const DEFAULT_SRP = "test test test test test test test test test test test ball";
export declare const INITIAL_CONFIGURATION_STATE: {
    open: boolean;
    snapId: string;
    snapVersion: string | undefined;
    srp: string;
    sesEnabled: boolean;
};
export declare const openConfigurationModal: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"configuration/openConfigurationModal">, setOpen: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "configuration/setOpen">, setSnapId: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "configuration/setSnapId">, setSnapVersion: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<string | undefined, "configuration/setSnapVersion">, setSrp: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "configuration/setSrp">, setSesEnabled: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "configuration/setSesEnabled">;
export declare const configuration: import("redux").Reducer<{
    open: boolean;
    snapId: string;
    snapVersion: string | undefined;
    srp: string;
    sesEnabled: boolean;
}, import("redux").AnyAction>;
export declare const getOpen: ((state: {
    configuration: typeof INITIAL_CONFIGURATION_STATE;
}) => boolean) & import("reselect").OutputSelectorFields<(args_0: {
    open: boolean;
    snapId: string;
    snapVersion: string | undefined;
    srp: string;
    sesEnabled: boolean;
}) => boolean, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapId: ((state: {
    configuration: typeof INITIAL_CONFIGURATION_STATE;
}) => string) & import("reselect").OutputSelectorFields<(args_0: {
    open: boolean;
    snapId: string;
    snapVersion: string | undefined;
    srp: string;
    sesEnabled: boolean;
}) => string, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapVersion: ((state: {
    configuration: typeof INITIAL_CONFIGURATION_STATE;
}) => string | undefined) & import("reselect").OutputSelectorFields<(args_0: {
    open: boolean;
    snapId: string;
    snapVersion: string | undefined;
    srp: string;
    sesEnabled: boolean;
}) => string | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSrp: ((state: {
    configuration: typeof INITIAL_CONFIGURATION_STATE;
}) => string) & import("reselect").OutputSelectorFields<(args_0: {
    open: boolean;
    snapId: string;
    snapVersion: string | undefined;
    srp: string;
    sesEnabled: boolean;
}) => string, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSesEnabled: ((state: {
    configuration: typeof INITIAL_CONFIGURATION_STATE;
}) => boolean) & import("reselect").OutputSelectorFields<(args_0: {
    open: boolean;
    snapId: string;
    snapVersion: string | undefined;
    srp: string;
    sesEnabled: boolean;
}) => boolean, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
