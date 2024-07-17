import type { Json } from '@metamask/utils';
import type { VirtualFile } from './virtual-file';
/**
 * Checks whether the given path string resolves to an existing directory, and
 * optionally creates the directory if it doesn't exist.
 *
 * @param pathString - The path string to check.
 * @param createDir - Whether to create the directory if it doesn't exist.
 * @returns Whether the given path is an existing directory.
 */
export declare function isDirectory(pathString: string, createDir: boolean): Promise<boolean>;
/**
 * Checks whether the given path string resolves to an existing file.
 *
 * @param pathString - The path string to check.
 * @returns Whether the given path is an existing file.
 */
export declare function isFile(pathString: string): Promise<boolean>;
/**
 * Reads a `.json` file, parses its contents, and returns them.
 *
 * @param pathString - The path to the JSON file.
 * @returns The parsed contents of the JSON file.
 */
export declare function readJsonFile<Type extends Json = Json>(pathString: string): Promise<VirtualFile<Type>>;
/**
 * Gets the complete out file path from an output file name and parent
 * directory path.
 *
 * @param outDir - The path to the out file's parent directory.
 * @param outFileName - The out file's name.
 * @returns The complete path to the out file.
 */
export declare function getOutfilePath(outDir: string, outFileName: string): string;
/**
 * Ensures that the outfile name is just a `.js` file name.
 * Throws on validation failure.
 *
 * @param filename - The file name to validate.
 * @returns `true` if validation succeeded.
 * @throws If the file name is invalid.
 */
export declare function validateOutfileName(filename: string): boolean;
/**
 * Validates a file path. Throws on validation failure.
 *
 * @param filePath - The file path to validate.
 * @returns `true` if validation succeeded.
 * @throws If the path does not resolve to a file.
 */
export declare function validateFilePath(filePath: string): Promise<boolean>;
/**
 * Validates a directory path. Throws on validation failure.
 *
 * @param dirPath - The directory path to validate.
 * @param createDir - Whether to create the directory if it doesn't exist.
 * @returns `true` if validation succeeded or the directory was created.
 * @throws If the directory does not exist or could not be created.
 */
export declare function validateDirPath(dirPath: string, createDir: boolean): Promise<boolean>;
/**
 * Creates a temporary file with a given name and content, writes it to disk and calls the provided function.
 * This function handles deletion of the temporary file after usage.
 *
 * @param fileName - The name of the temporary file.
 * @param fileContents - The content of the temporary file.
 * @param fn - The callback function to call when the temporary file has been created.
 */
export declare function useTemporaryFile(fileName: string, fileContents: string, fn: (path: string) => Promise<unknown>): Promise<void>;
