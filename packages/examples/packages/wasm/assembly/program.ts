/* eslint-disable */

/**
 * Get a fibonacci number after `n` iterations (Fₙ), starting from 1. This is a
 * TypeScript function that will be compiled to WebAssembly, using
 * AssemblyScript. This function is exported, so that it can be called from the
 * snap.
 *
 * @param n - The number of iterations.
 * @returns The `nth` fibonacci number (Fₙ).
 * @see https://www.assemblyscript.org/introduction.html
 */
export function fibonacci(n: i32): i32 {
  let a = 0,
    b = 1;

  // If `n` is greater than 0, then iterate `n` times. Otherwise, return 0.
  if (n > 0) {
    while (--n) {
      let t = a + b;
      a = b;
      b = t;
    }

    return b;
  }

  return a;
}
