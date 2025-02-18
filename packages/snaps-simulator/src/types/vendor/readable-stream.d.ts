/* eslint-disable import-x/unambiguous, import-x/no-nodejs-modules */
declare module 'readable-stream' {
  export type {
    DuplexOptions,
    Readable,
    Writable,
    TransformCallback,
  } from 'stream';
  export { Duplex, pipeline } from 'stream';
}
