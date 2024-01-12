// eslint-disable-next-line import/unambiguous
declare module 'pumpify' {
  import type { Duplex } from 'readable-stream';

  export default function pumpify(...streams: Duplex[]): Duplex;
}
