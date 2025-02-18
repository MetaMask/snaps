import type { WriteFileFunction } from '@metamask/snaps-utils/node';
import { promises as fs } from 'fs';
import * as babel from 'prettier/plugins/babel';
// TODO: Either fix this lint violation or explain why it's necessary to ignore.
// eslint-disable-next-line import-x/namespace
import * as estree from 'prettier/plugins/estree';
import { format } from 'prettier/standalone';

/**
 * Format the manifest data with Prettier and write it to disk.
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
  const formattedManifest = await format(data, {
    tabWidth: 2,
    parser: 'json',
    filepath: path,
    plugins: [babel, estree],
  });

  await writeFileFn(path, formattedManifest);
}
