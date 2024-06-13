import type {
  GenericPermissionController,
  SubjectMetadataController,
} from '@metamask/permission-controller';
import type {
  IframeExecutionService,
  SnapInterfaceController,
  StoredInterface,
} from '@metamask/snaps-controllers';
import type { DialogType, InterfaceState } from '@metamask/snaps-sdk';
import { getLocalizedSnapManifest as localizeSnapManifest } from '@metamask/snaps-utils';
import type {
  LocalizationFile,
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
  id: string;
};

export type SnapInterface = StoredInterface & { id: string };

type SimulationState = {
  status: SnapStatus;
  executionService: IframeExecutionService | null;
  permissionController: GenericPermissionController | null;
  subjectMetadataController: SubjectMetadataController | null;
  snapInterfaceController: SnapInterfaceController | null;
  manifest: VirtualFile<SnapManifest> | null;
  sourceCode: VirtualFile<string> | null;
  auxiliaryFiles: VirtualFile[] | null;
  localizationFiles: VirtualFile<LocalizationFile>[] | null;
  icon?: VirtualFile<string>;
  ui?: HandlerUserInterface | null;
  snapInterface?: SnapInterface | null;
  snapState: string | null;
  unencryptedSnapState: string | null;
  requestId?: string;
};

export const INITIAL_STATE: SimulationState = {
  status: SnapStatus.Loading,
  executionService: null,
  permissionController: null,
  subjectMetadataController: null,
  snapInterfaceController: null,
  manifest: null,
  sourceCode: null,
  auxiliaryFiles: null,
  localizationFiles: null,
  snapState: null,
  unencryptedSnapState: null,
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
    setSnapInterfaceController(
      state,
      action: PayloadAction<SnapInterfaceController>,
    ) {
      state.snapInterfaceController = action.payload as any;
    },
    setManifest(state, action: PayloadAction<VirtualFile<SnapManifest>>) {
      // Type error occurs here due to some weirdness with SnapManifest and WritableDraft or PayloadAction
      state.manifest = action.payload as any;
    },
    setSourceCode(state, action: PayloadAction<VirtualFile<string>>) {
      state.sourceCode = action.payload;
    },
    setAuxiliaryFiles(state, action: PayloadAction<VirtualFile[]>) {
      state.auxiliaryFiles = action.payload;
    },
    setLocalizationFiles(
      state,
      action: PayloadAction<VirtualFile<LocalizationFile>[]>,
    ) {
      state.localizationFiles = action.payload;
    },
    setIcon(state, action: PayloadAction<VirtualFile<string>>) {
      state.icon = action.payload;
    },
    setSnapInterface: (state, action: PayloadAction<SnapInterface>) => {
      // @ts-expect-error `immer` does not work well with generic types.
      state.snapInterface = action.payload;
    },
    setSnapInterfaceState: (state, action: PayloadAction<InterfaceState>) => {
      if (state.snapInterface) {
        state.snapInterface.state = action.payload;
      }
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
    setUnencryptedSnapState: (state, action: PayloadAction<string | null>) => {
      state.unencryptedSnapState = action.payload;
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
  setSnapInterfaceController,
  setManifest,
  setSourceCode,
  setIcon,
  setAuxiliaryFiles,
  setLocalizationFiles,
  setSnapInterface,
  setSnapInterfaceState,
  showUserInterface,
  closeUserInterface,
  setSnapState,
  setUnencryptedSnapState,
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

export const getSnapInterfaceController = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.snapInterfaceController,
);

export const getSnapInterface = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.snapInterface,
);

export const getSnapInterfaceContent = createSelector(
  [getSnapInterface],
  (snapInterface) => snapInterface?.content,
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

export const getUnencryptedSnapStateSelector = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.unencryptedSnapState,
);

export const getSnapManifest = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.manifest?.result,
);

export const getLocalizedSnapManifest = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  ({ manifest, localizationFiles }) =>
    manifest?.result &&
    localizeSnapManifest(
      manifest.result,
      'en',
      localizationFiles?.map((file) => file.result) ?? [],
    ),
);

export const getSourceCode = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.sourceCode,
);

export const getAuxiliaryFiles = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.auxiliaryFiles,
);

export const getLocalizationFiles = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.localizationFiles,
);

export const getRequestId = createSelector(
  (state: { simulation: typeof INITIAL_STATE }) => state.simulation,
  (state) => state.requestId,
);
