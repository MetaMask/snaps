const { promises: fs } = require('fs');
const pathUtils = require('path');
const rimraf = require('rimraf');
const { isFile, isDirectory } = require('../../dist/src/utils/fs');

/**
 * All test files will be created in this temporary directory, which is removed during cleanup.
 */
const BASE_PATH = pathUtils.join(__dirname, 'fs-sandbox');

function getPath(path) {
  return path ? pathUtils.join(BASE_PATH, path) : BASE_PATH;
}

async function createFile(fileName, data = 'foo') {
  await fs.writeFile(getPath(fileName), data);
}

async function createDir(dirName) {
  await fs.mkdir(getPath(dirName));
}

const isFileRegEx = /\w+\.\w+$/u;

/**
 * Given any number of path strings, sequentially creates the given files and/or directories.
 * - File paths with a file name including its file extension, e.g. foo.txt
 * - Parent directories must be specified before their contents, or an error will be thrown
 */
async function createTestFiles(...paths) {
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
      jest.restoreAllMocks();
      delete global.snaps;
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
        throw new Error(1);
      });
      jest.spyOn(console, 'error').mockImplementation();

      await expect(isDirectory('wrong/path/', true)).rejects.toThrow(
        new Error(1),
      );
      expect(global.console.error).toHaveBeenCalledWith(
        "Directory 'wrong/path/' could not be created.",
      );

      delete global.snaps;
    });

    it('directory does not exist and user does not want to create a directory', async () => {
      const result = await isDirectory('wrong/path/', false);
      expect(result).toStrictEqual(false);
    });

    it('makes a directory when given a valid directory path that does not exist', async () => {
      jest.spyOn(fs, 'mkdir').mockImplementationOnce(async (path) => {
        await createDir(path);
      });

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
