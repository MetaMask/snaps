import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { bytesToHex, bytesToString } from '@metamask/utils';

import { decodeBase64 } from './base64';

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
