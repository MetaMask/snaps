import {
  BaseControllerV2 as BaseController,
  GetPermissions,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import {
  ACCOUNT_ID_REGEX,
  AccountId,
  assert,
  CHAIN_ID_REGEX,
  ChainId,
  ConnectArguments,
  HandlerType,
  isAccountId,
  isChainId,
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
} from '@metamask/snap-utils';
import {
  GetAllSnaps,
  HandleSnapRequest,
  OnSessionClose,
  OnSessionOpen,
  SnapEndowments,
} from '../snaps';
import { findMatchingKeyringSnaps } from './matching';

const controllerName = 'MultiChainController';

const defaultState: MultiChainControllerState = {
  sessions: {},
};

type AllowedActions =
  | GetAllSnaps
  | OnSessionOpen
  | OnSessionClose
  | HandleSnapRequest
  | GetPermissions;

type MultiChainControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  AllowedActions,
  any,
  AllowedActions['type'],
  any
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

/**
 * Parse a chain ID string to an object containing the namespace and reference.
 * This validates the chain ID before parsing it.
 *
 * @param chainId - The chain ID to validate and parse.
 * @returns The parsed chain ID.
 */
export function parseChainId(chainId: ChainId): {
  namespace: NamespaceId;
  reference: string;
} {
  if (!isChainId(chainId)) {
    throw new Error('Invalid chain ID.');
  }

  const match = CHAIN_ID_REGEX.exec(chainId);
  if (!match?.groups) {
    throw new Error('Invalid chain ID.');
  }

  return {
    namespace: match.groups.namespace,
    reference: match.groups.reference,
  };
}

/**
 * Parse an account ID to an object containing the chain, chain ID and address.
 * This validates the account ID before parsing it.
 *
 * @param accountId - The account ID to validate and parse.
 * @returns The parsed account ID.
 */
export function parseAccountId(accountId: AccountId): {
  chain: { namespace: NamespaceId; reference: string };
  chainId: ChainId;
  address: string;
} {
  if (!isAccountId(accountId)) {
    throw new Error('Invalid account ID.');
  }

  const match = ACCOUNT_ID_REGEX.exec(accountId);
  if (!match?.groups) {
    throw new Error('Invalid account ID.');
  }

  return {
    address: match.groups.accountAddress,
    chainId: match.groups.chainId as ChainId,
    chain: {
      namespace: match.groups.namespace,
      reference: match.groups.reference,
    },
  };
}

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
    assert(session, new Error('No session to close'));

    await this.notify(origin, { method: 'multichainHack_metamask_disconnect' });

    this.update((state) => {
      delete state.sessions[origin];
    });

    await Promise.all(
      Object.values(session.handlingSnaps).map((snapId) =>
        this.messagingSystem.call('SnapController:onSessionClose', snapId),
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

    const availableNamespaces = await filteredSnaps.reduce<
      Promise<Record<SnapId, Record<NamespaceId, Namespace>>>
    >(async (previousPromise, snap) => {
      const acc = await previousPromise;
      const snapNamespaces = await this.snapToNamespaces(snap);
      if (snapNamespaces !== null) {
        return { ...acc, [snap.id]: snapNamespaces };
      }
      return acc;
    }, Promise.resolve({}));

    // The magical matching algorithm specified in SIP-2
    const namespaceToSnaps = findMatchingKeyringSnaps(
      connection.requiredNamespaces,
      availableNamespaces,
    );

    const possibleAccounts = await this.namespacesToAccounts(
      origin,
      namespaceToSnaps,
      connection.requiredNamespaces,
    );

    // TODO(ritave): Get user approval for connection
    const chosenAccounts = await this.resolveConflicts(possibleAccounts);
    // TODO(ritave): Save the approved permissions

    const providedNamespaces: Record<NamespaceId, SessionNamespace> =
      fromEntries(
        Object.entries(connection.requiredNamespaces)
          .filter(([namespaceId]) => chosenAccounts[namespaceId] !== null)
          .map(([namespaceId, namespace]) => [
            namespaceId,
            {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              accounts: chosenAccounts[namespaceId]!.accounts,
              chains: namespace.chains,
              events: namespace.events,
              methods: namespace.methods,
            },
          ]),
      );

    const session: SessionData = {
      origin,
      requestedNamespaces: connection.requiredNamespaces,
      providedNamespaces,
      handlingSnaps: fromEntries(
        Object.entries(chosenAccounts)
          .filter(([, data]) => data !== null)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map(([namespaceId, data]) => [namespaceId, data!.snapId]),
      ),
    };

    await Promise.all(
      Object.values(session.handlingSnaps).map((snapId) =>
        this.messagingSystem.call('SnapController:onSessionOpen', snapId),
      ),
    );

    this.update((state) => {
      state.sessions[origin] = session;
    });

    return { namespaces: providedNamespaces };
  }

  onRequest(
    origin: string,
    data: { chainId: ChainId; request: RequestArguments },
  ): Promise<unknown> {
    const session = this.getSession(origin);
    assert(session, new Error(`Session for "${origin}" doesn't exist`));
    const { namespace } = parseChainId(data.chainId);
    assert(
      session.providedNamespaces[namespace]?.chains.includes(data.chainId),
      `Session for "${origin}" not connected to "${data.chainId}" chain`,
    );
    const snapId = session.handlingSnaps[namespace];
    assert(snapId !== undefined);

    // TODO(ritave): Get permission for origin connecting to snap, or get user approval

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
    snapId: string;
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

  async onSessionDisconnect(origin: string): Promise<void> {
    await this.closeSession(origin);
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
    const allSnaps = flatten(Object.values(namespacesAndSnaps));
    const dedupedSnaps = [...new Set(allSnaps)] as SnapId[];
    // TODO: Make sure this is properly parallelized
    const allAccounts = await dedupedSnaps.reduce<
      Promise<Record<string, AccountId[]>>
    >(
      // @ts-expect-error Fix this?
      async (previousPromise, snapId) => {
        const acc = await previousPromise;
        return {
          ...acc,
          [snapId]: await this.snapRequest({
            snapId,
            origin,
            method: 'getAccounts',
          }),
        };
      },
      Promise.resolve({}),
    );

    return Object.keys(namespacesAndSnaps).reduce((acc, namespaceId) => {
      const { chains } = requestedNamespaces[namespaceId];

      const result = Object.entries(allAccounts).reduce<
        { snapId: SnapId; accounts: AccountId[] }[]
      >((accList, [snapId, accounts]) => {
        // @ts-expect-error Fix this?
        const filteredAccounts = accounts.filter((account) => {
          const { chainId: parsedChainId } = parseAccountId(account);
          return chains.some((chainId) => chainId === parsedChainId);
        });
        if (filteredAccounts.length > 0) {
          return [...accList, { snapId, accounts: filteredAccounts }];
        }
        return accList;
      }, []);

      return { ...acc, [namespaceId]: result };
    }, {});
  }

  private async resolveConflicts(
    options: Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] }[]>,
  ): Promise<
    Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] } | null>
  > {
    return fromEntries(
      Object.entries(options).map(([namespace, snaps]) => {
        // TODO(ritave): Show actual user connection interface
        if (snaps.length === 0) {
          console.warn(
            `Warning when resolving conflicts - there are no snaps that support the requested namespace "${namespace}"`,
          );
        } else if (snaps.length > 1) {
          console.warn(
            `Warning when resolving conflicts - there are multiple snaps that support requested namespace "${namespace}". Selecting "${snaps[0].snapId}"`,
          );
        }
        return [namespace, snaps[0] ?? null];
      }),
    );
  }
}
