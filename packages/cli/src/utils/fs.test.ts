import { promises as fs } from 'fs';
import pathUtils from 'path';
import rimraf from 'rimraf';
import { isDirectory, isFile, readJsonFile } from './fs';

/**
 * All test files will be created in this temporary directory, which is removed during cleanup.
 */
const BASE_PATH = pathUtils.join(__dirname, '__TEST__fs-sandbox');

/**
 * Get a path relative to the base path directory.
 *
 * @param path - The path to get relative to the base path. If no path is
 * provided, the base path will be returned.
 * @returns The provided path relative to the base path.
 */
function getPath(path?: string) {
  return path ? pathUtils.join(BASE_PATH, path) : BASE_PATH;
}

/**
 * Create a file with the given file name and path.
 *
 * @param fileName - The name of the file to create, relative to the base path.
 * @param data - The data to write to the file.
 */
async function createFile(fileName: string, data: string) {
  await fs.writeFile(getPath(fileName), data);
}

/**
 * Create a directory with the given path.
 *
 * @param dirName - The name of the directory to create, relative to the base
 * path.
 */
async function createDir(dirName?: string) {
  await fs.mkdir(getPath(dirName));
}

const isFileRegEx = /\w+\.\w+$/u;

/**
 * Given any number of path strings, sequentially creates the given files and/or
 * directories.
 *
 * - File paths with a file name including its file extension, e.g., `foo.txt`.
 * - Parent directories must be specified before their contents, or an error
 * will be thrown.
 *
 * @param paths - The paths to create.
 */
async function createTestFiles(...paths: (string | [string, string])[]) {
  await createDir();
  for (let path of paths) {
    let data = 'foo';
    if (typeof path !== 'string') {
      [path, data] = path;
    }

    if (isFileRegEx.test(path)) {
      await createFile(path, data);
    } else {
      await createDir(path);
    }
  }
}

/**
 * Removes the test file directory.
 */
function cleanupTestFiles() {
  rimraf.sync(getPath());
}

describe('file system utilities', () => {
  beforeEach(async () => {
    await createTestFiles('file.txt', 'empty-dir', 'dir', 'dir/file.txt', [
      'foo.json',
      '{ "foo": 1 }\n',
    ]);
  });

  afterEach(() => {
    cleanupTestFiles();
  });

  describe('isFile', () => {
    it('checks whether the given path string resolves to an existing file', async () => {
      let result = await isFile(getPath('file.txt'));
      expect(result).toStrictEqual(true);

      result = await isFile(getPath('dir/file.txt'));
      expect(result).toStrictEqual(true);

      result = await isFile(getPath('dir'));
      expect(result).toStrictEqual(false);

      result = await isFile(getPath('empty-dir'));
      expect(result).toStrictEqual(false);

      result = await isFile(getPath('wrong/path'));
      expect(result).toStrictEqual(false);
    });
  });

  describe('isDirectory', () => {
    afterEach(() => {
      global.snaps = {};
    });

    it('checks whether the given path string is an existing directory', async () => {
      let result = await isDirectory(getPath('file.txt'), false);
      expect(result).toStrictEqual(false);

      result = await isDirectory(getPath('dir'), false);
      expect(result).toStrictEqual(true);
    });

    it('logs error and exits if path does not resolve to directory and one is unable to be created', async () => {
      global.snaps = {
        verboseErrors: false,
        suppressWarnings: false,
        isWatching: false,
      };

      jest.spyOn(console, 'error').mockImplementation();

      await expect(isDirectory('wrong/path/', true)).rejects.toThrow('');

      expect(global.console.error).toHaveBeenCalledWith(
        "Directory 'wrong/path/' could not be created.",
      );

      global.snaps = {};
    });

    it('directory does not exist and user does not want to create a directory', async () => {
      const result = await isDirectory('wrong/path/', false);
      expect(result).toStrictEqual(false);
    });

    it('makes a directory when given a valid directory path that does not exist', async () => {
      jest.spyOn(fs, 'mkdir').mockImplementationOnce((async (path: string) => {
        await createDir(path);
      }) as any);

      const result = await isDirectory('new-dir', true);
      expect(result).toStrictEqual(true);
    });

    it('given error.code !== ENOENT, return false', async () => {
      jest.spyOn(fs, 'stat').mockImplementationOnce(async () => {
        throw new Error('BAD');
      });

      const result = await isDirectory('new-dir', true);
      expect(result).toStrictEqual(false);
    });
  });

  describe('readJsonFile', () => {
    it('reads a .json file', async () => {
      expect(await readJsonFile(getPath('foo.json'))).toStrictEqual({ foo: 1 });
    });

    it('throws if the file does not end with ".json"', async () => {
      await expect(readJsonFile(getPath('file.txt'))).rejects.toThrow(
        new Error('The specified file must be a ".json" file.'),
      );
    });
  });
});
