import { bytesToBase64 } from '@metamask/utils';

import { getChecksumBytes } from './checksum';
import type { VirtualFile } from './virtual-file';

/**
 * Provides fast, asynchronous base64 encoding.
 *
 * @param input - The input value, assumed to be coercable to bytes.
 * @returns A base64 string.
 */
export async function asyncEncode(input: Uint8Array | VirtualFile | string) {
  const bytes = getChecksumBytes(input);
  // In the browser, FileReader is much faster than bytesToBase64.
  if ('FileReader' in globalThis) {
    return await new Promise((resolve, reject) => {
      const reader = Object.assign(new FileReader(), {
        onload: () =>
          resolve(
            (reader.result as string).replace(
              'data:application/octet-stream;base64,',
              '',
            ),
          ),
        onerror: () => reject(reader.error),
      });
      reader.readAsDataURL(
        new File([bytes], '', { type: 'application/octet-stream' }),
      );
    });
  }
  return bytesToBase64(bytes);
}

/**
 * Provides fast, asynchronous base64 decoding.
 *
 * @param base64 - A base64 string.
 * @returns A Uint8Array of bytes.
 */
export async function asyncDecode(base64: string) {
  const res = await fetch(`data:application/octet-stream;base64,${base64}`);
  return new Uint8Array(await res.arrayBuffer());
}
