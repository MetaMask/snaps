import type { VirtualFile } from './virtual-file';
/**
 * Provides fast, asynchronous base64 encoding.
 *
 * @param input - The input value, assumed to be coercable to bytes.
 * @returns A base64 string.
 */
export declare function encodeBase64(input: Uint8Array | VirtualFile | string): Promise<unknown>;
/**
 * Provides fast, asynchronous base64 decoding.
 *
 * @param base64 - A base64 string.
 * @returns A Uint8Array of bytes.
 */
export declare function decodeBase64(base64: string): Promise<Uint8Array>;
