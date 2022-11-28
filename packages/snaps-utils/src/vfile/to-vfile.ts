import fs from 'fs';
import fsPromises from 'fs/promises';

import { VFile } from './vfile';

/**
 * Reads a file from filesystem and creates a vfile.
 *
 * @param path - Filesystem path to load the contents from.
 * @param encoding - Optional encoding to pass down to fs.readFile.
 * @returns Promise returning VFile with loaded file contents.
 */
export async function readVfile(path: string, encoding?: BufferEncoding) {
  return new VFile({
    path,
    value: await fsPromises.readFile(path, { encoding: encoding ?? null }),
  });
}

/**
 * Reads a file from filesystem and creates a vfile synchronously.
 *
 * @param path - Filesystem path to load the contents from.
 * @param encoding - Optional encoding to pass down to fs.readFile.
 * @returns VFile with loaded file contents.
 */
export function readVfileSync(path: string, encoding?: BufferEncoding) {
  return new VFile({
    path,
    value: fs.readFileSync(path, { encoding: encoding ?? null }),
  });
}

type WriteVFileOptions = Exclude<
  Parameters<typeof fsPromises['writeFile']>[2],
  undefined
>;
type WriteVFileOptionsSync = Exclude<
  Parameters<typeof fs['writeFileSync']>[2],
  undefined
>;

/**
 * Writes vfile to filesystem.
 *
 * @param vfile - The vfile to write.
 * @param options - Options to pass down to fs.writeFile.
 */
export async function writeVFile(vfile: VFile, options?: WriteVFileOptions) {
  return fsPromises.writeFile(vfile.path, vfile.value, options);
}

/**
 * Writes vfile to filesystem, synchronously.
 *
 * @param vfile - The vfile to write.
 * @param options - Options to pass down to fs.writeFile.
 */
export function writeVFileSync(vfile: VFile, options?: WriteVFileOptionsSync) {
  fs.writeFileSync(vfile.path, vfile.value, options);
}
