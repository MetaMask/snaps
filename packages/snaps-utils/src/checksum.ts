import { assert, concatBytes } from '@metamask/utils';
import { sha256 } from '@noble/hashes/sha256';

import { VirtualFile } from './virtual-file/VirtualFile';

/**
 * Calculates checksum for a single byte array.
 *
 * @param bytes - The byte array to calculate the checksum for.
 * @returns A single sha-256 checksum.
 */
export function checksum(bytes: VirtualFile | Uint8Array | string): Uint8Array {
  const value = bytes instanceof VirtualFile ? bytes.value : bytes;
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
    concatBytes(
      [...files]
        .sort((a, b) => {
          assert(
            a.path !== b.path,
            'Tried to sort files with non-unique paths.',
          );
          if (a.path < b.path) {
            return -1;
          }
          return 1;
        })
        .map((file) => checksum(file)),
    ),
  );
}
