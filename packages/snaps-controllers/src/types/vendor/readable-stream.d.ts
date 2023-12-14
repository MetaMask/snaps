// eslint-disable-next-line import/unambiguous
declare module 'readable-stream' {
  export type {
    DuplexOptions,
    Writable,
    TransformCallback,
    Transform,
  } from 'stream';
  export { Duplex, pipeline, Readable } from 'stream';
}
