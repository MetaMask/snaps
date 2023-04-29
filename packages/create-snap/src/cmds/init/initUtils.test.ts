import childProcess from 'child_process';
import { promises as fs } from 'fs';
import pathUtils from 'path';

import { resetFileSystem } from '../../test-utils';
import {
  buildSnap,
  cloneTemplate,
  gitInit,
  isGitInstalled,
  isInGitRepository,
  prepareWorkingDirectory,
  yarnInstall,
  TEMPLATE_GIT_URL,
} from './initUtils';

jest.mock('fs');

jest.mock('process', () => ({
  ...jest.requireActual('process'),
  cwd: jest.fn(),
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('initUtils', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  describe('prepareWorkingDirectory', () => {
    it('creates a new directory if needed', async () => {
      // eslint-disable-next-line jest/no-restricted-matchers
      await expect(prepareWorkingDirectory('foo')).resolves.toBeUndefined();
    });

    it("does not create a directory if it's using the current working directory", async () => {
      await prepareWorkingDirectory(process.cwd());

      expect(await fs.readdir(process.cwd())).toStrictEqual([]);
    });

    it('throws an error if it fails to create a new directory', async () => {
      jest.spyOn(fs, 'mkdir').mockImplementation(() => {
        throw new Error('error message');
      });

      await expect(prepareWorkingDirectory('bar')).rejects.toThrow(
        'Init Error: Failed to prepare working directory with message: Init Error: Failed to create new directory.',
      );
    });

    it('throws if the folder is not empty', async () => {
      const folderPath = 'bar';
      const filePath = pathUtils.join(folderPath, 'foo.txt');

      await fs.mkdir(folderPath);
      await fs.appendFile(filePath, 'test');

      await expect(prepareWorkingDirectory('bar')).rejects.toThrow(
        'Init Error: Failed to prepare working directory with message: Directory bar not empty.',
      );
    });
  });

  describe('buildSnap', () => {
    it('calls execSync', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation();

      buildSnap('foo');

      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith('yarn build', {
        stdio: [0, 1, 2],
        cwd: pathUtils.resolve(__dirname, 'foo'),
      });
    });

    it('throws an error when execution fails', () => {
      jest.spyOn(childProcess, 'execSync').mockImplementation(() => {
        throw new Error('failed');
      });

      expect(() => buildSnap('foo')).toThrow(
        'Init Error: Failed to build snap.',
      );
    });
  });

  describe('cloneTemplate', () => {
    it('passes if the command is ran successfully', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      cloneTemplate('foo');

      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith(
        `git clone --depth=1 ${TEMPLATE_GIT_URL} foo`,
        {
          stdio: [2],
        },
      );
    });

    it('throws if the command fails', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      expect(() => cloneTemplate('foo')).toThrow(
        'Init Error: Failed to clone the template.',
      );
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('isGitInstalled', () => {
    it('returns true if git is installed', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      const result = isGitInstalled();

      expect(result).toBe(true);
      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith('git --version', {
        stdio: 'ignore',
      });
    });

    it('returns false if git is not installed', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      const result = isGitInstalled();

      expect(result).toBe(false);
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('isInGitRepository', () => {
    it('returns true if the directory is a git repository', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      const result = isInGitRepository('foo');

      expect(result).toBe(true);
      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith(
        'git rev-parse --is-inside-work-tree',
        {
          stdio: 'ignore',
          cwd: pathUtils.resolve(__dirname, 'foo'),
        },
      );
    });

    it('returns false if the directory is not a git repository', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      const result = isInGitRepository('foo');

      expect(result).toBe(false);
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('gitInit', () => {
    it('init a new repository', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      gitInit('foo');

      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith('git init', {
        stdio: 'ignore',
        cwd: pathUtils.resolve(__dirname, 'foo'),
      });
    });

    it('throws an error if it fails to init a new repository', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      expect(() => gitInit('foo')).toThrow(
        'Init Error: Failed to init a new git repository.',
      );
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('yarnInstall', () => {
    it('run yarn and yarn install commands', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      yarnInstall('foo');

      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith('yarn install', {
        stdio: [0, 1, 2],
        cwd: 'foo',
      });
    });

    it('throws an error if it fails to run a command', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      expect(() => yarnInstall('foo')).toThrow(
        'Init Error: Failed to install dependencies.',
      );
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });
});
