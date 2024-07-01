import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { assert, bytesToHex, bytesToString } from '@metamask/utils';

import { decodeBase64 } from './base64';
import { MAX_FILE_SIZE } from './constants';
import type { VirtualFile } from './virtual-file';

/**
 * Re-encodes an auxiliary file if needed depending on the requested file encoding.
 *
 * @param value - The base64 value stored for the auxiliary file.
 * @param encoding - The chosen encoding.
 * @returns The file encoded in the requested encoding.
 */
export async function encodeAuxiliaryFile(
  value: string,
  encoding: AuxiliaryFileEncoding,
) {
  // Input is assumed to be the stored file in base64.
  if (encoding === AuxiliaryFileEncoding.Base64) {
    return value;
  }

  // TODO: Use @metamask/utils for this
  const decoded = await decodeBase64(value);
  if (encoding === AuxiliaryFileEncoding.Utf8) {
    return bytesToString(decoded);
  }

  return bytesToHex(decoded);
}

/**
 * Validate that auxiliary files used by the Snap are within size limits.
 *
 * @param files - A list of auxiliary files.
 */
export function validateAuxiliaryFiles(files: VirtualFile[]) {
  for (const file of files) {
    assert(
      file.size < MAX_FILE_SIZE,
      'Static files required by the Snap must be smaller than 64 MB.',
    );
  }
}
