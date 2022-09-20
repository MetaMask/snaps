export type AccountID = string;
export type ChainId = string;
export type NamespaceId = string;

export const namespaceRe = /^[-a-z0-9]{3,8}$/;

/**
 * Regex that matches ChainId CAIP-2 spec.
 *
 * It has two named matching groups.
 * - `namespace` - the namespace of the chain.
 * - `reference` - the specific chain reference inside that namespace.
 */
export const chainIdRe =
  /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$/;

/**
 * Regex that matches AccountID CAIP-10 spec.
 *
 * It has three named matching groups.
 * - `chainId` - whole CAIP-2 ChainID.
 *   - `namespace` - the namespace of that ChainID.
 *   - `reference` - the reference of that ChainID.
 * - `accountAddress` - the actual account address inside that chain.
 *
 * @see {@link chainIdRe}
 */
export const accountIdRe =
  /^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})):(?<accountAddress>[a-zA-Z0-9]{1,64})$/;

export interface RequestArguments {
  method: string;
  params: unknown[] | Record<string, unknown>;
}

// type instead of interface because otherwise it's incompatible with our JSON type used in the BaseControllerV2
export type Namespace = {
  accounts: AccountID[];
  methods: string[];
  events: string[];
  chains: ChainId[];
};

export interface Session {
  namespaces: Record<string, Namespace>;
}

export interface ConnectArguments {
  requiredNamespaces: {
    [namespace: NamespaceId]: {
      chains: ChainId[];
      methods?: string[];
      events?: string[];
    };
  };
}

export interface ConnectArgumentsFull {
  requiredNamespaces: {
    [namespace: NamespaceId]: {
      chains: ChainId[];
      methods: string[];
      events: string[];
    };
  };
}

/**
 * One of events requested in the snap manifest.
 */
export interface Event {
  name: string;
  data: unknown;
}

interface ProviderEventMap {
  session_event: (arg: { params: { event: Event; chainId: ChainId } }) => void;
  session_delete: () => void;
}

export interface Provider {
  connect(args: ConnectArguments): Promise<{ approval(): Promise<Session> }>;
  request(args: { chainId: ChainId; request: RequestArguments }): Promise<any>;

  on<K extends keyof ProviderEventMap>(
    eventName: K,
    listener: ProviderEventMap[K],
  ): this;
  on(eventName: string, listener: (...args: unknown[]) => void): this;
  once<K extends keyof ProviderEventMap>(
    eventName: K,
    listener: ProviderEventMap[K],
  ): this;
  once(eventName: string, listener: (...args: unknown[]) => void): this;
  removeListener(eventName: string, listener: Function): this;
  removeAllListeners(eventName: string): this;
}

export class RPCError extends Error {
  constructor(public readonly code: number, msg?: string) {
    super(msg);
  }
}
