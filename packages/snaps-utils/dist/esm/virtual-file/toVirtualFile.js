import { promises as fsPromises } from 'fs';
import { VirtualFile } from './VirtualFile';
/**
 * Reads a file from filesystem and creates a vfile.
 *
 * @param path - Filesystem path to load the contents from.
 * @param encoding - Optional encoding to pass down to fs.readFile.
 * @returns Promise returning VFile with loaded file contents.
 */ export async function readVirtualFile(path, encoding = null) {
    return new VirtualFile({
        path,
        value: await fsPromises.readFile(path, {
            encoding
        })
    });
}
/**
 * Writes vfile to filesystem.
 *
 * @param vfile - The vfile to write.
 * @param options - Options to pass down to fs.writeFile.
 */ export async function writeVirtualFile(vfile, options) {
    return fsPromises.writeFile(vfile.path, vfile.value, options);
}

//# sourceMappingURL=toVirtualFile.js.map