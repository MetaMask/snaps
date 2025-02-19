declare module 'readable-stream' {
  export type { DuplexOptions, Writable, TransformCallback } from 'stream';
  export { Readable, Transform, Duplex, pipeline } from 'stream';
}
