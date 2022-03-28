/**
 * Creates a pair of `setTimeout` and `clearTimeout` functions attenuated such
 * that:
 * - `setTimeout` throws if its "handler" parameter is not a function.
 * - `clearTimeout` only clears timeouts created by its sibling `setTimeout`,
 *   or else no-ops.
 *
 * @returns An object with the attenuated `setTimeout` and `clearTimeout`
 * functions.
 */
const createTimeout = () => {
  const registeredTimeouts = new Set<unknown>();

  const _setTimeout = (handler: TimerHandler, timeout?: number): unknown => {
    if (typeof handler !== 'function') {
      throw new Error(
        `The timeout handler must be a function. Received: ${typeof handler}`,
      );
    }

    const handle = setTimeout(() => {
      registeredTimeouts.delete(handle);
      handler();
    }, timeout);

    registeredTimeouts.add(handle);
    return handle;
  };

  const _clearTimeout = (handle: unknown): void => {
    if (registeredTimeouts.has(handle)) {
      clearTimeout(handle as any);
      registeredTimeouts.delete(handle);
    }
  };

  return { setTimeout: _setTimeout, clearTimeout: _clearTimeout } as const;
};

const endowmentModule = {
  names: ['setTimeout', 'clearTimeout'] as const,
  factory: createTimeout,
};
export default endowmentModule;
