/**
 * Creates a pair of `setInterval` and `clearInterval` functions attenuated such
 * that:
 * - `setInterval` throws if its "handler" parameter is not a function.
 * - `clearInterval` only clears timeouts created by its sibling `setInterval`,
 * or else no-ops.
 *
 * @returns An object with the attenuated `setInterval` and `clearInterval`
 * functions.
 */
const createInterval = () => {
  const registeredHandles = new Map<unknown, unknown>();

  const _setInterval = (handler: TimerHandler, timeout?: number): unknown => {
    if (typeof handler !== 'function') {
      throw new Error(
        `The interval handler must be a function. Received: ${typeof handler}`,
      );
    }
    const handle = Object.freeze({});
    const platformHandle = setInterval(handler, timeout);
    registeredHandles.set(handle, platformHandle);
    return handle;
  };

  const _clearInterval = (handle: unknown): void => {
    const platformHandle = registeredHandles.get(handle);
    if (platformHandle !== undefined) {
      clearInterval(platformHandle as any);
      registeredHandles.delete(handle);
    }
  };

  const teardownFunction = (): void => {
    for (const handle of registeredHandles.keys()) {
      _clearInterval(handle);
    }
  };

  return {
    setInterval: _setInterval,
    clearInterval: _clearInterval,
    teardownFunction,
  } as const;
};

const endowmentModule = {
  names: ['setInterval', 'clearInterval'] as const,
  factory: createInterval,
};
export default endowmentModule;
