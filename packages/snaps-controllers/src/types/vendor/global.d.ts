export {};

// eslint-disable-next-line import/unambiguous
declare global {
  class DecompressionStream extends TransformStream<Uint8Array, Uint8Array> {
    constructor(format?: string);
  }
}
