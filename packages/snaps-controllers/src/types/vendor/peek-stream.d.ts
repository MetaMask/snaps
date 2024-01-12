// eslint-disable-next-line import/unambiguous
declare module 'peek-stream' {
  import type { Duplex } from 'readable-stream';

  export default function peek(
    input: { newline: boolean; maxBuffer: number },
    callback: (
      data: Buffer,
      callback: (error: Error | null, stream?: Duplex) => void,
    ) => void,
  ): Duplex;
}
