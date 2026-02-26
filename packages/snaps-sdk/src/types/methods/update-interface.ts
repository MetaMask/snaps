import type { ComponentOrElement, InterfaceContext } from '..';

/**
 * An object containing the parameters for the `snap_updateInterface` method.
 */
export type UpdateInterfaceParams = {
  /**
   * The ID of the interface to update.
   */
  id: string;

  /**
   * The new custom UI content to display in the interface.
   */
  ui: ComponentOrElement;

  /**
   * Optional context for the interface, which can be used to provide additional
   * information about the interface to the Snap, without being part of the UI
   * itself.
   */
  context?: InterfaceContext;
};

/**
 * This method does not return any data, so the result is always `null`.
 */
export type UpdateInterfaceResult = null;
