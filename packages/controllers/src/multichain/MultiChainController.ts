import {
  AddApprovalRequest,
  BaseControllerV2 as BaseController,
  GetPermissions,
  GrantPermissions,
  HasPermission,
  PermissionConstraint,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import {
  parseAccountId,
  AccountId,
  assert,
  parseChainId,
  ChainId,
  ConnectArguments,
  HandlerType,
  NamespaceId,
  RequestArguments,
  RequestNamespace,
  Session,
  TruncatedSnap,
  SnapId,
  fromEntries,
  SessionNamespace,
  Namespace,
  flatten,
  getSnapPermissionName,
  isAccountIdArray,
} from '@metamask/snap-utils';
import { hasProperty } from '@metamask/utils';
import { nanoid } from 'nanoid';
import {
  GetAllSnaps,
  HandleSnapRequest,
  IncrementActiveReferences,
  DecrementActiveReferences,
  SnapEndowments,
} from '../snaps';
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
  // A function that should handle JSON-RPC notifications
  notify: Notify;
  messenger: MultiChainControllerMessenger;
};

// TODO(ritave): Support for legacy ethereum operations, not just snaps
export class MultiChainController extends BaseController<
  typeof controllerName,
  MultiChainControllerState,
  MultiChainControllerMessenger
> {
  private notify: Notify;

  constructor({ messenger, notify }: MultiChainControllerArgs) {
    super({
      messenger,
      metadata: {
        sessions: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: defaultState,
    });

    this.notify = notify;
  }

  getSession(origin: string): SessionData | undefined {
    return this.state.sessions[origin];
  }

  async closeSession(origin: string): Promise<void> {
    const session = this.getSession(origin);
    assert(session, 'No session to close');

    await this.notify(origin, { method: 'multichainHack_metamask_disconnect' });

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

  async onConnect(
    origin: string,
    connection: ConnectArguments,
  ): Promise<Session> {
    const existingSession = this.getSession(origin);
    if (existingSession) {
      await this.closeSession(origin);
    }

    const snaps = await this.messagingSystem.call('SnapController:getAll');
    const filteredSnaps = snaps.filter((snap) => snap.enabled && !snap.blocked);

    // Get available namespaces supported by currently installed Snaps
    const availableNamespaces = fromEntries(
      await Promise.all(
        filteredSnaps.map(async (snap) => [
          snap.id,
          await this.snapToNamespaces(snap),
        ]),
      ),
    );

    // The magical matching algorithm specified in SIP-2
    const namespaceToSnaps = findMatchingKeyringSnaps(
      connection.requiredNamespaces,
      availableNamespaces,
    );

    const permissions = await this.messagingSystem.call(
      'PermissionController:getPermissions',
      origin,
    );

    // Find namespaces that can be satisfied with existing approved snaps
    const approvedNamespacesAndSnaps = Object.entries(namespaceToSnaps).reduce<
      Record<NamespaceId, SnapId[]>
    >((acc, [namespace, snapIds]) => {
      // If snap already is approved for use, solve conflict by using that snap
      const approvedSnap = snapIds.find((snapId) => {
        return (
          permissions && hasProperty(permissions, getSnapPermissionName(snapId))
        );
      });

      if (approvedSnap) {
        acc[namespace] = [approvedSnap];
      }
      return acc;
    }, {});

    const hasConflicts = Object.keys(namespaceToSnaps).some(
      (namespace) => !hasProperty(approvedNamespacesAndSnaps, namespace),
    );

    // Use already approved snaps if they satisfy the requested namespaces
    const filteredNamespacesAndSnaps = hasConflicts
      ? namespaceToSnaps
      : approvedNamespacesAndSnaps;

    // Fetch possible accounts from snaps
    const possibleAccounts = await this.namespacesToAccounts(
      origin,
      filteredNamespacesAndSnaps,
      connection.requiredNamespaces,
    );

    // If currently installed snaps / configuration doesn't solve request, we need to show a prompt.
    // This is handled by resolveConflicts
    const resolvedAccounts = hasConflicts
      ? await this.resolveConflicts(origin, possibleAccounts)
      : fromEntries(
          Object.entries(possibleAccounts).map(
            ([namespace, snapAndAccounts]) => [
              namespace,
              snapAndAccounts[0] ?? null,
            ],
          ),
        );

    // Aggregate information about session namespaces
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

    // Collect information about handler snaps for each namespace
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

    // Makes sure used snaps aren't killed while they are serving the session
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

  async onRequest(
    origin: string,
    data: { chainId: ChainId; request: RequestArguments },
  ): Promise<unknown> {
    const session = this.getSession(origin);
    assert(session, `Session for "${origin}" doesn't exist`);
    const { namespace } = parseChainId(data.chainId);
    assert(
      session.providedNamespaces[namespace]?.chains.includes(data.chainId),
      `Session for "${origin}" not connected to "${data.chainId}" chain`,
    );
    const snapId = session.handlingSnaps[namespace];
    assert(snapId !== undefined);
    const permissionName = getSnapPermissionName(snapId);

    // Check if origin has permission to communicate with this Snap.
    const hasPermission = await this.messagingSystem.call(
      'PermissionController:hasPermission',
      origin,
      permissionName,
    );

    // TODO: Get permission for origin connecting to snap, or get user approval
    // In the future this is where we should prompt for this permission.
    // In this iteration, we will grant this permission in onConnect.
    assert(
      hasPermission,
      `${origin} does not have permission to communicate with ${snapId}`,
    );

    return this.snapRequest({
      snapId,
      origin,
      method: 'handleRequest',
      args: data,
    });
  }

  private async snapRequest({
    snapId,
    origin,
    method,
    args,
  }: {
    snapId: SnapId;
    origin: string;
    method: string;
    args?: unknown;
  }) {
    return this.messagingSystem.call('SnapController:handleRequest', {
      snapId,
      origin,
      handler: HandlerType.SnapKeyring,
      request: { method, params: args ? [args] : [] },
    });
  }

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
      console.error(error);
    }
    return null;
  }

  private async snapToNamespaces(
    snap: TruncatedSnap,
  ): Promise<Record<NamespaceId, Namespace> | null> {
    const permissions = await this.messagingSystem.call(
      'PermissionController:getPermissions',
      snap.id,
    );
    const keyringPermission = permissions?.[SnapEndowments.Keyring];
    // Null if this snap doesn't expose keyrings
    // TODO: Verify that this is enough
    return keyringPermission?.caveats?.[0]?.value?.namespaces ?? null;
  }

  private async namespacesToAccounts(
    origin: string,
    namespacesAndSnaps: Record<NamespaceId, SnapId[]>,
    requestedNamespaces: Record<NamespaceId, RequestNamespace>,
  ): Promise<Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] }[]>> {
    const dedupedSnaps = [
      ...new Set(flatten(Object.values(namespacesAndSnaps))),
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

      const result = Object.entries(allAccounts).reduce<
        { snapId: SnapId; accounts: AccountId[] }[]
      >((accList, [snapId, accounts]) => {
        const filteredAccounts = accounts.filter((account) => {
          const { chainId: parsedChainId } = parseAccountId(account);
          return chains.some((chainId) => chainId === parsedChainId);
        });
        if (filteredAccounts.length > 0) {
          accList.push({ snapId, accounts: filteredAccounts });
        }
        return accList;
      }, []);

      acc[namespaceId] = result;

      return acc;
    }, {});
  }

  private async resolveConflicts(
    origin: string,
    possibleAccounts: Record<
      NamespaceId,
      { snapId: SnapId; accounts: AccountId[] }[]
    >,
  ): Promise<
    Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] } | null>
  > {
    // Get user approval for connection
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

    // TODO: In the future, use another permission here to not give full permission after handshake.
    // Instead we should give origin only a read-only access to list of accounts without allowing provider.request() talking to a snap before additional user approval.
    // The additional approval would be requested in onRequest.
    const approvedPermissions = Object.values(resolvedAccounts).reduce<
      Record<string, Partial<PermissionConstraint>>
    >((acc, cur) => {
      if (cur !== null) {
        acc[getSnapPermissionName(cur.snapId)] = {};
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
