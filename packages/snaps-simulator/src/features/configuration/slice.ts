import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export const DEFAULT_SRP =
  'test test test test test test test test test test test ball';

export const INITIAL_CONFIGURATION_STATE = {
  open: false,
  snapUrl: 'http://localhost:8080',
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
    setSnapUrl(state, action: PayloadAction<string>) {
      state.snapUrl = action.payload;
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
  setSnapUrl,
  setSrp,
  setSesEnabled,
} = slice.actions;
export const configuration = slice.reducer;

export const getOpen = createSelector(
  (state: { configuration: typeof INITIAL_CONFIGURATION_STATE }) =>
    state.configuration,
  (state) => state.open,
);

export const getSnapUrl = createSelector(
  (state: { configuration: typeof INITIAL_CONFIGURATION_STATE }) =>
    state.configuration,
  (state) => state.snapUrl,
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
