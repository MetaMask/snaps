import { assert } from '@metamask/utils';

type SpyFunction<Args, Result> = {
  (...args: Args[]): Result;
  calls: { args: Args[]; result: Result }[];
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

  const spyFunction: SpyFunction<Args, Result> = (...args: Args[]): Result => {
    const result = original(...args);
    spyFunction.calls.push({ args, result });

    return result;
  };

  spyFunction.calls = [];
  spyFunction.reset = () => {
    spyFunction.calls = [];
    target[method] = original;
  };

  target[method] = spyFunction as unknown as Target[keyof Target];
  return spyFunction;
};
