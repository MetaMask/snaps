import { DialogType } from '@metamask/snaps-sdk';
import type { FooterElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert, hasProperty } from '@metamask/utils';

import { getElementByType } from './interface';
import type {
  DefaultSnapInterface,
  DefaultSnapInterfaceWithFooter,
  DefaultSnapInterfaceWithoutFooter,
  DefaultSnapInterfaceWithPartialFooter,
  SnapAlertInterface,
  SnapConfirmationInterface,
  SnapInterface,
  SnapInterfaceActions,
  SnapPromptInterface,
} from './types';

/**
 * Ensure that the actual interface is an alert dialog.
 *
 * @param ui - The interface to verify.
 */
export function assertIsAlertDialog(
  ui: SnapInterface,
): asserts ui is SnapAlertInterface & SnapInterfaceActions {
  assert(hasProperty(ui, 'type') && ui.type === DialogType.Alert);
}

/**
 * Ensure that the actual interface is a confirmation dialog.
 *
 * @param ui - The interface to verify.
 */
export function assertIsConfirmationDialog(
  ui: SnapInterface,
): asserts ui is SnapConfirmationInterface & SnapInterfaceActions {
  assert(hasProperty(ui, 'type') && ui.type === DialogType.Confirmation);
}

/**
 * Ensure that the actual interface is a Prompt dialog.
 *
 * @param ui - The interface to verify.
 */
export function assertIsPromptDialog(
  ui: SnapInterface,
): asserts ui is SnapPromptInterface & SnapInterfaceActions {
  assert(hasProperty(ui, 'type') && ui.type === DialogType.Prompt);
}

/**
 * Ensure that the actual interface is a custom dialog.
 *
 * @param ui - The interface to verify.
 */
export function assertIsCustomDialog(
  ui: SnapInterface,
): asserts ui is DefaultSnapInterface & SnapInterfaceActions {
  assert(!hasProperty(ui, 'type'));
}

/**
 * Ensure that the actual interface is a custom dialog with a complete footer.
 *
 * @param ui - The interface to verify.
 */
export function assertCustomDialogHasFooter(
  ui: DefaultSnapInterface & SnapInterfaceActions,
): asserts ui is DefaultSnapInterfaceWithFooter & SnapInterfaceActions {
  const footer = getElementByType<FooterElement>(ui.content, 'Footer');

  assert(footer && getJsxChildren(footer).length === 2);
}

/**
 * Ensure that the actual interface is a custom dialog with a partial footer.
 *
 * @param ui - The interface to verify.
 */
export function assertCustomDialogHasPartialFooter(
  ui: DefaultSnapInterface & SnapInterfaceActions,
): asserts ui is DefaultSnapInterfaceWithPartialFooter & SnapInterfaceActions {
  const footer = getElementByType<FooterElement>(ui.content, 'Footer');

  assert(footer && getJsxChildren(footer).length === 1);
}

/**
 * Ensure that the actual interface is a custom dialog without a footer.
 *
 * @param ui - The interface to verify.
 */
export function assertCustomDialogHasNoFooter(
  ui: DefaultSnapInterface & SnapInterfaceActions,
): asserts ui is DefaultSnapInterfaceWithoutFooter & SnapInterfaceActions {
  const footer = getElementByType<FooterElement>(ui.content, 'Footer');

  assert(!footer);
}
