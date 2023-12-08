// eslint-disable-next-line import/unambiguous
declare module 'browserify-zlib' {
  import type { Transform } from 'readable-stream';

  export function createGunzip(): Transform;
}
