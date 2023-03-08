import * as snapUtils from '@metamask/snaps-utils';
import { getPackageJson, getSnapFiles } from '@metamask/snaps-utils/test-utils';
import * as utils from '@metamask/utils';
import { promises as fs } from 'fs';
import pathUtils from 'path';

import { resetFileSystem } from '../../test-utils';
import { YargsArgs } from '../../types/yargs';
import { initHandler } from './initHandler';
import * as initUtils from './initUtils';

jest.mock('fs');

jest.mock('@metamask/utils', () => ({
  ...jest.requireActual('@metamask/utils'),
  satisfiesVersionRange: jest.fn(),
}));

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  readJsonFile: jest.fn(),
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

const getMockArgv = () => {
  return {
    directory: 'foo',
  } as any;
};

describe('initialize', () => {
  describe('initHandler', () => {
    beforeEach(async () => {
      await resetFileSystem();
    });

    afterEach(() => {
      global.snaps = {};
    });

    it('successfully initializes a Snap project in the current working directory', async () => {
      jest.spyOn(utils, 'satisfiesVersionRange').mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);
      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();

      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();

      jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => false);
      jest.spyOn(initUtils, 'gitInit').mockImplementation();

      const { manifest, packageJson } = getSnapFiles();

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(manifest));

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(packageJson));

      const expected = {
        dist: 'dist',
        outfileName: 'bundle.js',
        src: 'src/index.js',
        snapLocation: pathUtils.join(process.cwd(), initUtils.SNAP_LOCATION),
      };

      expect(await initHandler({} as YargsArgs)).toStrictEqual({
        ...expected,
      });
    });

    it('successfully initializes a Snap project in a given directory', async () => {
      jest.spyOn(utils, 'satisfiesVersionRange').mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();

      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();

      jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => false);

      jest.spyOn(initUtils, 'gitInit').mockImplementation();

      const { manifest, packageJson } = getSnapFiles();

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(manifest));

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(packageJson));

      const expected = {
        ...getMockArgv(),
        dist: 'dist',
        outfileName: 'bundle.js',
        src: 'src/index.js',
        snapLocation: pathUtils.join(
          process.cwd(),
          `foo/${initUtils.SNAP_LOCATION}`,
        ),
      };

      expect(await initHandler({ ...getMockArgv() })).toStrictEqual({
        ...expected,
      });
    });

    it("defaults to 'src/index.js' if there is no main entry in package.json", async () => {
      jest.spyOn(utils, 'satisfiesVersionRange').mockImplementation(() => true);
      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();
      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();
      jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => false);
      jest.spyOn(initUtils, 'gitInit').mockImplementation();

      const { manifest, packageJson } = getSnapFiles({
        packageJson: { ...getPackageJson(), main: undefined },
      });

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(manifest));

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(packageJson));

      const expected = {
        ...getMockArgv(),
        dist: 'dist',
        outfileName: 'bundle.js',
        src: 'src/index.js',
        snapLocation: pathUtils.join(
          process.cwd(),
          `foo/${initUtils.SNAP_LOCATION}`,
        ),
      };

      expect(await initHandler({ ...getMockArgv() })).toStrictEqual({
        ...expected,
      });
    });

    it("doesn't init if it's already in a git repo", async () => {
      jest.spyOn(utils, 'satisfiesVersionRange').mockImplementation(() => true);
      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();
      jest.spyOn(fs, 'rm').mockImplementation();
      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();

      const { manifest, packageJson } = getSnapFiles();

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(manifest));

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => Promise.resolve(packageJson));

      const isInGitRepositoryMock = jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => true);

      const gitInitMock = jest.spyOn(initUtils, 'gitInit');

      const expected = {
        ...getMockArgv(),
        dist: 'dist',
        outfileName: 'bundle.js',
        src: 'src/index.js',
        snapLocation: pathUtils.join(
          process.cwd(),
          `foo/${initUtils.SNAP_LOCATION}`,
        ),
      };

      expect(await initHandler({ ...getMockArgv() })).toStrictEqual({
        ...expected,
      });

      expect(isInGitRepositoryMock).toHaveBeenCalledTimes(1);
      expect(gitInitMock).not.toHaveBeenCalled();
    });

    it('fails if the node version is not supported', async () => {
      global.process = {
        ...global.process,
        version: 'v15.1.1',
      };

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        `Init Error: You are using an outdated version of Node (${process.version}). Please update to Node >=16.`,
      );
    });

    it('fails if git is not installed', async () => {
      jest.spyOn(utils, 'satisfiesVersionRange').mockImplementation(() => true);

      const isGitInstalledMock = jest
        .spyOn(initUtils, 'isGitInstalled')
        .mockImplementation(() => false);

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        'Init Error: git is not installed. Please install git to continue.',
      );

      expect(isGitInstalledMock).toHaveBeenCalledTimes(1);
    });

    it('fails if it can\t clone template and clean files', async () => {
      jest.spyOn(utils, 'satisfiesVersionRange').mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      const cloneTemplateMock = jest
        .spyOn(initUtils, 'cloneTemplate')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        'Init Error: Failed to create template.',
      );

      expect(cloneTemplateMock).toHaveBeenCalledTimes(1);
    });

    it('fails if an error is thrown', async () => {
      jest.spyOn(utils, 'satisfiesVersionRange').mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest
        .spyOn(initUtils, 'prepareWorkingDirectory')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        'error message',
      );
    });
  });
});
