import type { ComponentOrElement, InterfaceContext } from '..';

/**
 * The request parameters for the `snap_createInterface` method.
 */
export type CreateInterfaceParams = {
  /**
   * The [custom UI](https://docs.metamask.io/snaps/features/custom-ui/) to
   * create.
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
 * The interface's ID to be used in subsequent calls to custom UI methods such
 * as [`snap_updateInterface`](https://docs.metamask.io/snaps/reference/snaps-api/snap_updateinterface),
 * or to display the interface using one of the interface display methods such
 * as [`snap_dialog`](https://docs.metamask.io/snaps/reference/snaps-api/snap_dialog).
 */
export type CreateInterfaceResult = string;
