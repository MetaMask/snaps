import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import type { VirtualFile } from '@metamask/snaps-utils';
import { encodeAuxiliaryFile, normalizeRelative } from '@metamask/snaps-utils';

/**
 * Get a statically defined Snap file from an array of files.
 *
 * @param files - The Snap files.
 * @param path - The file path.
 * @param encoding - The requested file encoding.
 * @returns The file in the requested encoding if found, otherwise null.
 */
export async function getSnapFile(
  files: VirtualFile[],
  path: string,
  encoding: AuxiliaryFileEncoding = AuxiliaryFileEncoding.Base64,
) {
  const normalizedPath = normalizeRelative(path);
  const base64 = files
    .find((file) => file.path === normalizedPath)
    ?.toString('base64');

  if (!base64) {
    return null;
  }

  return await encodeAuxiliaryFile(base64, encoding);
}
