import { promises as fs } from 'fs';
import pathUtils from 'path';
import * as snapUtils from '@metamask/snap-utils';
import {
  getPackageJson,
  getSnapManifest,
} from '@metamask/snap-utils/test-utils';
import { initHandler } from './initHandler';
import * as initUtils from './initUtils';

jest.mock('@metamask/snap-utils');

const getMockArgv = () => {
  return {
    directory: 'foo',
  } as any;
};

describe('initialize', () => {
  describe('initHandler', () => {
    afterEach(() => {
      global.snaps = {};
    });

    it('successfully initializes a Snap project', async () => {
      const satisfiesVersionRangeMock = jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);
      const isGitInstalledMock = jest
        .spyOn(initUtils, 'isGitInstalled')
        .mockImplementation(() => true);
      const prepareWorkingDirectoryMock = jest
        .spyOn(initUtils, 'prepareWorkingDirectory')
        .mockImplementation();
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
      const cloneTemplateMock = jest
        .spyOn(initUtils, 'cloneTemplate')
        .mockImplementation();
      const rmMock = jest.spyOn(fs, 'rm').mockImplementation();
      const yarnInstallMock = jest
        .spyOn(initUtils, 'yarnInstall')
        .mockImplementation();
      const isInGitRepositoryMock = jest
        .spyOn(initUtils, 'isInGitRepository')
        .mockImplementation(() => false);

      const gitInitMock = jest.spyOn(initUtils, 'gitInit').mockImplementation();

      const readJsonFileMock = jest
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

      expect(satisfiesVersionRangeMock).toHaveBeenCalledTimes(1);
      expect(isGitInstalledMock).toHaveBeenCalledTimes(1);
      expect(prepareWorkingDirectoryMock).toHaveBeenCalledTimes(1);
      expect(consoleLogMock).toHaveBeenCalledTimes(4);
      expect(cloneTemplateMock).toHaveBeenCalledTimes(1);
      expect(rmMock).toHaveBeenCalledTimes(1);
      expect(yarnInstallMock).toHaveBeenCalledTimes(1);
      expect(isInGitRepositoryMock).toHaveBeenCalledTimes(1);
      expect(gitInitMock).toHaveBeenCalledTimes(1);
      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
    });

    it("doesn't init if it's already in a git repo", async () => {
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);
      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);
      jest.spyOn(initUtils, 'prepareWorkingDirectory').mockImplementation();
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
        'outdated node version',
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
        'git is not installed',
      );

      expect(isGitInstalledMock).toHaveBeenCalledTimes(1);
    });

    it('fails if it can\t clone template and clean files', async () => {
      jest
        .spyOn(snapUtils, 'satisfiesVersionRange')
        .mockImplementation(() => true);

      jest.spyOn(initUtils, 'isGitInstalled').mockImplementation(() => true);

      jest.spyOn(initUtils, 'prepareWorkingDirectory').mockImplementation();
      const cloneTemplateMock = jest
        .spyOn(initUtils, 'cloneTemplate')
        .mockImplementation(() => {
          throw new Error('error message');
        });
      const rmMock = jest.spyOn(fs, 'rm').mockImplementation();

      await expect(initHandler({ ...getMockArgv() })).rejects.toThrow(
        'error message',
      );

      expect(cloneTemplateMock).toHaveBeenCalledTimes(1);
      expect(rmMock).toHaveBeenCalledTimes(1);
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
