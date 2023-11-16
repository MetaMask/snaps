// eslint-disable-next-line import/unambiguous
declare module 'readable-stream' {
  export type {
    DuplexOptions,
    Readable,
    Writable,
    TransformCallback,
  } from 'stream';
  export { Transform, Duplex, pipeline } from 'stream';
}
