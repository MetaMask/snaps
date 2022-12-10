"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MultiChainController_notify;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiChainController = void 0;
const controllers_1 = require("@metamask/controllers");
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("@metamask/utils");
const nanoid_1 = require("nanoid");
const snaps_1 = require("../snaps");
const keyring_1 = require("../snaps/endowments/keyring");
const matching_1 = require("./matching");
const controllerName = 'MultiChainController';
const defaultState = {
    sessions: {},
};
// TODO(ritave): Support for legacy ethereum operations, not just snaps
class MultiChainController extends controllers_1.BaseControllerV2 {
    /**
     * Construct a new {@link MultiChainController} instance.
     *
     * @param args - The arguments to construct the controller with.
     * @param args.messenger - The controller messenger to use.
     * @param args.notify - A function that should handle JSON-RPC notifications.
     */
    constructor({ messenger, notify }) {
        super({
            messenger,
            metadata: {
                sessions: { persist: false, anonymous: false },
            },
            name: controllerName,
            state: defaultState,
        });
        _MultiChainController_notify.set(this, void 0);
        __classPrivateFieldSet(this, _MultiChainController_notify, notify, "f");
    }
    /**
     * Get an open session for the given origin.
     *
     * @param origin - The origin to get the session for.
     * @returns The session, if it exists, or `undefined` otherwise.
     */
    getSession(origin) {
        return this.state.sessions[origin];
    }
    /**
     * Close a session for the given origin.
     *
     * @param origin - The origin to close the session for.
     * @throws If the session does not exist.
     */
    async closeSession(origin) {
        const session = this.getSession(origin);
        (0, utils_1.assert)(session, 'No session to close.');
        await __classPrivateFieldGet(this, _MultiChainController_notify, "f").call(this, origin, {
            method: 'multichainHack_metamask_disconnect',
        });
        this.update((state) => {
            delete state.sessions[origin];
        });
        await Promise.all(Object.values(session.handlingSnaps).map((snapId) => this.messagingSystem.call('SnapController:decrementActiveReferences', snapId)));
    }
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
    async onConnect(origin, connection) {
        const existingSession = this.getSession(origin);
        if (existingSession) {
            await this.closeSession(origin);
        }
        const snaps = await this.messagingSystem.call('SnapController:getAll');
        const filteredSnaps = (0, snaps_1.getRunnableSnaps)(snaps);
        // Get available namespaces supported by currently installed Snaps.
        const availableNamespaces = (0, snap_utils_1.fromEntries)(await Promise.all(filteredSnaps.map(async (snap) => [
            snap.id,
            await this.snapToNamespaces(snap),
        ])));
        // The magical matching algorithm specified in SIP-2.
        const namespaceToSnaps = (0, matching_1.findMatchingKeyringSnaps)(connection.requiredNamespaces, availableNamespaces);
        const permissions = await this.messagingSystem.call('PermissionController:getPermissions', origin);
        // Find namespaces that can be satisfied with existing approved Snaps.
        const approvedNamespacesAndSnaps = Object.entries(namespaceToSnaps).reduce((acc, [namespace, snapIds]) => {
            const approvedSnaps = snapIds.filter((snapId) => {
                return (permissions && (0, utils_1.hasProperty)(permissions, (0, snap_utils_1.getSnapPermissionName)(snapId)));
            });
            if (approvedSnaps.length > 0) {
                acc[namespace] = approvedSnaps;
            }
            return acc;
        }, {});
        // If we either don't have a snap to handle a namespace or we have multiple we have conflicts
        const hasConflicts = Object.keys(namespaceToSnaps).some((namespace) => {
            var _a;
            return !(0, utils_1.hasProperty)(approvedNamespacesAndSnaps, namespace) ||
                ((_a = approvedNamespacesAndSnaps[namespace]) === null || _a === void 0 ? void 0 : _a.length) > 1;
        });
        // Use already approved snaps if they satisfy the requested namespaces.
        const filteredNamespacesAndSnaps = hasConflicts
            ? namespaceToSnaps
            : approvedNamespacesAndSnaps;
        // Fetch possible accounts from snaps.
        const possibleAccounts = await this.namespacesToAccounts(origin, filteredNamespacesAndSnaps, connection.requiredNamespaces);
        // For now we fail here if no namespaces could be matched to a snap.
        // We don't fail if at least one namespace is matched to a snap.
        // TODO: Decide whether this is what we want
        (0, utils_1.assert)(Object.values(possibleAccounts).some((possibleAccount) => possibleAccount.length > 0), 'No installed snaps found for any requested namespace.');
        // If currently installed Snaps / configuration doesn't solve request, we
        // need to show a prompt. This is handled by `resolveConflicts`.
        const resolvedAccounts = hasConflicts
            ? await this.resolveConflicts(origin, possibleAccounts)
            : (0, snap_utils_1.fromEntries)(Object.entries(possibleAccounts).map(([namespace, snapAndAccounts]) => {
                var _a;
                return [
                    namespace,
                    (_a = snapAndAccounts[0]) !== null && _a !== void 0 ? _a : null,
                ];
            }));
        // Aggregate information about session namespaces.
        const providedNamespaces = Object.entries(connection.requiredNamespaces).reduce((acc, [namespaceId, namespace]) => {
            var _a;
            const accounts = (_a = resolvedAccounts[namespaceId]) === null || _a === void 0 ? void 0 : _a.accounts;
            if (accounts) {
                acc[namespaceId] = {
                    accounts,
                    chains: namespace.chains,
                    events: namespace.events,
                    methods: namespace.methods,
                };
            }
            return acc;
        }, {});
        // Collect information about handler Snaps for each namespace.
        const handlingSnaps = Object.entries(resolvedAccounts).reduce((acc, [namespaceId, accountsAndSnap]) => {
            if (accountsAndSnap) {
                acc[namespaceId] = accountsAndSnap.snapId;
            }
            return acc;
        }, {});
        const session = {
            origin,
            requestedNamespaces: connection.requiredNamespaces,
            providedNamespaces,
            handlingSnaps,
        };
        // Makes sure used Snaps aren't killed while they are serving the session.
        await Promise.all(Object.values(session.handlingSnaps).map((snapId) => this.messagingSystem.call('SnapController:incrementActiveReferences', snapId)));
        this.update((state) => {
            state.sessions[origin] = session;
        });
        return { namespaces: providedNamespaces };
    }
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
    async onRequest(origin, data) {
        var _a, _b;
        const session = this.getSession(origin);
        (0, utils_1.assert)(session, `Session for "${origin}" doesn't exist.`);
        const { namespace } = (0, snap_utils_1.parseChainId)(data.chainId);
        const sessionNamespace = session.providedNamespaces[namespace];
        (0, utils_1.assert)((_a = session.providedNamespaces[namespace]) === null || _a === void 0 ? void 0 : _a.chains.includes(data.chainId), `Session for "${origin}" is not connected to "${data.chainId}" chain.`);
        const { method } = data.request;
        (0, utils_1.assert)((_b = sessionNamespace === null || sessionNamespace === void 0 ? void 0 : sessionNamespace.methods) === null || _b === void 0 ? void 0 : _b.includes(method), `Session for "${origin}" does not support ${method}`);
        const snapId = session.handlingSnaps[namespace];
        (0, utils_1.assert)(snapId !== undefined);
        const permissionName = (0, snap_utils_1.getSnapPermissionName)(snapId);
        // Check if origin has permission to communicate with this Snap.
        const hasPermission = await this.messagingSystem.call('PermissionController:hasPermission', origin, permissionName);
        // TODO: Get permission for origin connecting to snap, or get user approval.
        // In the future this is where we should prompt for this permission.
        // In this iteration, we will grant this permission in `onConnect`.
        (0, utils_1.assert)(hasPermission, `${origin} does not have permission to communicate with ${snapId}.`);
        return this.snapRequest({
            snapId,
            origin,
            method: 'handleRequest',
            args: data,
        });
    }
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
    async snapRequest({ snapId, origin, method, args, }) {
        return this.messagingSystem.call('SnapController:handleRequest', {
            snapId,
            origin,
            handler: snap_utils_1.HandlerType.SnapKeyring,
            request: { method, params: args ? [args] : [] },
        });
    }
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
    async getSnapAccounts(origin, snapId) {
        try {
            const result = await this.snapRequest({
                snapId,
                origin,
                method: 'getAccounts',
            });
            if ((0, snap_utils_1.isAccountIdArray)(result)) {
                return result;
            }
        }
        catch (error) {
            // Ignore errors for now
            console.error(error);
        }
        return null;
    }
    /**
     * Get the namespaces for the given Snap, as described in the Snap's manifest.
     *
     * @param snap - The Snap to get the namespaces for.
     * @returns The namespaces, or `null` if the Snap does not have any
     * namespaces.
     */
    async snapToNamespaces(snap) {
        const permissions = await this.messagingSystem.call('PermissionController:getPermissions', snap.id);
        const keyringPermission = permissions === null || permissions === void 0 ? void 0 : permissions[snaps_1.SnapEndowments.Keyring];
        return (0, keyring_1.getKeyringCaveatNamespaces)(keyringPermission);
    }
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
    async namespacesToAccounts(origin, namespacesAndSnaps, requestedNamespaces) {
        const dedupedSnaps = [
            ...new Set((0, snap_utils_1.flatten)(Object.values(namespacesAndSnaps))),
        ];
        const allAccounts = await dedupedSnaps.reduce(async (previousPromise, snapId) => {
            const result = await this.getSnapAccounts(origin, snapId);
            const acc = await previousPromise;
            if (result) {
                acc[snapId] = result;
            }
            return acc;
        }, Promise.resolve({}));
        return Object.keys(namespacesAndSnaps).reduce((acc, namespaceId) => {
            const { chains } = requestedNamespaces[namespaceId];
            const accountInAnyRequestedChain = (account) => {
                const { chainId: parsedChainId } = (0, snap_utils_1.parseAccountId)(account);
                return chains.some((chainId) => chainId === parsedChainId);
            };
            const result = Object.entries(allAccounts)
                .map(([snapId, accounts]) => ({
                snapId,
                accounts: accounts.filter(accountInAnyRequestedChain),
            }))
                .filter(({ accounts }) => accounts.length > 0);
            acc[namespaceId] = result;
            return acc;
        }, {});
    }
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
    async resolveConflicts(origin, possibleAccounts) {
        // Get user approval for connection.
        const id = (0, nanoid_1.nanoid)();
        const resolvedAccounts = (await this.messagingSystem.call('ApprovalController:addRequest', {
            origin,
            id,
            type: 'multichain_connect',
            requestData: {
                possibleAccounts,
            },
        }, true));
        // TODO: In the future, use another permission here to not give full
        // permission after handshake.
        // Instead we should give origin only a read-only access to list of accounts
        // without allowing provider.request() talking to a snap before additional
        // user approval. The additional approval would be requested in `onRequest`.
        const approvedPermissions = Object.values(resolvedAccounts).reduce((acc, cur) => {
            if (cur !== null) {
                acc[(0, snap_utils_1.getSnapPermissionName)(cur.snapId)] = {};
            }
            return acc;
        }, {});
        await this.messagingSystem.call('PermissionController:grantPermissions', {
            approvedPermissions,
            subject: { origin },
        });
        return resolvedAccounts;
    }
}
exports.MultiChainController = MultiChainController;
_MultiChainController_notify = new WeakMap();
//# sourceMappingURL=MultiChainController.js.map