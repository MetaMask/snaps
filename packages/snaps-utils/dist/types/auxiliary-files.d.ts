import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
/**
 * Re-encodes an auxiliary file if needed depending on the requested file encoding.
 *
 * @param value - The base64 value stored for the auxiliary file.
 * @param encoding - The chosen encoding.
 * @returns The file encoded in the requested encoding.
 */
export declare function encodeAuxiliaryFile(value: string, encoding: AuxiliaryFileEncoding): Promise<string>;
