/**
 * Creates a pair of `setInterval` and `clearInterval` functions attenuated such
 * that:
 * - `setInterval` throws if its "handler" parameter is not a function.
 * - `clearInterval` only clears timeouts created by its sibling `setInterval`,
 *   or else no-ops.
 *
 * @returns An object with the attenuated `setInterval` and `clearInterval`
 * functions.
 */
const createInterval = () => {
  const registeredIntervals = new Set<unknown>();

  const _setInterval = (handler: TimerHandler, timeout?: number): unknown => {
    if (typeof handler !== 'function') {
      throw new Error(
        `The interval handler must be a function. Received: ${typeof handler}`,
      );
    }

    const handle = setInterval(handler, timeout);
    registeredIntervals.add(handle);
    return handle;
  };

  const _clearInterval = (handle: unknown): void => {
    if (registeredIntervals.has(handle)) {
      clearInterval(handle as any);
      registeredIntervals.delete(handle);
    }
  };

  const _teardown = (): void => {
    for (const timeout of registeredIntervals) {
      _clearInterval(timeout);
    }
  };

  return {
    setInterval: _setInterval,
    clearInterval: _clearInterval,
    _teardown,
  } as const;
};

const endowmentModule = {
  names: ['setInterval', 'clearInterval'] as const,
  factory: createInterval,
};
export default endowmentModule;
