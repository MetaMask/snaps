type AccountID = string;
type ChainId = string;

export interface RequestArguments {
  method: string;
  params: unknown[];
}

export interface Namespace {
  accounts: AccountID[];
  methods: string[];
  events: string[];
}

export interface Session {
  namespaces: Record<string, Namespace>;
}

export interface ConnectArguments {
  requiredNamespaces: {
    [namespace: string]: {
      chains: ChainId[];
      methods?: string[];
      events?: string[];
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

export interface Provider {
  connect(args: ConnectArguments): Promise<{ approval: Promise<Session> }>;
  request(args: { chainId: ChainId; request: RequestArguments }): Promise<any>;

  on(
    eventName: 'session_event',
    listener: (arg: { params: { event: Event; chainId: ChainId } }) => void,
  ): this;
  on(eventName: string, listener: (...args: unknown[]) => void): this;
  once(
    eventName: 'session_event',
    listener: (arg: { params: { event: Event; chainId: ChainId } }) => void,
  ): this;
  once(eventName: string, listener: (...args: unknown[]) => void): this;
  removeListener(eventName: string, listener: Function): this;
  removeAllListeners(eventName: string): this;
}
