import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import {
  ACCOUNT_ID_REGEX,
  AccountId,
  assert,
  CHAIN_ID_REGEX,
  ChainId,
  ConnectArguments,
  fromEntries,
  HandlerType,
  isAccountId,
  isChainId,
  Maybe,
  NamespaceId,
  Option,
  RequestArguments,
  RequestNamespace,
  Session,
  Snap,
  SnapId,
} from '@metamask/snap-utils';
import { findMatchingKeyringSnaps } from './matching';

const controllerName = 'MultiChainController';

const defaultState: MultiChainControllerState = {
  sessions: {},
};

type MultiChainControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  any,
  any,
  any,
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

  getSession(origin: string): Option<SessionData> {
    return Maybe(this.state.sessions[origin]);
  }

  async closeSession(origin: string): Promise<void> {
    const { handlingSnaps } = this.getSession(origin).expect(
      'No session to close',
    );

    await this.notify(origin, { method: 'multichainHack_metamask_disconnect' });

    this.update((state) => {
      delete state.sessions[origin];
    });

    await this.messagingSystem.call(
      'SnapController:decActiveRefs',
      Object.values(handlingSnaps),
    );
  }

  async onConnect(
    origin: string,
    connection: ConnectArguments,
  ): Promise<Session> {
    await this.getSession(origin).switchPartial({
      some: () => this.closeSession(origin),
    });

    const snaps: Record<SnapId, Snap> = this.messagingSystem.call(
      'SnapController:getAll',
    );

    // The magical matching algorithm specified in SIP-2
    const namespaceToSnaps = findMatchingKeyringSnaps(
      connection.requiredNamespaces,
      fromEntries(
        Object.entries(snaps).map(([snapId, snap]) => [
          snapId,
          this.snapToNamespaces(snap),
        ]),
      ),
    );

    const possibleAccounts = await this.namespacesToAccounts(
      Object.keys(namespaceToSnaps),
    );

    // TODO(ritave): Get user approval for connection
    const chosenAccounts = await this.resolveConflicts(possibleAccounts);
    // TODO(ritave): Save the approved permissions

    const providedNamespaces: Record<NamespaceId, RequestNamespace> =
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

    await this.messagingSystem.call(
      'SnapController:incActiveRefs',
      Object.values(session.handlingSnaps),
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
    const session = this.getSession(origin).expect(
      `Session for "${origin}" doesn't exist`,
    );
    const { namespace } = parseChainId(data.chainId);
    assert(
      session.providedNamespaces[namespace]?.chains.includes(data.chainId),
      `Session for "${origin}" not connected to "${data.chainId}" chain`,
    );
    const snapId = session.handlingSnaps[namespace];
    assert(snapId !== undefined);

    // TODO(ritave): Get permission for origin connecting to snap, or get user approval

    return this.messagingSystem.call('SnapController:handleRequest', {
      snapId,
      origin,
      handler: HandlerType.SnapKeyring,
      request: { method: 'handleRequest', params: [{ ...data, origin }] },
    });
  }

  async onSessionDisconnect(origin: string): Promise<void> {
    await this.closeSession(origin);
  }

  private snapToNamespaces(_snap: Snap): Record<NamespaceId, RequestNamespace> {
    throw new Error('Not implemented.');
  }

  private namespacesToAccounts(
    _namespaces: NamespaceId[],
  ): Promise<Record<NamespaceId, { snapId: SnapId; accounts: AccountId[] }[]>> {
    throw new Error('Not implemented.');
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
