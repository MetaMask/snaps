import type { ComponentOrElement } from '..';
/**
 * The request parameters for the `snap_createInterface` method.
 *
 * @property id - The interface id.
 * @property ui - The components to display in the interface.
 */
export declare type UpdateInterfaceParams = {
    id: string;
    ui: ComponentOrElement;
};
/**
 * The result returned by the `snap_updateInterface` method.
 */
export declare type UpdateInterfaceResult = null;
