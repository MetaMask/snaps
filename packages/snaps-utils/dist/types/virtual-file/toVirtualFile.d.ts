/// <reference types="node" />
/// <reference types="node" />
import { promises as fsPromises } from 'fs';
import { VirtualFile } from './VirtualFile';
/**
 * Reads a file from filesystem and creates a vfile.
 *
 * @param path - Filesystem path to load the contents from.
 * @param encoding - Optional encoding to pass down to fs.readFile.
 * @returns Promise returning VFile with loaded file contents.
 */
export declare function readVirtualFile(path: string, encoding?: BufferEncoding | null): Promise<VirtualFile<unknown>>;
declare type WriteVFileOptions = Exclude<Parameters<(typeof fsPromises)['writeFile']>[2], undefined>;
/**
 * Writes vfile to filesystem.
 *
 * @param vfile - The vfile to write.
 * @param options - Options to pass down to fs.writeFile.
 */
export declare function writeVirtualFile(vfile: VirtualFile, options?: WriteVFileOptions): Promise<void>;
export {};
