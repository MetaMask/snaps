import type { ComponentOrElement, InterfaceContext } from '..';

/**
 * The request parameters for the `snap_createInterface` method.
 *
 * @property id - The interface id.
 * @property ui - The components to display in the interface.
 */
export type UpdateInterfaceParams = {
  id: string;
  ui: ComponentOrElement;
  context?: InterfaceContext;
};

/**
 * The result returned by the `snap_updateInterface` method.
 */
export type UpdateInterfaceResult = null;
