import { withTeardown } from '../utils';

/**
 * This class wraps a Response object.
 * That way, a teardown process can stop any processes left.
 */
class ResponseWrapper implements Response {
  readonly #teardownRef: { lastTeardown: number };

  #ogResponse: Response;

  constructor(ogResponse: Response, teardownRef: { lastTeardown: number }) {
    this.#ogResponse = ogResponse;
    this.#teardownRef = teardownRef;
  }

  get body(): ReadableStream<Uint8Array> | null {
    return this.#ogResponse.body;
  }

  get bodyUsed() {
    return this.#ogResponse.bodyUsed;
  }

  get headers() {
    return this.#ogResponse.headers;
  }

  get ok() {
    return this.#ogResponse.ok;
  }

  get redirected() {
    return this.#ogResponse.redirected;
  }

  get status() {
    return this.#ogResponse.status;
  }

  get statusText() {
    return this.#ogResponse.statusText;
  }

  get type() {
    return this.#ogResponse.type;
  }

  get url() {
    return this.#ogResponse.url;
  }

  async text() {
    return withTeardown<string>(this.#ogResponse.text(), this as any);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return withTeardown<ArrayBuffer>(
      this.#ogResponse.arrayBuffer(),
      this as any,
    );
  }

  async blob(): Promise<Blob> {
    return withTeardown<Blob>(this.#ogResponse.blob(), this as any);
  }

  clone(): Response {
    const newResponse = this.#ogResponse.clone();
    return new ResponseWrapper(newResponse, this.#teardownRef);
  }

  async formData(): Promise<FormData> {
    return withTeardown<FormData>(this.#ogResponse.formData(), this as any);
  }

  async json(): Promise<any> {
    return withTeardown(this.#ogResponse.json(), this as any);
  }
}

/**
 * Create a network endowment, consisting of a `fetch` function.
 * This allows us to provide a teardown function, so that we can cancel
 * any pending requests, connections, streams, etc. that may be open when a snap
 * is terminated.
 *
 * This wraps the original implementation of `fetch`,
 * to ensure that a bad actor cannot get access to the original function, thus
 * potentially preventing the network requests from being torn down.
 *
 * @returns An object containing a wrapped `fetch`
 * function, as well as a teardown function.
 */
const createNetwork = () => {
  // Open fetch calls or open body streams
  const openConnections = new Set<{ cancel: () => Promise<void> }>();
  // Track last teardown count
  const teardownRef = { lastTeardown: 0 };

  // Remove items from openConnections after they were garbage collected
  const cleanup = new FinalizationRegistry<() => void>(
    /* istanbul ignore next: can't test garbage collection without modifying node parameters */
    (callback) => callback(),
  );

  const _fetch: typeof fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const abortController = new AbortController();
    if (init?.signal !== null && init?.signal !== undefined) {
      const originalSignal = init.signal;
      // Merge abort controllers
      originalSignal.addEventListener(
        'abort',
        () => {
          abortController.abort((originalSignal as any).reason);
        },
        { once: true },
      );
    }

    let res: Response;
    let openFetchConnection: { cancel: () => Promise<void> } | undefined;
    try {
      const fetchPromise = fetch(input, {
        ...init,
        signal: abortController.signal,
      });

      openFetchConnection = {
        cancel: async () => {
          abortController.abort();
          try {
            await fetchPromise;
          } catch {
            /* do nothing */
          }
        },
      };
      openConnections.add(openFetchConnection);

      res = new ResponseWrapper(
        await withTeardown(fetchPromise, teardownRef),
        teardownRef,
      );
    } finally {
      if (openFetchConnection !== undefined) {
        openConnections.delete(openFetchConnection);
      }
    }

    if (res.body !== null) {
      const body = new WeakRef<ReadableStream>(res.body);

      const openBodyConnection = {
        cancel:
          /* istanbul ignore next: see it.todo('can be torn down during body read') test */
          async () => {
            try {
              await body.deref()?.cancel();
            } catch {
              /* do nothing */
            }
          },
      };
      openConnections.add(openBodyConnection);
      cleanup.register(
        res.body,
        /* istanbul ignore next: can't test garbage collection without modifying node parameters */
        () => openConnections.delete(openBodyConnection),
      );
    }
    return harden(res);
  };

  const teardownFunction = async () => {
    teardownRef.lastTeardown += 1;
    const promises: Promise<void>[] = [];
    openConnections.forEach(({ cancel }) => promises.push(cancel()));
    openConnections.clear();
    await Promise.all(promises);
  };

  return {
    fetch: harden(_fetch),
    teardownFunction,
  };
};

const endowmentModule = {
  names: ['fetch'] as const,
  factory: createNetwork,
};
export default endowmentModule;
