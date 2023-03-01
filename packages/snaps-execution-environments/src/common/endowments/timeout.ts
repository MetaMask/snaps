const MINIMUM_TIMEOUT = 10;

/**
 * Creates a pair of `setTimeout` and `clearTimeout` functions attenuated such
 * that:
 * - `setTimeout` throws if its "handler" parameter is not a function.
 * - `clearTimeout` only clears timeouts created by its sibling `setTimeout`,
 * or else no-ops.
 *
 * @returns An object with the attenuated `setTimeout` and `clearTimeout`
 * functions.
 */
const createTimeout = () => {
  const registeredHandles = new Map<unknown, unknown>();
  const _setTimeout = (handler: TimerHandler, timeout?: number): unknown => {
    if (typeof handler !== 'function') {
      throw new Error(
        `The timeout handler must be a function. Received: ${typeof handler}`,
      );
    }
    harden(handler);
    const handle = Object.freeze(Object.create(null));
    const platformHandle = setTimeout(() => {
      registeredHandles.delete(handle);
      handler();
    }, Math.max(MINIMUM_TIMEOUT, timeout ?? 0));

    registeredHandles.set(handle, platformHandle);
    return handle;
  };

  const _clearTimeout = (handle: unknown): void => {
    const platformHandle = registeredHandles.get(handle);
    if (platformHandle !== undefined) {
      clearTimeout(platformHandle as any);
      registeredHandles.delete(handle);
    }
  };

  const teardownFunction = (): void => {
    for (const handle of registeredHandles.keys()) {
      _clearTimeout(handle);
    }
  };

  return {
    setTimeout: harden(_setTimeout),
    clearTimeout: harden(_clearTimeout),
    teardownFunction,
  } as const;
};

const endowmentModule = {
  names: ['setTimeout', 'clearTimeout'] as const,
  factory: createTimeout,
};
export default endowmentModule;
