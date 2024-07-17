import type { AcceptRequest, HasApprovalRequest } from '@metamask/approval-controller';
import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { MaybeUpdateState, TestOrigin } from '@metamask/phishing-controller';
import type { InterfaceState, SnapId, ComponentOrElement, InterfaceContext } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { Json } from '@metamask/utils';
declare const controllerName = "SnapInterfaceController";
export declare type CreateInterface = {
    type: `${typeof controllerName}:createInterface`;
    handler: SnapInterfaceController['createInterface'];
};
export declare type GetInterface = {
    type: `${typeof controllerName}:getInterface`;
    handler: SnapInterfaceController['getInterface'];
};
export declare type UpdateInterface = {
    type: `${typeof controllerName}:updateInterface`;
    handler: SnapInterfaceController['updateInterface'];
};
export declare type DeleteInterface = {
    type: `${typeof controllerName}:deleteInterface`;
    handler: SnapInterfaceController['deleteInterface'];
};
export declare type UpdateInterfaceState = {
    type: `${typeof controllerName}:updateInterfaceState`;
    handler: SnapInterfaceController['updateInterfaceState'];
};
export declare type ResolveInterface = {
    type: `${typeof controllerName}:resolveInterface`;
    handler: SnapInterfaceController['resolveInterface'];
};
export declare type SnapInterfaceControllerAllowedActions = TestOrigin | MaybeUpdateState | HasApprovalRequest | AcceptRequest;
export declare type SnapInterfaceControllerActions = CreateInterface | GetInterface | UpdateInterface | DeleteInterface | UpdateInterfaceState | ResolveInterface;
export declare type SnapInterfaceControllerMessenger = RestrictedControllerMessenger<typeof controllerName, SnapInterfaceControllerActions | SnapInterfaceControllerAllowedActions, never, SnapInterfaceControllerAllowedActions['type'], never>;
export declare type StoredInterface = {
    snapId: SnapId;
    content: JSXElement;
    state: InterfaceState;
    context: InterfaceContext | null;
};
export declare type SnapInterfaceControllerState = {
    interfaces: Record<string, StoredInterface>;
};
export declare type SnapInterfaceControllerArgs = {
    messenger: SnapInterfaceControllerMessenger;
    state?: SnapInterfaceControllerState;
};
/**
 * Use this controller to manage snaps UI interfaces using RPC method hooks.
 */
export declare class SnapInterfaceController extends BaseController<typeof controllerName, SnapInterfaceControllerState, SnapInterfaceControllerMessenger> {
    #private;
    constructor({ messenger, state }: SnapInterfaceControllerArgs);
    /**
     * Create an interface in the controller state with the associated data.
     *
     * @param snapId - The snap id that created the interface.
     * @param content - The interface content.
     * @param context - An optional interface context object.
     * @returns The newly interface id.
     */
    createInterface(snapId: SnapId, content: ComponentOrElement, context?: InterfaceContext): Promise<string>;
    /**
     * Get the data of a given interface id.
     *
     * @param snapId - The snap id requesting the interface data.
     * @param id - The interface id.
     * @returns The interface state.
     */
    getInterface(snapId: SnapId, id: string): StoredInterface;
    /**
     * Update the interface with the given content.
     *
     * @param snapId - The snap id requesting the update.
     * @param id - The interface id.
     * @param content - The new content.
     */
    updateInterface(snapId: SnapId, id: string, content: ComponentOrElement): Promise<void>;
    /**
     * Delete an interface from state.
     *
     * @param id - The interface id.
     */
    deleteInterface(id: string): void;
    /**
     * Update the interface state.
     *
     * @param id - The interface id.
     * @param state - The new state.
     */
    updateInterfaceState(id: string, state: InterfaceState): void;
    /**
     * Resolve the promise of a given interface approval request.
     * The approval needs to have the same ID as the interface.
     *
     * @param snapId - The snap id.
     * @param id - The interface id.
     * @param value - The value to resolve the promise with.
     */
    resolveInterface(snapId: SnapId, id: string, value: Json): Promise<void>;
}
export {};
