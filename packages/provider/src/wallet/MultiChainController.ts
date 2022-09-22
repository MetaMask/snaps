import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import {
  assert,
  HandlerType,
  Maybe,
  Option,
  Snap,
  SnapId,
} from '@metamask/snap-utils';
import {
  AccountID,
  accountIdRe,
  ChainId,
  chainIdRe,
  ConnectArgumentsFull,
  Namespace,
  NamespaceId,
  RequestArguments,
  Session,
} from '../client';
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

type RequestedNamespace = {
  methods: string[];
  events: string[];
  chains: ChainId[];
};

type SessionData = {
  origin: string;
  requestedNamespaces: Record<NamespaceId, RequestedNamespace>;
  providedNamespaces: Record<NamespaceId, Namespace>;
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
 * @param chainId
 */
function parseChainId(chainId: ChainId): {
  namespace: NamespaceId;
  reference: string;
} {
  const match = chainIdRe.exec(chainId);
  assert(match !== null);
  return {
    namespace: match.groups!.namespace,
    reference: match.groups!.reference,
  };
}

/**
 * @param accountId
 */
function parseAccountId(accountId: AccountID): {
  chain: { namespace: NamespaceId; reference: string };
  chainId: ChainId;
  address: string;
} {
  const match = accountIdRe.exec(accountId);
  assert(match != null);
  return {
    address: match.groups!.accountAddress,
    chainId: match.groups!.chainId,
    chain: {
      namespace: match.groups!.namespace,
      reference: match.groups!.reference,
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
    connection: ConnectArgumentsFull,
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
      Object.fromEntries(
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

    const providedNamespaces: Record<NamespaceId, Namespace> =
      Object.fromEntries(
        Object.entries(connection.requiredNamespaces)
          .filter(([namespaceId]) => chosenAccounts[namespaceId] !== null)
          .map(([namespaceId, namespace]) => [
            namespaceId,
            {
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
      handlingSnaps: Object.fromEntries(
        Object.entries(chosenAccounts)
          .filter(([, data]) => data !== null)
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

  private snapToNamespaces(snap: Snap): Record<NamespaceId, Namespace> {}

  private namespacesToAccounts(
    namespaces: NamespaceId[],
  ): Promise<
    Record<NamespaceId, { snapId: SnapId; accounts: AccountID[] }[]>
  > {}

  private async resolveConflicts(
    options: Record<NamespaceId, { snapId: SnapId; accounts: AccountID[] }[]>,
  ): Promise<
    Record<NamespaceId, { snapId: SnapId; accounts: AccountID[] } | null>
  > {
    return Object.fromEntries(
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
