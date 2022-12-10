/**
 * Clears out all the files in the in-memory file system, and writes the default
 * folders to mimic the on-disk current working directory, including sub-folders.
 */
export declare function resetFileSystem(): Promise<void>;
