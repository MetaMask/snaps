import { promises as fs } from 'fs';
import { join } from 'path';
import { readSnapJsonFile, isDirectory, isFile, readJsonFile } from './fs';
import { NpmSnapFileNames } from './types';
import { DEFAULT_SNAP_BUNDLE, getSnapManifest } from './__test__';
import { SnapManifest } from './json-schemas';

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
    expect(await readJsonFile<SnapManifest>(MANIFEST_PATH)).toStrictEqual(
      getSnapManifest(),
    );
  });

  it('throws if the file name does not end with .json', async () => {
    await expect(readJsonFile('foo')).rejects.toThrow(
      'The specified file must be a ".json" file.',
    );
  });

  it('throws if an error occurs', async () => {
    jest.spyOn(fs, 'readFile').mockImplementationOnce(() => {
      throw new Error('foo');
    });

    await expect(readJsonFile(MANIFEST_PATH)).rejects.toThrow('foo');
  });
});

describe('readSnapJsonFile', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('returns the contents of the file', async () => {
    const json = {
      foo: 'bar',
    };

    await fs.writeFile(
      join(BASE_PATH, NpmSnapFileNames.Manifest),
      JSON.stringify(json),
    );

    expect(
      await readSnapJsonFile(BASE_PATH, NpmSnapFileNames.Manifest),
    ).toStrictEqual(json);
  });

  it('throws an error if the file does not exist', async () => {
    await fs.unlink(MANIFEST_PATH);

    await expect(
      readSnapJsonFile(BASE_PATH, NpmSnapFileNames.Manifest),
    ).rejects.toThrow(
      "Could not find '/snap/snap.manifest.json'. Please ensure that the file exists.",
    );

    await expect(
      readSnapJsonFile(BASE_PATH, NpmSnapFileNames.PackageJson),
    ).rejects.toThrow(
      "Could not find '/snap/package.json'. Please ensure that the file exists.",
    );
  });

  it('forwards fs errors', async () => {
    jest.spyOn(fs, 'readFile').mockImplementation(() => {
      throw new Error('foo');
    });

    await expect(
      readSnapJsonFile(BASE_PATH, NpmSnapFileNames.Manifest),
    ).rejects.toThrow('foo');
  });
});
