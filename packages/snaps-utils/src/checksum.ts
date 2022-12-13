import { assert } from '@metamask/utils';
import { sha256 } from '@noble/hashes/sha256';

import { VirtualFile } from './virtual-file/VirtualFile';

/**
 * Calculates checksum for a single buffer.
 *
 * @param buffer - The buffer to calculate the checksum over.
 * @returns A single sha-256 checksum.
 */
export function checksum(
  buffer: VirtualFile | Uint8Array | string,
): Uint8Array {
  const value = buffer instanceof VirtualFile ? buffer.value : buffer;
  return sha256(value);
}

/**
 * Calculates checksum over multiple files in a reproducible way.
 *
 * 1. Sort all the files by their paths.
 * 2. Calculate sha-256 checksum of each file separately.
 * 3. Concatenate all the checksums into one buffer and sha-256 that buffer.
 *
 * The sorting of paths is done using {@link https://tc39.es/ecma262/#sec-islessthan UTF-16 Code Units}.
 *
 * @param files - The files over which to calculate the checksum.
 * @returns A single sha-256 checksum.
 */
export function checksumFiles(files: VirtualFile[]) {
  return checksum(
    concat(
      ...[...files]
        // eslint-disable-next-line consistent-return, array-callback-return
        .sort((a, b) => {
          if (a.path < b.path) {
            return -1;
          } else if (a.path > b.path) {
            return 1;
          }
          assert(false, 'Tried to sort files with non-unique paths.');
        })
        .map((file) => checksum(file)),
    ),
  );
}

/**
 * Same as {@link Array.concat}, it takes a list of arrays and joins them into one.
 *
 * @param chunks - The arrays to concatenate.
 * @returns An array of all the chunks concatenated in order.
 */
function concat(...chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);

  let currentLength = 0;
  for (const chunk of chunks) {
    result.set(chunk, currentLength);
    currentLength += chunk.length;
  }
  assert(currentLength === totalLength);
  return result;
}
