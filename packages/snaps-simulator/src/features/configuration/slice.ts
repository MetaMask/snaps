import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

export const DEFAULT_SRP =
  'test test test test test test test test test test test ball';

export const INITIAL_CONFIGURATION_STATE = {
  open: false,
  snapId: 'local:http://localhost:8080',
  snapVersion: undefined as string | undefined,
  srp: DEFAULT_SRP,
  sesEnabled: true,
};

const slice = createSlice({
  name: 'configuration',
  initialState: INITIAL_CONFIGURATION_STATE,
  reducers: {
    openConfigurationModal(state) {
      state.open = true;
    },
    setOpen(state, action: PayloadAction<boolean>) {
      state.open = action.payload;
    },
    setSnapId(state, action: PayloadAction<string>) {
      state.snapId = action.payload;
    },
    setSnapVersion(state, action: PayloadAction<string | undefined>) {
      state.snapVersion = action.payload;
    },
    setSrp(state, action: PayloadAction<string>) {
      state.srp = action.payload;
    },
    setSesEnabled(state, action: PayloadAction<boolean>) {
      state.sesEnabled = action.payload;
    },
  },
});

export const {
  openConfigurationModal,
  setOpen,
  setSnapId,
  setSnapVersion,
  setSrp,
  setSesEnabled,
} = slice.actions;
export const configuration = slice.reducer;

export const getOpen = createSelector(
  (state: { configuration: typeof INITIAL_CONFIGURATION_STATE }) =>
    state.configuration,
  (state) => state.open,
);

export const getSnapId = createSelector(
  (state: { configuration: typeof INITIAL_CONFIGURATION_STATE }) =>
    state.configuration,
  (state) => state.snapId,
);

export const getSnapVersion = createSelector(
  (state: { configuration: typeof INITIAL_CONFIGURATION_STATE }) =>
    state.configuration,
  (state) => state.snapVersion,
);

export const getSrp = createSelector(
  (state: { configuration: typeof INITIAL_CONFIGURATION_STATE }) =>
    state.configuration,
  (state) => state.srp,
);

export const getSesEnabled = createSelector(
  (state: { configuration: typeof INITIAL_CONFIGURATION_STATE }) =>
    state.configuration,
  (state) => state.sesEnabled,
);
