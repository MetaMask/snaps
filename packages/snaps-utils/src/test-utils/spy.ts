import { assert } from '@metamask/utils';

export type SpyFunction<Args, Result> = {
  (...args: Args[]): Result;
  mockImplementation: (
    newImplementation: (...args: Args[]) => Result,
  ) => SpyFunction<Args, Result>;
  calls: { args: Args[]; result: Result }[];
  clear(): void;
  reset(): void;
};

/**
 * Spy on a method of an object. This replaces the original method with a spy
 * that records all calls to it.
 *
 * @param target - The object to spy on.
 * @param method - The name of the method to spy on.
 * @returns The spy function.
 */
export const spy = <Target extends object, Args, Result>(
  target: Target,
  method: keyof Target,
) => {
  const unboundOriginal = target[method];

  assert(
    typeof unboundOriginal === 'function',
    `Cannot spy on non-function: ${method.toString()}.`,
  );

  const original = unboundOriginal.bind(target);
  let implementation = original;

  const spyFunction: SpyFunction<Args, Result> = (...args: Args[]): Result => {
    try {
      const result = implementation(...args);
      spyFunction.calls.push({ args, result });

      return result;
    } catch (error) {
      spyFunction.calls.push({ args, result: error });

      throw error;
    }
  };

  spyFunction.calls = [];

  spyFunction.mockImplementation = (newImplementation) => {
    implementation = newImplementation;
    return spyFunction;
  };

  spyFunction.clear = () => {
    spyFunction.calls = [];
  };

  spyFunction.reset = () => {
    spyFunction.calls = [];
    target[method] = original;
  };

  target[method] = spyFunction as unknown as Target[keyof Target];
  return spyFunction;
};
