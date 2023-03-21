import { AddApprovalRequest } from '@metamask/approval-controller';
import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import {
  GetPermissions,
  GrantPermissions,
  HasPermission,
  PermissionConstraint,
} from '@metamask/permission-controller';
import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/rpc-methods';
import {
  SnapKeyring,
  parseAccountId,
  AccountId,
  parseChainId,
  ChainId,
  ConnectArguments,
  isSnapPermitted,
  HandlerType,
  NamespaceId,
  RequestArguments,
  RequestNamespace,
  Session,
  TruncatedSnap,
  SnapId,
  SessionNamespace,
  isAccountIdArray,
  Namespaces,
  logError,
} from '@metamask/snaps-utils';
import { hasProperty, assert } from '@metamask/utils';
import { nanoid } from 'nanoid';

import {
  GetAllSnaps,
  HandleSnapRequest,
  IncrementActiveReferences,
  DecrementActiveReferences,
  SnapEndowments,
  getRunnableSnaps,
} from '../snaps';
import { getKeyringCaveatNamespaces } from '../snaps/endowments/keyring';
import { findMatchingKeyringSnaps } from './matching';

const controllerName = 'MultiChainController';

const defaultState: MultiChainControllerState = {
  sessions: {},
};

type AllowedActions =
  | GetAllSnaps
  | IncrementActiveReferences
  | DecrementActiveReferences
  | HandleSnapRequest
  | GetPermissions
  | HasPermission
  | AddApprovalRequest
  | GrantPermissions;

type MultiChainControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  AllowedActions,
  never,
  AllowedActions['type'],
  never
>;

type SessionData = {
  origin: string;
  requestedNamespaces: Record<NamespaceId, RequestNamespace>;
  providedNamespaces: Record<NamespaceId, RequestNamespace>;
  handlingSnaps: Record<NamespaceId, SnapId>;
};

type MultiChainControllerState = {
  sessions: { [origin: string]: SessionData };
};

type Notify = (
  origin: string,
  data: { method: string; params?: Record<string, unknown> },
) => Promise<void>;

type MultiChainControllerArgs = {
  notify: Notify;
  messenger: MultiChainControllerMessenger;
};

// TODO(ritave): Support for legacy ethereum operations, not just snaps
export class MultiChainController extends BaseController<
  typeof controllerName,
  MultiChainControllerState,
  MultiChainControllerMessenger
> {
  readonly #notify: Notify;

  /**
   * Construct a new {@link MultiChainController} instance.
   *
   * @param args - The arguments to construct the controller with.
   * @param args.messenger - The controller messenger to use.
   * @param args.notify - A function that should handle JSON-RPC notifications.
   */
  constructor({ messenger, notify }: MultiChainControllerArgs) {
    super({
      messenger,
      metadata: {
        sessions: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: defaultState,
    });

    this.#notify = notify;
  }

  /**
   * Get an open session for the given origin.
   *
   * @param origin - The origin to get the session for.
   * @returns The session, if it exists, or `undefined` otherwise.
   */
  getSession(origin: string): SessionData | undefined {
    return this.state.sessions[origin];
  }

  /**
   * Close a session for the given origin.
   *
   * @param origin - The origin to close the session for.
   * @throws If the session does not exist.
   */
  async closeSession(origin: string): Promise<void> {
    const session = this.getSession(origin);
    assert(session, 'No session to close.');

    await this.#notify(origin, {
      method: 'multichainHack_metamask_disconnect',
    });

    this.update((state) => {
      delete state.sessions[origin];
    });

    await Promise.all(
      Object.values(session.handlingSnaps).map((snapId) =>
        this.messagingSystem.call(
          'SnapController:decrementActiveReferences',
          snapId,
        ),
      ),
    );
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
  async onConnect(
    origin: string,
    connection: ConnectArguments,
  ): Promise<Session> {
    const existingSession = this.getSession(origin);
    if (existingSession) {
      await this.closeSession(origin);
    }

    const snaps = this.messagingSystem.call('SnapController:getAll');
    const filteredSnaps = getRunnableSnaps(snaps);

    // Get available namespaces supported by currently installed Snaps.
    const availableNamespaces = Object.fromEntries(
      await Promise.all(
        filteredSnaps.map(async (snap) => [
          snap.id,
          await this.snapToNamespaces(snap),
        ]),
      ),
    );

    // The magical matching algorithm specified in SIP-2.
    const namespaceToSnaps = findMatchingKeyringSnaps(
      connection.requiredNamespaces,
      availableNamespaces,
    );

    const permissions = this.messagingSystem.call(
      'PermissionController:getPermissions',
      origin,
    );

    assert(
      permissions !== undefined,
      `${origin} does not have any permissions.`,
    );

    // Find namespaces that can be satisfied with existing approved Snaps.
    const approvedNamespacesAndSnaps = Object.entries(namespaceToSnaps).reduce<
      Record<NamespaceId, SnapId[]>
    >((acc, [namespace, snapIds]) => {
      const approvedSnaps = snapIds.filter((snapId) =>
        isSnapPermitted(permissions, snapId),
      );

      if (approvedSnaps.length > 0) {
        acc[namespace] = approvedSnaps;
      }
      return acc;
    }, {});

    // If we either don't have a snap to handle a namespace or we have multiple we have conflicts
    const hasConflicts = Object.keys(namespaceToSnaps).some(
      (namespace) =>
        !hasProperty(approvedNamespacesAndSnaps, namespace) ||
        approvedNamespacesAndSnaps[namespace]?.length > 1,
    );

    // Use already approved snaps if they satisfy the requested namespaces.
    const filteredNamespacesAndSnaps = hasConflicts
      ? namespaceToSnaps
      : approvedNamespacesAndSnaps;

    // Fetch possible accounts from snaps.
    const possibleAccounts = await this.namespacesToAccounts(
      origin,
      filteredNamespacesAndSnaps,
      connection.requiredNamespaces,
    );

    // For now we fail here if no namespaces could be matched to a snap.
    // We don't fail if at least one namespace is matched to a snap.
    // TODO: Decide whether this is what we want
    assert(
      Object.values(possibleAccounts).some(
        (possibleAccount) => possibleAccount.length > 0,
      ),
      'No installed snaps found for any requested namespace.',
    );

    // If currently installed Snaps / configuration doesn't solve request, we
    // need to show a prompt. This is handled by `resolveConflicts`.
    const resolvedAccounts = hasConflicts
      ? await this.resolveConflicts(origin, possibleAccounts)
      : Object.fromEntries(
          Object.entries(possibleAccounts).map(
            ([namespace, snapAndAccounts]) => [
              namespace,
              snapAndAccounts[0] ?? null,
            ],
          ),
        );

    // Aggregate information about session namespaces.
    const providedNamespaces = Object.entries(
      connection.requiredNamespaces,
    ).reduce<Record<NamespaceId, SessionNamespace>>(
      (acc, [namespaceId, namespace]) => {
        const accounts = resolvedAccounts[namespaceId]?.accounts;
        if (accounts) {
          acc[namespaceId] = {
            accounts,
            chains: namespace.chains,
            events: namespace.events,
            methods: namespace.methods,
          };
        }
        return acc;
      },
      {},
    );

    // Collect information about handler Snaps for each namespace.
    const handlingSnaps = Object.entries(resolvedAccounts).reduce<
      Record<NamespaceId, SnapId>
    >((acc, [namespaceId, accountsAndSnap]) => {
      if (accountsAndSnap) {
        acc[namespaceId] = accountsAndSnap.snapId;
      }
      return acc;
    }, {});

    const session: SessionData = {
      origin,
      requestedNamespaces: connection.requiredNamespaces,
      providedNamespaces,
      handlingSnaps,
    };

    // Makes sure used Snaps aren't killed while they are serving the session.
    await Promise.all(
      Object.values(session.handlingSnaps).map((snapId) =>
        this.messagingSystem.call(
          'SnapController:incrementActiveReferences',
          snapId,
        ),
      ),
    );

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
  async onRequest(
    origin: string,
    data: { chainId: ChainId; request: RequestArguments },
  ): Promise<unknown> {
    const session = this.getSession(origin);
    assert(session, `Session for "${origin}" doesn't exist.`);

    const { namespace } = parseChainId(data.chainId);
    const sessionNamespace = session.providedNamespaces[namespace];
    assert(
      session.providedNamespaces[namespace]?.chains.includes(data.chainId),
      `Session for "${origin}" is not connected to "${data.chainId}" chain.`,
    );

    const { method } = data.request;
    assert(
      sessionNamespace?.methods?.includes(method),
      `Session for "${origin}" does not support ${method}`,
    );

    const snapId = session.handlingSnaps[namespace];
    assert(snapId !== undefined);

    // TODO: Get permission for origin connecting to snap, or get user approval.
    // In the future this is where we should prompt for this permission.
    // In this iteration, we will grant this permission in `onConnect`.
    const permissions = this.messagingSystem.call(
      'PermissionController:getPermissions',
      origin,
    );

    assert(
      permissions !== undefined,
      `${origin} does not have any permissions.`,
    );

    assert(
      isSnapPermitted(permissions, snapId),
      `${origin} does not have permission to communicate with ${snapId}.`,
    );

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
  private async snapRequest({
    snapId,
    origin,
    method,
    args,
  }: {
    snapId: SnapId;
    origin: string;
    method: keyof SnapKeyring;
    args?: unknown;
  }) {
    return this.messagingSystem.call('SnapController:handleRequest', {
      snapId,
      origin,
      handler: HandlerType.SnapKeyring,
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
  private async getSnapAccounts(
    origin: string,
    snapId: SnapId,
  ): Promise<AccountId[] | null> {
    try {
      const result = await this.snapRequest({
        snapId,
        origin,
        method: 'getAccounts',
      });

      if (isAccountIdArray(result)) {
        return result;
      }
    } catch (error) {
      // Ignore errors for now
      logError(error);
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
  private snapToNamespaces(snap: TruncatedSnap): Namespaces | null {
    const permissions = this.messagingSystem.call(
      'PermissionController:getPermissions',
      snap.id,
    );

    const keyringPermission = permissions?.[SnapEndowments.Keyring];
    return getKeyringCaveatNamespaces(keyringPermission);
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
  private async namespacesToAccounts(
    origin: string,
    namespacesAndSnaps: Record<NamespaceId, SnapId[]>,
    requestedNamespaces: Record<NamespaceId, RequestNamespace>,
  ): Promise<Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] }[]>> {
    const dedupedSnaps = [
      ...new Set(Object.values(namespacesAndSnaps).flat()),
    ] as SnapId[];

    const allAccounts = await dedupedSnaps.reduce<
      Promise<Record<string, AccountId[]>>
    >(async (previousPromise, snapId) => {
      const result = await this.getSnapAccounts(origin, snapId);
      const acc = await previousPromise;
      if (result) {
        acc[snapId] = result;
      }
      return acc;
    }, Promise.resolve({}));

    return Object.keys(namespacesAndSnaps).reduce<
      Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] }[]>
    >((acc, namespaceId) => {
      const { chains } = requestedNamespaces[namespaceId];

      const accountInAnyRequestedChain = (account: AccountId) => {
        const { chainId: parsedChainId } = parseAccountId(account);
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
  private async resolveConflicts(
    origin: string,
    possibleAccounts: Record<
      NamespaceId,
      { snapId: SnapId; accounts: AccountId[] }[]
    >,
  ): Promise<
    Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] } | null>
  > {
    // Get user approval for connection.
    const id = nanoid();
    const resolvedAccounts = (await this.messagingSystem.call(
      'ApprovalController:addRequest',
      {
        origin,
        id,
        type: 'multichain_connect',
        requestData: {
          possibleAccounts,
        },
      },
      true,
    )) as Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] } | null>;

    // TODO: In the future, use another permission here to not give full
    // permission after handshake.
    // Instead we should give origin only a read-only access to list of accounts
    // without allowing provider.request() talking to a snap before additional
    // user approval. The additional approval would be requested in `onRequest`.

    const approvedPermissions = Object.values(resolvedAccounts).reduce<
      Record<string, Record<string, Partial<PermissionConstraint>>>
    >(
      (acc, curr) => {
        if (curr !== null) {
          acc[WALLET_SNAP_PERMISSION_KEY][curr.snapId] = {};
        }
        return acc;
      },
      { [WALLET_SNAP_PERMISSION_KEY]: {} },
    );

    this.messagingSystem.call('PermissionController:grantPermissions', {
      approvedPermissions,
      subject: { origin },
    });

    return resolvedAccounts;
  }
}
