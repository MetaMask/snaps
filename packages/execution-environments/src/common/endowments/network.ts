type WebSocketCloseCallback = (this: WebSocket, ev: CloseEvent) => any;

const createNetwork = () => {
  // Open fetch calls or open body streams or open websockets
  const openConnections = new Set<{ cancel: () => Promise<void> }>();

  // Remove items from openConnections after they were garbage collected
  const cleanup = new FinalizationRegistry<() => void>(
    /* istanbul ignore next: can't test garbage collection without modyfing node parameters */
    (callback) => callback(),
  );

  const _fetch: typeof fetch = async (
    input: RequestInfo,
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
    let openFethConnection: { cancel: () => Promise<void> } | undefined;
    try {
      const fetchPromise = fetch(input, {
        ...init,
        signal: abortController.signal,
      });

      openFethConnection = {
        cancel: async () => {
          abortController.abort();
          try {
            await fetchPromise;
          } catch {
            /* do nothing */
          }
        },
      };
      openConnections.add(openFethConnection);

      res = await fetchPromise;
    } finally {
      if (openFethConnection !== undefined) {
        openConnections.delete(openFethConnection);
      }
    }

    if (res.body !== null) {
      const body = new WeakRef<ReadableStream>(res.body);
      const openBodyConnection = {
        cancel:
          /* istanbul ignore next: see it.todo('can be torn down during body read') test */
          async () => await body.deref()?.cancel(),
      };
      openConnections.add(openBodyConnection);
      cleanup.register(
        res.body,
        /* istanbul ignore next: can't test garbage collection without modyfing node parameters */
        () => openConnections.delete(openBodyConnection),
      );
    }
    return res;
  };

  /**
   * This class wraps a WebSocket object instead of extending it.
   * That way, a bad actor can't get access to original methods using socket.prototype
   *
   * When modyfing this class, ensure that no method calls any other method from the same class (#socket calls are fine).
   * Otherwise a bad actor could replace one of the implementations
   */
  const _WebSocket = class implements WebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      this.#socket = new WebSocket(url, protocols);

      // You can't call ref.deref()?.#teardownClose()
      // But you can capture the close itself
      const ref = new WeakRef(this.#teardownClose.bind(this));
      const openConnection = {
        cancel: async () => await ref.deref()?.(),
      };
      openConnections.add(openConnection);
      cleanup.register(
        this,
        /* istanbul ignore next: can't test garbage collection without modyfing node parameters */
        () => openConnections.delete(openConnection),
      );
    }

    /* istanbul ignore next: mock implementation has a bug https://github.com/thoov/mock-socket/issues/242 */
    get onclose(): WebSocketCloseCallback | null {
      return this.#socket.onclose;
    }

    set onclose(callback: WebSocketCloseCallback | null) {
      if (this.#isTornDown !== true) {
        this.#socket.onclose = callback;
      }
    }

    /* istanbul ignore next: mock implementation has a bug https://github.com/thoov/mock-socket/issues/242 */
    get onerror(): ((this: WebSocket, ev: Event) => any) | null {
      return this.#socket.onerror;
    }

    set onerror(callback: ((this: WebSocket, ev: Event) => any) | null) {
      this.#socket.onerror = callback;
    }

    /* istanbul ignore next: mock implementation has a bug https://github.com/thoov/mock-socket/issues/242 */
    get onmessage(): ((this: WebSocket, ev: MessageEvent<any>) => any) | null {
      return this.#socket.onmessage;
    }

    set onmessage(
      callback: ((this: WebSocket, ev: MessageEvent<any>) => any) | null,
    ) {
      this.#socket.onmessage = callback;
    }

    /* istanbul ignore next: mock implementation has a bug https://github.com/thoov/mock-socket/issues/242 */
    get onopen(): ((this: WebSocket, ev: Event) => any) | null {
      return this.#socket.onopen;
    }

    set onopen(callback: ((this: WebSocket, ev: Event) => any) | null) {
      this.#socket.onopen = callback;
    }

    close(code?: number, reason?: string): void {
      this.#socket.close(code, reason);
    }

    send(data: string | Blob | ArrayBufferView | ArrayBufferLike): void {
      this.#socket.send(data);
    }

    get CLOSED(): number {
      return this.#socket.CLOSED;
    }

    get CLOSING(): number {
      return this.#socket.CLOSING;
    }

    get CONNECTING(): number {
      return this.#socket.CONNECTING;
    }

    get OPEN(): number {
      return this.#socket.OPEN;
    }

    get binaryType(): BinaryType {
      return this.#socket.binaryType;
    }

    set binaryType(value: BinaryType) {
      this.#socket.binaryType = value;
    }

    get bufferedAmount(): number {
      return this.#socket.bufferedAmount ?? 0;
    }

    get extensions(): string {
      return this.#socket.extensions ?? '';
    }

    get protocol(): string {
      return this.#socket.protocol;
    }

    get readyState(): number {
      return this.#socket.readyState;
    }

    get url(): string {
      return this.#socket.url;
    }

    addEventListener<K extends keyof WebSocketEventMap>(
      type: K,
      listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;

    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;

    addEventListener(type: any, listener: any, options?: any): void {
      if (this.#isTornDown !== true) {
        if (type === 'close') {
          this.#closeEvents.add(listener);
        }
        this.#socket.addEventListener(type, listener, options);
      }
    }

    removeEventListener<K extends keyof WebSocketEventMap>(
      type: K,
      listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;

    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;

    removeEventListener(type: any, listener: any, options?: any): void {
      this.#closeEvents.delete(listener);
      this.#socket.removeEventListener(type, listener, options);
    }

    dispatchEvent(event: Event): boolean {
      // Can't call close prematurely before the teardown finishes
      if (event.type !== 'close' || this.#isTornDown !== true) {
        return this.#socket.dispatchEvent(event);
      }
      return false;
    }

    #teardownClose() {
      // We clear all close listeners
      this.#socket.onclose = null;
      for (const callback of this.#closeEvents) {
        this.#socket.removeEventListener('close', callback);
      }
      this.#closeEvents.clear();

      // We add our own listener
      let onClosedResolve: any;
      const onClosed = new Promise<void>((r) => (onClosedResolve = r));
      this.#socket.onclose = () => {
        onClosedResolve();
      };

      // No new listeners can be added after this point
      this.#isTornDown = true;

      this.#socket.close();

      return onClosed;
    }

    #socket: WebSocket;

    /**
     * After this is set to true, no new event listeners can be added
     */
    #isTornDown = false;

    #closeEvents = new Set<WebSocketCloseCallback>();
  };

  const teardownFunction = async () => {
    const promises: Promise<void>[] = [];
    openConnections.forEach(({ cancel }) => promises.push(cancel()));
    openConnections.clear();
    await Promise.all(promises);
  };

  return {
    fetch: _fetch,
    WebSocket: _WebSocket,
    teardownFunction,
  };
};

const endowmentModule = {
  names: ['fetch', 'WebSocket'] as const,
  factory: createNetwork,
};
export default endowmentModule;
