import type {
  GenericPermissionController,
  SubjectMetadataController,
} from '@metamask/permission-controller';
import type { DialogType } from '@metamask/rpc-methods';
import type { IframeExecutionService } from '@metamask/snaps-controllers';
import type { Component } from '@metamask/snaps-ui';
import type {
  SnapManifest,
  SnapRpcHookArgs,
  VirtualFile,
} from '@metamask/snaps-utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  createAction,
  createSelector,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit';

export enum SnapStatus {
  Ok = 'ok',
  Loading = 'loading',
  Error = 'error',
}

export type HandlerUserInterface = {
  type: DialogType;
  snapId: string;
  snapName: string;
  node: Component;
};

type SimulationState = {
  status: SnapStatus;
  executionService: IframeExecutionService | null;
  permissionController: GenericPermissionController | null;
  subjectMetadataController: SubjectMetadataController | null;
  manifest: VirtualFile<SnapManifest> | null;
  sourceCode: VirtualFile<string> | null;
  icon?: VirtualFile<string>;
  ui?: HandlerUserInterface | null;
  snapState: string | null;
  requestId?: string;
};

export const INITIAL_STATE: SimulationState = {
  status: SnapStatus.Loading,
  executionService: null,
  permissionController: null,
  subjectMetadataController: null,
  manifest: null,
  sourceCode: null,
  snapState: null,
};

const slice = createSlice({
  name: 'simulation',
  initialState: INITIAL_STATE,
  reducers: {
    setStatus(state, action: PayloadAction<SnapStatus>) {
      state.status = action.payload;
    },
    setExecutionService(state, action: PayloadAction<IframeExecutionService>) {
      state.executionService = action.payload as any;
    },
    setPermissionController(
      state,
      action: PayloadAction<GenericPermissionController>,
    ) {
      state.permissionController = action.payload as any;
    },
    setSubjectMetadataController(
      state,
      action: PayloadAction<SubjectMetadataController>,
    ) {
      state.subjectMetadataController = action.payload as any;
    },
    setManifest(state, action: PayloadAction<VirtualFile<SnapManifest>>) {
      // Type error occurs here due to some weirdness with SnapManifest and WritableDraft or PayloadAction
      state.manifest = action.payload as any;
    },
    setSourceCode(state, action: PayloadAction<VirtualFile<string>>) {
      state.sourceCode = action.payload;
    },
    setIcon(state, action: PayloadAction<VirtualFile<string>>) {
      state.icon = action.payload;
    },
    showUserInterface: (state, action: PayloadAction<HandlerUserInterface>) => {
      state.ui = action.payload;
    },
    closeUserInterface: (state) => {
      state.ui = null;
    },
    setSnapState: (state, action: PayloadAction<string | null>) => {
      state.snapState = action.payload;
    },
    sendRequest: (state, _: PayloadAction<SnapRpcHookArgs>) => {
      state.requestId = nanoid();
    },
  },
});

export const resolveUserInterface = createAction<unknown>(
  `${slice.name}/resolveUserInterface`,
);

export const {
  setStatus,
  setExecutionService,
  setPermissionController,
  setSubjectMetadataController,
  setManifest,
  setSourceCode,
  setIcon,
  showUserInterface,
  closeUserInterface,
  setSnapState,
  sendRequest,
} = slice.actions;

export const simulation = slice.reducer;

export const getStatus = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.status,
);

export const getExecutionService = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.executionService,
);

export const getPermissionController = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.permissionController,
);

export const getSubjectMetadataController = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.subjectMetadataController,
);

export const getSnapName = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.manifest?.result.proposedName,
);

export const getIcon = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.icon,
);

export const getUserInterface = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.ui,
);

export const getSnapStateSelector = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.snapState,
);

export const getSnapManifest = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.manifest?.result,
);

export const getSourceCode = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.sourceCode,
);

export const getRequestId = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.requestId,
);
