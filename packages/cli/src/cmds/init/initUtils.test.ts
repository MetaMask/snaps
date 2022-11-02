import fs, { Dirent } from 'fs';
import childProcess from 'child_process';
import pathUtils from 'path';

import {
  cloneTemplate,
  gitInit,
  isGitInstalled,
  isInGitRepository,
  prepareWorkingDirectory,
  yarnInstall,
  TEMPLATE_GIT_URL,
} from './initUtils';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    ...jest.requireActual('fs').promises,
    mkdir: jest.fn(),
    readdir: jest.fn(),
  },
}));

jest.mock('process', () => ({
  ...jest.requireActual('process'),
  cwd: jest.fn(),
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('initUtils', () => {
  describe('prepareWorkingDirectory', () => {
    it('creates a new directory if needed', async () => {
      const cwdMock = jest
        .spyOn(process, 'cwd')
        .mockImplementation(() => 'bar');

      const mkdirMock = jest.spyOn(fs.promises, 'mkdir');

      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(async () => []);

      await prepareWorkingDirectory('foo');

      expect(cwdMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
    });

    it("does not create a directory if it's using the current working directory", async () => {
      const cwdMock = jest
        .spyOn(process, 'cwd')
        .mockImplementation(() => 'bar');

      const mkdirMock = jest.spyOn(fs.promises, 'mkdir');

      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(async () => []);

      await prepareWorkingDirectory('bar');

      expect(cwdMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(mkdirMock).not.toHaveBeenCalled();
    });

    it('throws an error if it fails to create a new directory', async () => {
      const cwdMock = jest
        .spyOn(process, 'cwd')
        .mockImplementation(() => 'foo');

      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(async () => []);

      const mkdirMock = jest
        .spyOn(fs.promises, 'mkdir')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(prepareWorkingDirectory('bar')).rejects.toThrow(
        'error message',
      );

      expect(cwdMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(0);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
    });

    it('throws if the folder is not empty', async () => {
      const cwdMock = jest
        .spyOn(process, 'cwd')
        .mockImplementation(() => 'bar');

      const mkdirMock = jest.spyOn(fs.promises, 'mkdir');

      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(async () => ['something'] as unknown as Dirent[]);

      await expect(prepareWorkingDirectory('bar')).rejects.toThrow(
        'Directory not empty: bar',
      );

      expect(cwdMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(mkdirMock).not.toHaveBeenCalled();
    });
  });

  describe('cloneTemplate', () => {
    it('passes if the command is ran successfully', async () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      await cloneTemplate('foo');

      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith(
        `git clone --depth=1 ${TEMPLATE_GIT_URL} foo`,
        {
          stdio: [2],
        },
      );
    });

    it('throws if the command fails', async () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(cloneTemplate('foo')).rejects.toThrow('error message');
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('isGitInstalled', () => {
    it('returns true if git is installed', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      const result = isGitInstalled();

      expect(result).toStrictEqual(true);
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

      expect(result).toStrictEqual(false);
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('isInGitRepository', () => {
    it('returns true if the directory is a git repository', () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      const result = isInGitRepository('foo');

      expect(result).toStrictEqual(true);
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

      expect(result).toStrictEqual(false);
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('gitInit', () => {
    it('init a new repository', async () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      await gitInit('foo');

      expect(execSyncMock).toHaveBeenCalledTimes(1);
      expect(execSyncMock).toHaveBeenCalledWith('git init', {
        stdio: 'ignore',
        cwd: pathUtils.resolve(__dirname, 'foo'),
      });
    });

    it('throws an error if it fails to init a new repository', async () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(gitInit('foo')).rejects.toThrow('error message');
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('yarnInstall', () => {
    it('run yarn and yarn install commands', async () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => Buffer.from([]));

      await yarnInstall('foo');

      expect(execSyncMock).toHaveBeenCalledTimes(2);
      expect(execSyncMock).toHaveBeenNthCalledWith(1, 'yarn', {
        stdio: [0, 1, 2],
        cwd: pathUtils.resolve(__dirname, 'foo'),
      });

      expect(execSyncMock).toHaveBeenNthCalledWith(2, 'yarn install', {
        stdio: [0, 1, 2],
        cwd: pathUtils.resolve(__dirname, 'foo'),
      });
    });

    it('throws an error if it fails to run a command', async () => {
      const execSyncMock = jest
        .spyOn(childProcess, 'execSync')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(yarnInstall('foo')).rejects.toThrow('error message');
      expect(execSyncMock).toHaveBeenCalledTimes(1);
    });
  });
});
