import { promises as fs } from 'fs';
import pathUtils from 'path';
import * as snapUtils from '@metamask/snaps-utils';
import {
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import { YargsArgs } from '../../types/yargs';
import { resetFileSystem } from '../../test-utils';
import { initHandler } from './initHandler';
import * as initUtils from './initUtils';

jest.mock('fs');

jest.mock('@metamask/snaps-utils');

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
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);
      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();

      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();

      jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => false);
      jest.spyOn(initUtils, 'gitInit').mockImplementation();

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getSnapManifest());

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getPackageJson());

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
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();

      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();

      jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => false);

      jest.spyOn(initUtils, 'gitInit').mockImplementation();

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getSnapManifest());

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getPackageJson());

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
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);
      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();
      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();
      jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => false);
      jest.spyOn(initUtils, 'gitInit').mockImplementation();
      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getSnapManifest());

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => ({ main: undefined }));

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
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);
      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest.spyOn(initUtils, 'cloneTemplate').mockImplementation();
      jest.spyOn(fs, 'rm').mockImplementation();
      jest.spyOn(initUtils, 'yarnInstall').mockImplementation();
      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getSnapManifest());

      jest
        .spyOn(snapUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getPackageJson());

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
      const satisfiesVersionRangeMock = jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => false);

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        'Outdated node version.',
      );

      expect(satisfiesVersionRangeMock).toHaveBeenCalledTimes(1);
    });

    it('fails if git is not installed', async () => {
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);

      const isGitInstalledMock = jest
        .spyOn(initUtils, 'isGitInstalled')
        .mockImplementation(() => false);

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        'Git is not installed.',
      );

      expect(isGitInstalledMock).toHaveBeenCalledTimes(1);
    });

    it('fails if it can\t clone template and clean files', async () => {
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      const cloneTemplateMock = jest
        .spyOn(initUtils, 'cloneTemplate')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        'error message',
      );

      expect(cloneTemplateMock).toHaveBeenCalledTimes(1);
    });

    it('fails if an error is thrown', async () => {
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);

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
