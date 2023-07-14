import type { SnapManifest, VirtualFile } from '@metamask/snaps-utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSelector, createSlice } from '@reduxjs/toolkit';

import type { Validator } from './validators';

export enum ManifestStatus {
  Valid = 'valid',
  Invalid = 'invalid',
  Unknown = 'unknown',
}

export type ValidationResult = Omit<Validator, 'validator'> & {
  isValid: boolean;
  message?: string | undefined;
};

export type ManifestState = {
  valid: ManifestStatus;
  results: ValidationResult[];
};

export const INITIAL_MANIFEST_STATE: ManifestState = {
  valid: ManifestStatus.Unknown,
  results: [],
};

const slice = createSlice({
  name: 'manifest',
  initialState: INITIAL_MANIFEST_STATE,
  reducers: {
    setValid(state, action: PayloadAction<ManifestStatus>) {
      state.valid = action.payload;
    },
    setResults(state, action: PayloadAction<ValidationResult[]>) {
      state.results = action.payload;
    },
  },
});

export const validateManifest = createAction<VirtualFile<SnapManifest>>(
  `${slice.name}/validateManifest`,
);

export const { setValid, setResults } = slice.actions;
export const manifest = slice.reducer;

export const getManifestStatus = createSelector(
  (state: { manifest: ManifestState }) => state.manifest,
  (state) => state.valid,
);

export const getManifestResults = createSelector(
  (state: { manifest: ManifestState }) => state.manifest,
  (state) => state.results,
);
