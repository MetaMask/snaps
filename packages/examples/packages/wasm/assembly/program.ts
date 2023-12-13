/**
 * Add two numbers together. This is an external function, that will be
 * imported from the WebAssembly module, to demonstrate how to import functions
 * from the WebAssembly module.
 *
 * We must use `@external` here to specify the path to the file that contains
 * the function.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns The sum of `a` and `b`.
 */
// eslint-disable-next-line prettier/prettier
@external("../src/bindings.ts", "add")
declare function add(a: i32, b: i32): i32;

/**
 * Get a fibonacci number after `n` iterations (Fₙ), starting from 1. This is a
 * TypeScript function that will be compiled to WebAssembly, using
 * AssemblyScript. This function is exported, so that it can be called from the
 * snap.
 *
 * @param iterations - The number of iterations.
 * @returns The `nth` fibonacci number (Fₙ).
 * @see https://www.assemblyscript.org/introduction.html
 */
export function fibonacci(iterations: i32): i32 {
  let first = 0;
  let second = 1;

  // If `iterations` is greater than 0, then iterate `iterations` times.
  // Otherwise, return 0.
  if (iterations > 0) {
    // eslint-disable-next-line no-param-reassign, no-plusplus
    while (--iterations) {
      const total = add(first, second);
      first = second;
      second = total;
    }

    return second;
  }

  return first;
}
