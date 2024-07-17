import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import type { VirtualFile } from './virtual-file';
/**
 * Re-encodes an auxiliary file if needed depending on the requested file encoding.
 *
 * @param value - The base64 value stored for the auxiliary file.
 * @param encoding - The chosen encoding.
 * @returns The file encoded in the requested encoding.
 */
export declare function encodeAuxiliaryFile(value: string, encoding: AuxiliaryFileEncoding): Promise<string>;
/**
 * Validate that auxiliary files used by the Snap are within size limits.
 *
 * @param files - A list of auxiliary files.
 */
export declare function validateAuxiliaryFiles(files: VirtualFile[]): void;
