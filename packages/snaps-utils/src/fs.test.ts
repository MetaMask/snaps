import { promises as fs } from 'fs';
import * as path from 'path';
import { join } from 'path';

import {
  getOutfilePath,
  isDirectory,
  isFile,
  readJsonFile,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from './fs';
import { SnapManifest } from './manifest/validation';
import { DEFAULT_SNAP_BUNDLE, getSnapManifest } from './test-utils';
import { NpmSnapFileNames } from './types';

jest.mock('fs');

const BASE_PATH = '/snap';
const MANIFEST_PATH = join(BASE_PATH, NpmSnapFileNames.Manifest);

/**
 * Clears out all the files in the in-memory file system, and writes the default
 * files to the `BASE_PATH` folder, including sub-folders.
 */
async function resetFileSystem() {
  await fs.rm(BASE_PATH, { recursive: true, force: true });

  // Create `dist` folder.
  await fs.mkdir(join(BASE_PATH, 'dist'), { recursive: true });

  // Write default files.
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(getSnapManifest()));
  await fs.writeFile(join(BASE_PATH, 'dist/bundle.js'), DEFAULT_SNAP_BUNDLE);
}

describe('isDirectory', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('returns true if a path is a directory', async () => {
    expect(await isDirectory(join(BASE_PATH, 'dist'), false)).toBe(true);
  });

  it('returns true if a path is not a directory and createDir is enabled', async () => {
    expect(await isDirectory(join(BASE_PATH, 'foo'), true)).toBe(true);
  });

  it('returns false if a path is not a directory and createDir is disabled', async () => {
    expect(await isDirectory(join(BASE_PATH, 'foo'), false)).toBe(false);
  });

  it('returns false if a path is a file', async () => {
    expect(await isDirectory(join(BASE_PATH, 'dist/bundle.js'), false)).toBe(
      false,
    );
  });

  it('returns false if an error occurs', async () => {
    jest.spyOn(fs, 'stat').mockImplementationOnce(() => {
      throw new Error('foo');
    });

    expect(await isDirectory(join(BASE_PATH, 'dist'), false)).toBe(false);
  });
});

describe('isFile', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('returns true if a path is a file', async () => {
    expect(await isFile(join(BASE_PATH, 'dist/bundle.js'))).toBe(true);
  });

  it('returns false if a path is a directory', async () => {
    expect(await isFile(join(BASE_PATH, 'dist'))).toBe(false);
  });

  it('returns false if an error occurs', async () => {
    jest.spyOn(fs, 'stat').mockImplementationOnce(() => {
      throw new Error('foo');
    });

    expect(await isFile(join(BASE_PATH, 'dist/bundle.js'))).toBe(false);
  });
});

describe('readJsonFile', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('reads and parses a json file', async () => {
    const file = await readJsonFile<SnapManifest>(MANIFEST_PATH);
    expect(file.path).toBe(MANIFEST_PATH);
    expect(file.result).toStrictEqual(getSnapManifest());
  });

  it('throws if the file name does not end with .json', async () => {
    await expect(readJsonFile('foo')).rejects.toThrow(
      'The specified file must be a ".json" file.',
    );
  });

  it('throws if the file doesnt exist', async () => {
    await expect(readJsonFile('foo.json')).rejects.toThrow(
      "Could not find 'foo.json'. Please ensure that the file exists.",
    );
  });

  it('throws if an error occurs', async () => {
    jest.spyOn(fs, 'readFile').mockImplementationOnce(() => {
      throw new Error('foo');
    });

    await expect(readJsonFile(MANIFEST_PATH)).rejects.toThrow('foo');
  });
});

describe('getOutfilePath', () => {
  it('gets the complete out file path', () => {
    const path1 = path.normalize('src/outDir');
    const path2 = path.normalize('../src/outDir/');
    const path3 = path.normalize('../src/lol/outDir/');
    const path4 = path.normalize('src/outDir');
    const path5 = path.normalize('src/outDir/');
    const path6 = path.normalize('src/bundle.js');

    expect(getOutfilePath('./src', 'outDir')).toStrictEqual(path1);
    expect(getOutfilePath('../src', '///outDir////')).toStrictEqual(path2);
    expect(getOutfilePath('../src', '/lol//outDir////')).toStrictEqual(path3);
    expect(getOutfilePath('src', 'outDir')).toStrictEqual(path4);
    expect(getOutfilePath('src/', './outDir/')).toStrictEqual(path5);
    expect(getOutfilePath('src/', '')).toStrictEqual(path6);
    expect(getOutfilePath('', '')).toBe('bundle.js');
  });
});

describe('validateOutfileName', () => {
  it('ensures outfile name is just a js file name', () => {
    expect(() => {
      validateOutfileName('file.ts');
    }).toThrow('Invalid outfile name: file.ts');

    expect(() => {
      validateOutfileName('/');
    }).toThrow('Invalid outfile name: /');

    expect(() => {
      validateOutfileName('');
    }).toThrow('Invalid outfile name: ');

    expect(() => {
      validateOutfileName('./src/file');
    }).toThrow('Invalid outfile name: ./src/file');

    expect(() => {
      validateOutfileName('.js');
    }).toThrow('Invalid outfile name: .js');

    expect(validateOutfileName('file.js')).toBe(true);
    expect(validateOutfileName('two.file.js')).toBe(true);
  });
});

describe('validateFilePath', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('checks whether the given path string resolves to an existing file', async () => {
    // jest.spyOn(snapUtils, 'isFile').mockResolvedValue(true);
    const result = await validateFilePath(MANIFEST_PATH);
    expect(result).toBe(true);
  });

  it('checks whether an invalid path string throws an error', async () => {
    // jest.spyOn(snapUtils, 'isFile').mockResolvedValue(false);
    await expect(validateFilePath('/foo/bar.js')).rejects.toThrow(
      "Invalid params: '/foo/bar.js' is not a file or does not exist.",
    );
  });
});

describe('validateDirPath', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('checks whether the given path string resolves to an existing directory', async () => {
    expect(await validateDirPath(BASE_PATH, false)).toBe(true);
  });

  it('creates the directory if it does not exist and createDir is true', async () => {
    expect(await validateDirPath(join(BASE_PATH, 'foo'), true)).toBe(true);
  });

  it('throws if the directory does not exist', async () => {
    await expect(
      validateDirPath(join(BASE_PATH, 'bar'), false),
    ).rejects.toThrow(
      "Invalid params: '/snap/bar' is not a directory or could not be created.",
    );
  });
});
