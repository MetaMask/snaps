// eslint-disable-next-line import/no-unassigned-import
import './global';

export { default, default as TestEnvironment } from './environment';
export * from './helpers';
export * from './options';
export * from './types';

export {
  assertCustomDialogHasNoFooter,
  assertCustomDialogHasPartialFooter,
  assertIsAlertDialog,
  assertIsConfirmationDialog,
  assertIsCustomDialog,
  assertIsPromptDialog,
} from '@metamask/snaps-simulation';
