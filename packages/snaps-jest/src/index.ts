// eslint-disable-next-line import-x/no-unassigned-import
import './global';

export { default, default as TestEnvironment } from './environment';
export * from './helpers';
export * from './options';

export {
  assertCustomDialogHasNoFooter,
  assertCustomDialogHasPartialFooter,
  assertIsAlertDialog,
  assertIsConfirmationDialog,
  assertIsCustomDialog,
  assertIsPromptDialog,
} from '@metamask/snaps-simulation';

export type {
  CronjobOptions,
  DefaultSnapInterface,
  DefaultSnapInterfaceWithFooter,
  DefaultSnapInterfaceWithPartialFooter,
  DefaultSnapInterfaceWithoutFooter,
  FileOptions,
  RequestOptions,
  SignatureOptions,
  Snap,
  SnapAlertInterface,
  SnapConfirmationInterface,
  SnapHandlerInterface,
  SnapInterface,
  SnapInterfaceActions,
  SnapOptions,
  SnapPromptInterface,
  SnapResponse,
  SnapResponseType,
  SnapResponseWithInterface,
  SnapResponseWithoutInterface,
  SnapRequest,
  SnapRequestObject,
  TransactionOptions,
} from '@metamask/snaps-simulation';
