import { VirtualFile } from './virtual-file/VirtualFile';
/**
 * Convert a bytes-like input value to a Uint8Array.
 *
 * @param bytes - A bytes-like value.
 * @returns The input value converted to a Uint8Array if necessary.
 */
export declare function getBytes(bytes: VirtualFile | Uint8Array | string): Uint8Array;
