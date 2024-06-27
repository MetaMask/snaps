import type { ComponentOrElement, InterfaceContext } from '..';
/**
 * The request parameters for the `snap_createInterface` method.
 *
 * @property ui - The components to display in the interface.
 */
export declare type CreateInterfaceParams = {
    ui: ComponentOrElement;
    context?: InterfaceContext;
};
/**
 * The result returned by the `snap_createInterface` method, which is the id of the created interface.
 */
export declare type CreateInterfaceResult = string;
