import { assert, AssertionError } from './assert';

/**
 * We use a symbol so that the Option can represent Some(undefined)
 */
const nothing = Symbol('Internal symbol that means no data in Option');

function isSome<T>(data: T | typeof nothing): data is T {
  return data !== nothing;
}
function isNone<T>(data: T | typeof nothing): data is typeof nothing {
  return data === nothing;
}

export function Maybe<T>(data: T | undefined | null): Option<T> {
  return Option.Maybe(data);
}
export function Some<T>(data: T): Option<T> {
  return Option.Some(data);
}
export function None<T>(): Option<T> {
  return Option.None();
}
/**
 * @see {@link Option.flat}
 * @see {@link Array.flat}
 */
// TODO(ritave): Make fully recursive when we move to TS4.8 https://github.com/microsoft/TypeScript/issues/14833#issuecomment-1238924118
type FlatOption<Opt, Depth extends number> = {
  done: Opt;
  recur: Opt extends Option<infer InnerOpt>
    ? FlatOption<
        InnerOpt,
        [
          -1,
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
        ][Depth]
      >
    : Opt;
}[Depth extends -1 ? 'done' : 'recur'];

// Inspired by rust https://doc.rust-lang.org/std/option/
export class Option<T> {
  static Maybe<T>(data: T | undefined | null): Option<T> {
    return new Option(data ?? nothing);
  }
  static Some<T>(data: T): Option<T> {
    return new Option(data);
  }
  static None<T>(): Option<T> {
    return new Option<T>(nothing);
  }

  private constructor(private readonly data: T | typeof nothing) {}

  get isSome() {
    return isSome(this.data);
  }

  get isNone() {
    return isNone(this.data);
  }

  // Exhaustive logic
  /**
   * Run logic based on what's inside this Option in a fully exhaustive way.
   * This allows you to catch logic errors during compile time.
   *
   * @example
   * ```typescript
   * const option = Some(5);
   *
   * const add5 = option.switch({
   *  some: v => v + 5,
   *  none: () => 5
   * });
   *
   * const add6 = option.switch(
   *  v => v + 6,
   *  () => 6
   * );
   * ```
   *
   * @param args Functions to execute based on whether it's Some or None.
   * @returns What the `args` returned.
   */
  switch<U>(fns: { some: (data: T) => U; none: () => U }): U;
  switch<U>(onSome: (data: T) => U, onNone: () => U): U;
  switch<U>(
    ...args:
      | [{ some: (data: T) => U; none: () => U }]
      | [(data: T) => U, () => U]
  ): U {
    const { some, none } =
      args.length === 1 ? args[0] : { some: args[0], none: args[1] };
    if (isSome(this.data)) {
      return some(this.data);
    }
    return none();
  }

  /**
   * Execute logic based on what's inside this option.
   *
   * @param param0 Function to execute or undefined.
   * @returns What the function returned or undefined if it was undefined.
   */
  switchPartial<U>({
    some,
    none,
  }: {
    some?: (data: T) => U;
    none?: () => U;
  }): U | undefined {
    if (isSome(this.data)) {
      return some?.(this.data);
    }
    return none?.();
  }

  // Extracting values
  /**
   * Unwraps the value or raises an Error when None.
   *
   * @param error The error message or Error type to throw if is None.
   * @returns The unwrapped value.
   */
  expect(error?: string | Error): T {
    if (isNone(this.data)) {
      let myError;
      if (typeof error === 'string') {
        myError = new AssertionError({ message: error });
      } else if (error instanceof Error) {
        myError = error;
      } else {
        myError = new AssertionError({ message: 'Tried to unwrap None' });
      }
      throw myError;
    }
    return this.data;
  }

  /**
   * Unwraps the value or returns a default value if None.
   *
   * @param defaultValue The value to return in case of None.
   * @returns Unwrapped value or `defaultValue`.
   */
  unwrapOr(defaultValue: T): T {
    if (isNone(this.data)) {
      return defaultValue;
    }
    return this.data;
  }
  /**
   * Unwraps the value or returns the result of function execution in case of None.
   *
   * @param orElse Function that returns a value in case of None.
   * @returns Unwrapped value or result of `orElse()`.
   */
  unwrapOrElse(orElse: () => T): T {
    if (isNone(this.data)) {
      return orElse();
    }
    return this.data;
  }

  // Transforming values
  /**
   * Filters based on internal value.
   *
   * @param predicate Test function that filters down Some(v).
   * @returns Returns Some(v) if predicate is true, None otherwise.
   */
  filter(predicate: (data: T) => boolean): Option<T> {
    if (isNone(this.data) || predicate(this.data) === false) {
      return Option.None<T>();
    }
    return this;
  }

  /**
   * Converts `Option<Option<T>>` to `Option<T>`, no-op otherwise.
   *
   * @param depth The amount of levels to flatten. Defaults to 1
   * @returns Flattened Option
   */
  flat<O extends Option<any>, D extends number = 1>(
    this: O,
    depth?: D,
  ): Option<FlatOption<O, D>> {
    let myDepth = depth ?? 1;
    assert(
      myDepth >= 0,
      new TypeError('depth has to be an integer greater than or equal to zero'),
    );

    let result: Option<any> = this;
    while (result.data instanceof Option && myDepth > 0) {
      result = result.expect();
      myDepth -= 1;
    }
    return result;
  }

  /**
   * Maps Some(v) to Some(u). No-op for None.
   * @param fn The function to run on the value.
   * @returns Option with mapped value.
   */
  map<U>(fn: (data: T) => U): Option<U> {
    if (isNone(this.data)) {
      return this as any;
    }
    return Option.Some(fn(this.data));
  }

  /**
   * Maps Some(v) to Some(u). Some(defaultValue) for None.
   *
   * @param fn The function to run on the value.
   * @param defaultValue The value to return in case of None.
   * @returns Option with mapped or default value.
   */
  mapOr<U>(fn: (data: T) => U, defaultValue: U): Option<U> {
    if (isNone(this.data)) {
      return Option.Some(defaultValue);
    }
    return Option.Some(fn(this.data));
  }
  /**
   * Maps Some(v) to Some(u). `orElse()` for None.
   *
   * @param fn The function to run on the value.
   * @param orElse The function to execute in case of None.
   * @returns Option with mapped value or with result of `orElse()`.
   */
  mapOrElse<U>(fn: (data: T) => U, orElse: () => U): Option<U> {
    if (isNone(this.data)) {
      return Option.Some(orElse());
    }
    return Option.Some(fn(this.data));
  }

  // Combining values
  /**
   * Zips two Options to a single Option with a tuple.
   *
   * | A       | B       | A.zip(B)     |
   * |---------|---------|--------------|
   * | None    | None    | None         |
   * | Some(u) | None    | None         |
   * | None    | Some(v) | None         |
   * | Some(u) | Some(v) | Some([u, v]) |
   *
   * @param other The Option to zip with.
   * @returns Option with a zipped tuple, None if either was None.
   */
  zip<U>(other: Option<U>): Option<[T, U]> {
    if (this.isNone || other.isNone) {
      return Option.None();
    }
    return Option.Some([this.expect(), other.expect()]);
  }

  // Boolean operations
  /**
   * Short circuit `or` operator for Options.
   *
   * | A       | B       | A or B  |
   * |---------|---------|---------|
   * | None    | None    | None    |
   * | Some(u) | None    | Some(u) |
   * | None    | Some(v) | Some(v) |
   * | Some(u) | Some(v) | Some(u) |
   *
   * @param b The alternative Option to `or` with
   * @returns `Option<u>` or `Option<v>`
   */
  or<U>(b: Option<U>): this | Option<U> {
    if (isNone(this.data)) {
      return b;
    }
    return this;
  }
  /**
   * Returns the option if it contains value, otherwise calls f and returns result
   *
   * @param fn The function to call in case of None. It could possibly return None as well
   * @returns `Option<T>` or `fn()`
   */
  orElse<U>(fn: () => Option<U>): this | Option<U> {
    if (isNone(this.data)) {
      return fn();
    }
    return this;
  }
}
