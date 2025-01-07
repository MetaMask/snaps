import { Mutex } from 'async-mutex';

/**
 * Run a function with an async mutex, ensuring that only one instance of the
 * function can run at a time.
 *
 * @param fn - The function to run with a mutex.
 * @returns The wrapped function.
 * @template OriginalFunction - The original function type. This is inferred
 * from the `fn` argument, and used to determine the return type of the
 * wrapped function.
 */
export function withMutex<
  OriginalFunction extends (...args: any[]) => Promise<Type>,
  Type,
>(
  fn: OriginalFunction,
): (...args: Parameters<OriginalFunction>) => Promise<Type> {
  const mutex = new Mutex();

  return async (...args: Parameters<OriginalFunction>) => {
    return await mutex.runExclusive(async () => await fn(...args));
  };
}
