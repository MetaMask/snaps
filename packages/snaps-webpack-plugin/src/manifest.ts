import type { WriteFileFunction } from '@metamask/snaps-utils/node';
import { promises as fs } from 'fs';
import { format, resolveConfig } from 'prettier';

/**
 * Write the manifest to disk.
 *
 * @param path - The path to write the manifest to.
 * @param data - The manifest data.
 * @param writeFileFn - The function to use to write the manifest.
 * @returns A promise that resolves when the manifest has been written.
 */
export async function writeManifest(
  path: string,
  data: string,
  writeFileFn: WriteFileFunction = fs.writeFile,
) {
  const config = await resolveConfig(path, {
    editorconfig: true,
  });

  const formattedManifest = format(data, {
    ...config,
    parser: 'json',
    filepath: path,
  });

  await writeFileFn(path, formattedManifest);
}
