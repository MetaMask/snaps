import { AddApprovalRequest, BaseControllerV2 as BaseController, GetPermissions, GrantPermissions, HasPermission, RestrictedControllerMessenger } from '@metamask/controllers';
import { ChainId, ConnectArguments, NamespaceId, RequestArguments, RequestNamespace, Session, SnapId } from '@metamask/snap-utils';
import { GetAllSnaps, HandleSnapRequest, IncrementActiveReferences, DecrementActiveReferences } from '../snaps';
declare const controllerName = "MultiChainController";
declare type AllowedActions = GetAllSnaps | IncrementActiveReferences | DecrementActiveReferences | HandleSnapRequest | GetPermissions | HasPermission | AddApprovalRequest | GrantPermissions;
declare type MultiChainControllerMessenger = RestrictedControllerMessenger<typeof controllerName, AllowedActions, never, AllowedActions['type'], never>;
declare type SessionData = {
    origin: string;
    requestedNamespaces: Record<NamespaceId, RequestNamespace>;
    providedNamespaces: Record<NamespaceId, RequestNamespace>;
    handlingSnaps: Record<NamespaceId, SnapId>;
};
declare type MultiChainControllerState = {
    sessions: {
        [origin: string]: SessionData;
    };
};
declare type Notify = (origin: string, data: {
    method: string;
    params?: Record<string, unknown>;
}) => Promise<void>;
declare type MultiChainControllerArgs = {
    notify: Notify;
    messenger: MultiChainControllerMessenger;
};
export declare class MultiChainController extends BaseController<typeof controllerName, MultiChainControllerState, MultiChainControllerMessenger> {
    #private;
    /**
     * Construct a new {@link MultiChainController} instance.
     *
     * @param args - The arguments to construct the controller with.
     * @param args.messenger - The controller messenger to use.
     * @param args.notify - A function that should handle JSON-RPC notifications.
     */
    constructor({ messenger, notify }: MultiChainControllerArgs);
    /**
     * Get an open session for the given origin.
     *
     * @param origin - The origin to get the session for.
     * @returns The session, if it exists, or `undefined` otherwise.
     */
    getSession(origin: string): SessionData | undefined;
    /**
     * Close a session for the given origin.
     *
     * @param origin - The origin to close the session for.
     * @throws If the session does not exist.
     */
    closeSession(origin: string): Promise<void>;
    /**
     * Handles a new connection from the given origin. This will create a new
     * session, and close any existing session for the origin.
     *
     * @param origin - The origin to create the session for.
     * @param connection - The connection arguments.
     * @param connection.requiredNamespaces - The namespaces that the origin
     * requires.
     * @returns The session that was created.
     */
    onConnect(origin: string, connection: ConnectArguments): Promise<Session>;
    /**
     * Handle an incoming multichain request from the given origin. This will
     * forward the request to the appropriate Snap, and return the response.
     *
     * @param origin - The origin to handle the request for.
     * @param data - The request data.
     * @param data.chainId - The chain ID for the request.
     * @param data.request - The request arguments, i.e., the method and params.
     * @returns The response from the Snap.
     * @throws If the session does not exist, or the session does not provide the
     * requested namespace.
     */
    onRequest(origin: string, data: {
        chainId: ChainId;
        request: RequestArguments;
    }): Promise<unknown>;
    /**
     * Send a request to the given Snap. This calls the given method with the
     * given arguments on the keyring class in the given Snap.
     *
     * @param options - The request options.
     * @param options.snapId - The ID of the Snap to send the request to.
     * @param options.origin - The origin of the request.
     * @param options.method - The request method.
     * @param options.args - The request params.
     * @returns The response from the Snap.
     */
    private snapRequest;
    /**
     * Get the accounts exposed by the Snap's keyring.
     *
     * This also verifies that the accounts returned by the snap are valid CAIP-10
     * account IDs.
     *
     * @param origin - The origin of the request.
     * @param snapId - The ID of the Snap to get the accounts from.
     * @returns The accounts, or `null` if the Snap does not have any accounts, or
     * the accounts are invalid (i.e., not valid CAIP-10 account IDs).
     */
    private getSnapAccounts;
    /**
     * Get the namespaces for the given Snap, as described in the Snap's manifest.
     *
     * @param snap - The Snap to get the namespaces for.
     * @returns The namespaces, or `null` if the Snap does not have any
     * namespaces.
     */
    private snapToNamespaces;
    /**
     * Maps from an object of namespace IDs and Snap IDs, and an object of
     * namespace IDs and requested namespaces, to an object of namespace IDs and
     * resolved accounts, with the Snap ID providing the accounts.
     *
     * @param origin - The origin of the request.
     * @param namespacesAndSnaps - An object of namespace IDs and Snap IDs
     * providing the namespace.
     * @param requestedNamespaces - An object of namespace IDs and requested
     * namespaces.
     * @returns An object of namespace IDs and resolved accounts, with the Snap ID
     * providing the accounts.
     */
    private namespacesToAccounts;
    /**
     * If multiple Snap IDs are provided for a namespace, this method will
     * determine which Snap ID to use for the namespace, by showing the user a
     * prompt.
     *
     * @param origin - The origin of the request.
     * @param possibleAccounts - An object containing the accounts provided by
     * each Snap ID for each namespace.
     * @returns An object containing the Snap ID to use for each namespace.
     */
    private resolveConflicts;
}
export {};
