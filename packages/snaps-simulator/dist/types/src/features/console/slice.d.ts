export declare enum ConsoleEntryType {
    Log = "log",
    Error = "error"
}
export declare type ConsoleEntry = {
    date: number;
    type: ConsoleEntryType;
    message: string;
};
declare const INITIAL_STATE: {
    entries: ConsoleEntry[];
};
export declare const addDefault: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "console/addDefault">, addError: import("@reduxjs/toolkit").ActionCreatorWithPayload<Error, "console/addError">;
export declare const console: import("redux").Reducer<{
    entries: ConsoleEntry[];
}, import("redux").AnyAction>;
export declare const getConsoleEntries: ((state: {
    console: typeof INITIAL_STATE;
}) => ConsoleEntry[]) & import("reselect").OutputSelectorFields<(args_0: {
    entries: ConsoleEntry[];
}) => ConsoleEntry[], {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export {};
