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
 * An object containing the parameters for the `snap_getFile` method.
 */
export type GetFileParams = {
  /**
   * The path to the file, relative to the Snap's package directory
   * (that is, one level above `src`).
   */
  path: string;

  /**
   * The encoding to use when retrieving the file. Defaults to `base64`.
   */
  encoding?: EnumToUnion<AuxiliaryFileEncoding>;
};

/**
 * The file content as a string in the requested encoding.
 */
export type GetFileResult = string;
