import type { Component } from '../../ui';

/**
 * The request parameters for the `snap_createInterface` method.
 *
 * @property ui - The components to display in the interface.
 */
export type CreateInterfaceParams = {
  ui: Component;
};

/**
 * The result returned by the `snap_createInterface` method, which is the id of the created interface.
 */
export type CreateInterfaceResult = string;
