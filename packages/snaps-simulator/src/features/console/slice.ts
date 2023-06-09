import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ConsoleEntryType {
  Log,
  Error,
}

export type ConsoleEntry = {
  date: number;
  type: ConsoleEntryType;
  message: string;
};

const INITIAL_STATE = {
  entries: [] as ConsoleEntry[],
};

const slice = createSlice({
  name: 'console',
  initialState: INITIAL_STATE,
  reducers: {
    addDefault(state, action: PayloadAction<string>) {
      state.entries.push({
        date: Date.now(),
        type: ConsoleEntryType.Log,
        message: action.payload,
      });
    },
    addError(state, action: PayloadAction<Error>) {
      state.entries.push({
        date: Date.now(),
        type: ConsoleEntryType.Error,
        message: action.payload.stack ?? action.payload.message,
      });
    },
  },
});

export const { addDefault, addError } = slice.actions;
export const console = slice.reducer;

export const getConsoleEntries = createSelector(
  (state: { console: typeof INITIAL_STATE }) => state.console,
  (state) => state.entries,
);
