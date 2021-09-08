import { promises as fs } from 'fs';
import pathUtils from 'path';
import rimraf from 'rimraf';
import { isFile, isDirectory } from './fs';

/**
 * All test files will be created in this temporary directory, which is removed during cleanup.
 */
const BASE_PATH = pathUtils.join(__dirname, 'fs-sandbox');

function getPath(path?: string) {
  return path ? pathUtils.join(BASE_PATH, path) : BASE_PATH;
}

async function createFile(fileName: string, data = 'foo') {
  await fs.writeFile(getPath(fileName), data);
}

async function createDir(dirName?: string) {
  await fs.mkdir(getPath(dirName));
}

const isFileRegEx = /\w+\.\w+$/u;

/**
 * Given any number of path strings, sequentially creates the given files and/or directories.
 * - File paths with a file name including its file extension, e.g. foo.txt
 * - Parent directories must be specified before their contents, or an error will be thrown
 */
async function createTestFiles(...paths: string[]) {
  await createDir();
  for (const path of paths) {
    if (isFileRegEx.test(path)) {
      await createFile(path);
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

describe('file system checks', () => {
  beforeEach(async () => {
    await createTestFiles('file.txt', 'empty-dir', 'dir', 'dir/file.txt');
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

      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('foo');
      });
      jest.spyOn(console, 'error').mockImplementation();

      await expect(isDirectory('wrong/path/', true)).rejects.toThrow(
        new Error('foo'),
      );

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
});
