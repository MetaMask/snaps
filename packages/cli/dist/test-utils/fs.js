"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFileSystem = void 0;
const fs_1 = require("fs");
jest.mock('fs');
/**
 * Clears out all the files in the in-memory file system, and writes the default
 * folders to mimic the on-disk current working directory, including sub-folders.
 */
async function resetFileSystem() {
    await fs_1.promises.rm(process.cwd(), { recursive: true, force: true });
    // Using relative path with memfs won't work since process.cwd() specifies the cwd of the on-disk file system
    // This recursively creates the current working directory in the memfs volume.
    // Ref. https://github.com/streamich/memfs/blob/master/docs/relative-paths.md
    await fs_1.promises.mkdir(process.cwd(), { recursive: true });
}
exports.resetFileSystem = resetFileSystem;
//# sourceMappingURL=fs.js.map