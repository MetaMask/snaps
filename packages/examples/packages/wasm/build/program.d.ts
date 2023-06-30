declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /**
   * assembly/program/fibonacci
   * @param n `i32`
   * @returns `i32`
   */
  export function fibonacci(n: number): number;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
}): Promise<typeof __AdaptedExports>;
