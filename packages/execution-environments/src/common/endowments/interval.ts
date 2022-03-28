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
  const registeredIntervals = new Set<number>();

  const _setInterval = (handler: TimerHandler, timeout?: number): number => {
    if (typeof handler !== 'function') {
      throw new Error(
        `The interval handler must be a function. Received: ${typeof handler}`,
      );
    }

    const handleWrapper: { handle: number } = { handle: NaN };
    // @todo Should we return a number that we decide for NodeJS?
    handleWrapper.handle = setInterval(handler, timeout) as any;

    registeredIntervals.add(handleWrapper.handle);
    return handleWrapper.handle;
  };

  const _clearInterval = (handle: number): void => {
    if (registeredIntervals.has(handle)) {
      clearInterval(handle);
      registeredIntervals.delete(handle);
    }
  };

  return { setInterval: _setInterval, clearInterval: _clearInterval } as const;
};

const endowmentModule = {
  names: ['setInterval', 'clearInterval'] as const,
  factory: createInterval,
};
export default endowmentModule;
