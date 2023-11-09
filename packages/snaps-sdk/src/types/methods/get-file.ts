import type { EnumToUnion } from '../../internals';

/**
 * The encoding to use when retrieving the file. Defaults to `Base64`.
 */
export enum AuxiliaryFileEncoding {
  Base64 = 'base64',
  Hex = 'hex',
  Utf8 = 'utf8',
}

/**
 * The request parameters for the `snap_getFile` method.
 *
 * @property path - The path to the file to retrieve.
 * @property encoding - The encoding to use when retrieving the file.
 */
export type GetFileParams = {
  path: string;
  encoding?: EnumToUnion<AuxiliaryFileEncoding>;
};

/**
 * The result returned by the `snap_getFile` method.
 */
export type GetFileResult = string;
