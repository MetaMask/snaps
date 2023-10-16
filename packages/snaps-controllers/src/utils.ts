import { Timer } from './snaps/Timer';

/**
 * Takes two objects and does a Set Difference of them.
 * Set Difference is generally defined as follows:
 * ```
 * 𝑥 ∈ A ∖ B ⟺ 𝑥 ∈ A ∧ 𝑥 ∉ B
 * ```
 * Meaning that the returned object contains all properties of A expect those that also
 * appear in B. Notice that properties that appear in B, but not in A, have no effect.
 *
 * @see [Set Difference]{@link https://proofwiki.org/wiki/Definition:Set_Difference}
 * @param objectA - The object on which the difference is being calculated.
 * @param objectB - The object whose properties will be removed from objectA.
 * @returns The objectA without properties from objectB.
 */
export function setDiff<
  ObjectA extends Record<any, unknown>,
  ObjectB extends Record<any, unknown>,
>(objectA: ObjectA, objectB: ObjectB): Diff<ObjectA, ObjectB> {
  return Object.entries(objectA).reduce<Record<any, unknown>>(
    (acc, [key, value]) => {
      if (!(key in objectB)) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  ) as Diff<ObjectA, ObjectB>;
}

/**
 * A Promise that delays its return for a given amount of milliseconds.
 *
 * @param ms - Milliseconds to delay the execution for.
 * @param result - The result to return from the Promise after delay.
 * @returns A promise that is void if no result provided, result otherwise.
 * @template Result - The `result`.
 */
export function delay<Result = void>(
  ms: number,
  result?: Result,
): Promise<Result> & { cancel: () => void } {
  return delayWithTimer(new Timer(ms), result);
}

/**
 * A Promise that delays it's return by using a pausable Timer.
 *
 * @param timer - Timer used to control the delay.
 * @param result - The result to return from the Promise after delay.
 * @returns A promise that is void if no result provided, result otherwise.
 * @template Result - The `result`.
 */
export function delayWithTimer<Result = void>(
  timer: Timer,
  result?: Result,
): Promise<Result> & { cancel: () => void } {
  let rejectFunc: (reason: Error) => void;
  const promise: any = new Promise<Result>((resolve: any, reject) => {
    timer.start(() => {
      result === undefined ? resolve() : resolve(result);
    });
    rejectFunc = reject;
  });

  promise.cancel = () => {
    if (timer.status !== 'finished') {
      timer.cancel();
      rejectFunc(new Error('The delay has been canceled.'));
    }
  };
  return promise;
}

/*
 * We use a Symbol instead of rejecting the promise so that Errors thrown
 * by the main promise will propagate.
 */
export const hasTimedOut = Symbol(
  'Used to check if the requested promise has timeout (see withTimeout)',
);

/**
 * Executes the given Promise, if the Timer expires before the Promise settles, we return earlier.
 *
 * NOTE:** The given Promise is not cancelled or interrupted, and will continue to execute uninterrupted. We will just discard its result if it does not complete before the timeout.
 *
 * @param promise - The promise that you want to execute.
 * @param timerOrMs - The timer controlling the timeout or a ms value.
 * @returns The resolved `PromiseValue`, or the hasTimedOut symbol if
 * returning early.
 * @template PromiseValue - The value of the Promise.
 */
export async function withTimeout<PromiseValue = void>(
  promise: Promise<PromiseValue>,
  timerOrMs: Timer | number,
): Promise<PromiseValue | typeof hasTimedOut> {
  const timer =
    typeof timerOrMs === 'number' ? new Timer(timerOrMs) : timerOrMs;
  const delayPromise = delayWithTimer(timer, hasTimedOut);
  try {
    return await Promise.race([promise, delayPromise]);
  } finally {
    delayPromise.cancel();
  }
}

/**
 * Checks whether the type is composed of literal types
 *
 * @returns @type {true} if whole type is composed of literals, @type {false} if whole type is not literals, @type {boolean} if mixed
 * @example
 * ```
 * type t1 = IsLiteral<1 | 2 | "asd" | true>;
 * // t1 = true
 *
 * type t2 = IsLiteral<number | string>;
 * // t2 = false
 *
 * type t3 = IsLiteral<1 | string>;
 * // t3 = boolean
 *
 * const s = Symbol();
 * type t4 = IsLiteral<typeof s>;
 * // t4 = true
 *
 * type t5 = IsLiteral<symbol>
 * // t5 = false;
 * ```
 */
type IsLiteral<Type> = Type extends string | number | boolean | symbol
  ? Extract<string | number | boolean | symbol, Type> extends never
    ? true
    : false
  : false;

/**
 * Returns all keys of an object, that are literal, as an union
 *
 * @example
 * ```
 * type t1 = _LiteralKeys<{a: number, b: 0, c: 'foo', d: string}>
 * // t1 = 'b' | 'c'
 * ```
 * @see [Literal types]{@link https://www.typescriptlang.org/docs/handbook/literal-types.html}
 */
type LiteralKeys<Type> = NonNullable<
  {
    [Key in keyof Type]: IsLiteral<Key> extends true ? Key : never;
  }[keyof Type]
>;

/**
 * Returns all keys of an object, that are not literal, as an union
 *
 * @example
 * ```
 * type t1 = _NonLiteralKeys<{a: number, b: 0, c: 'foo', d: string}>
 * // t1 = 'a' | 'd'
 * ```
 * @see [Literal types]{@link https://www.typescriptlang.org/docs/handbook/literal-types.html}
 */
type NonLiteralKeys<Type> = NonNullable<
  {
    [Key in keyof Type]: IsLiteral<Key> extends false ? Key : never;
  }[keyof Type]
>;

/**
 * A set difference of two objects based on their keys
 *
 * @example
 * ```
 * type t1 = Diff<{a: string, b: string}, {a: number}>
 * // t1 = {b: string};
 * type t2 = Diff<{a: string, 0: string}, Record<string, unknown>>;
 * // t2 = { a?: string, 0: string};
 * type t3 = Diff<{a: string, 0: string, 1: string}, Record<1 | string, unknown>>;
 * // t3 = {a?: string, 0: string}
 * ```
 * @see {@link setDiff} for the main use-case
 */
export type Diff<First, Second> = Omit<First, LiteralKeys<Second>> &
  Partial<Pick<First, Extract<keyof First, NonLiteralKeys<Second>>>>;

/**
 * Makes every specified property of the specified object type mutable.
 *
 * @template Type - The object whose readonly properties to make mutable.
 * @template TargetKey - The property key(s) to make mutable.
 */
export type Mutable<
  Type extends Record<string, unknown>,
  TargetKey extends string,
> = {
  -readonly [Key in keyof Pick<Type, TargetKey>]: Type[Key];
} & {
  [Key in keyof Omit<Type, TargetKey>]: Type[Key];
};
