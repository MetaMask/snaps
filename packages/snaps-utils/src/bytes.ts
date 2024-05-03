import { stringToBytes } from '@metamask/utils';

import { VirtualFile } from './virtual-file/VirtualFile';

/**
 * Convert a bytes-like input value to a Uint8Array.
 *
 * @param bytes - A bytes-like value.
 * @returns The input value converted to a Uint8Array if necessary.
 */
export function getBytes(bytes: VirtualFile | Uint8Array | string): Uint8Array {
  // Unwrap VirtualFiles to extract the content
  // The content is then either a string or Uint8Array
  const unwrapped = bytes instanceof VirtualFile ? bytes.value : bytes;

  if (typeof unwrapped === 'string') {
    return stringToBytes(unwrapped);
  }

  return unwrapped;
}
