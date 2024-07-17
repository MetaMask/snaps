import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { GetPermissions } from '@metamask/permission-controller';
import type { SnapId } from '@metamask/snaps-sdk';
import type { DeleteInterface } from '../interface';
import type { GetAllSnaps, HandleSnapRequest } from '../snaps';
import type { TransactionControllerUnapprovedTransactionAddedEvent, SignatureStateChange, TransactionControllerTransactionStatusUpdatedEvent } from '../types';
declare const controllerName = "SnapInsightsController";
export declare type SnapInsightsControllerAllowedActions = HandleSnapRequest | GetAllSnaps | GetPermissions | DeleteInterface;
export declare type SnapInsightsControllerActions = never;
export declare type SnapInsightsControllerAllowedEvents = TransactionControllerUnapprovedTransactionAddedEvent | TransactionControllerTransactionStatusUpdatedEvent | SignatureStateChange;
export declare type SnapInsightsControllerMessenger = RestrictedControllerMessenger<typeof controllerName, SnapInsightsControllerActions | SnapInsightsControllerAllowedActions, SnapInsightsControllerAllowedEvents, SnapInsightsControllerAllowedActions['type'], SnapInsightsControllerAllowedEvents['type']>;
export declare type SnapInsight = {
    snapId: SnapId;
    interfaceId?: string | null;
    error?: string;
    loading: boolean;
};
export declare type SnapInsightsControllerState = {
    insights: Record<string, Record<SnapId, SnapInsight>>;
};
export declare type SnapInsightsControllerArgs = {
    messenger: SnapInsightsControllerMessenger;
    state?: SnapInsightsControllerState;
};
/**
 * Controller for monitoring for new transactions and signatures to provide insight for.
 */
export declare class SnapInsightsController extends BaseController<typeof controllerName, SnapInsightsControllerState, SnapInsightsControllerMessenger> {
    #private;
    constructor({ messenger, state }: SnapInsightsControllerArgs);
}
export {};
