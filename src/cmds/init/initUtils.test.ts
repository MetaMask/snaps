import fs from 'fs';
import initPackageJson from 'init-package-json';
import * as readlineUtils from '../../utils/readline';
import * as miscUtils from '../../utils/misc';
import {
  asyncPackageInit,
  buildWeb3Wallet,
  validateEmptyDir,
} from './initUtils';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

jest.mock('init-package-json');

interface ErrorWithCode extends Error {
  code?: number | string;
}

describe('initUtils', () => {
  describe('asyncPackageInit', () => {
    it('console logs if successful', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementation(() => true);
      const readFileMock = jest
        .spyOn(fs.promises, 'readFile')
        .mockImplementationOnce(async () => '');
      const parseMock = jest.spyOn(JSON, 'parse').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();

      await asyncPackageInit();
      expect(existsSyncMock).toHaveBeenCalledTimes(1);
      expect(readFileMock).toHaveBeenCalledTimes(1);
      expect(parseMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(2);
    });

    it('throws error if unable to parse packagejson', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementation(() => true);
      const readFileMock = jest
        .spyOn(fs.promises, 'readFile')
        .mockImplementationOnce(async () => '');
      const parseMock = jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new Error('error message');
      });
      jest.spyOn(console, 'log').mockImplementation();
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      await expect(asyncPackageInit()).rejects.toThrow(
        new Error('process exited'),
      );
      expect(existsSyncMock).toHaveBeenCalled();
      expect(readFileMock).toHaveBeenCalledTimes(1);
      expect(parseMock).toHaveBeenCalledTimes(1);
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('yarn lock logic works throws error if initpackagejson is rejected', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);
      ((initPackageJson as unknown) as jest.Mock).mockImplementation(
        (_, __, ___, cb) => cb(new Error('initpackage error'), true),
      );

      await expect(asyncPackageInit()).rejects.toThrow('initpackage error');
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
    });

    it('yarn lock logic works', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);
      ((initPackageJson as unknown) as jest.Mock).mockImplementation(
        (_, __, ___, cb) => cb(false, true),
      );

      await asyncPackageInit();
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
    });

    it('logs error when yarn lock is found', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => true);
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const processExitMock = jest
        .spyOn(process, 'exit')
        .mockImplementationOnce(() => {
          throw new Error('process exited');
        });

      await expect(asyncPackageInit()).rejects.toThrow(
        new Error('process exited'),
      );
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(processExitMock).toHaveBeenCalledWith(1);
    });
  });

  describe('buildWeb3Wallet', () => {
    const getMockArgv = () => {
      return {
        dist: 'dist',
        outfileName: 'bundle.js',
        port: 8081,
      };
    };

    const NO = 'no';
    const VALID_PORT = 8000;
    const VALID_DIR = 'validDir';
    const VALID_PERMISSIONS_INPUT =
      'confirm customPrompt wallet_manageIdentities';

    it("applies default web3wallet values if user input is 'y'", async () => {
      const mkdirMock = (fs.promises.mkdir as jest.Mock).mockImplementation();
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'y');
      jest.spyOn(console, 'log').mockImplementation();

      await buildWeb3Wallet(getMockArgv() as any);
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('throws error if fails to make directory and apply default values', async () => {
      (fs.promises.mkdir as jest.Mock).mockImplementation(() => {
        const err: ErrorWithCode = new Error(
          'an error message that is not `file already exists`',
        );
        err.code = 'notEEXIST';
        throw err;
      });
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'y');
      jest.spyOn(console, 'log').mockImplementation();
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('error message');
      });

      await expect(buildWeb3Wallet(getMockArgv() as any)).rejects.toThrow(
        new Error('error message'),
      );
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
      expect(errorMock).toHaveBeenCalledTimes(2);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('handles valid user inputs when not using default values', async () => {
      const mockArgv = getMockArgv();
      const expectedMockWallet = [
        {
          bundle: {
            local: `${VALID_DIR}/${mockArgv.outfileName}`,
            url: `http://localhost:${VALID_PORT}/${VALID_DIR}/${mockArgv.outfileName}`,
          },
          initialPermissions: {
            confirm: {},
            customPrompt: {},
            wallet_manageIdentities: {},
          },
        },
        { dist: VALID_DIR, outfileName: 'bundle.js', port: VALID_PORT },
      ];

      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => String(VALID_PORT))
        .mockImplementationOnce(async () => VALID_DIR)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);
      const mkdirMock = jest.spyOn(fs.promises, 'mkdir').mockImplementation();

      expect(await buildWeb3Wallet(mockArgv as any)).toStrictEqual(
        expectedMockWallet,
      );
      expect(promptMock).toHaveBeenCalledTimes(4);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
    });

    it('handles valid user inputs and using default permissions', async () => {
      const mockArgv = getMockArgv();
      const expectedMockWallet = [
        {
          bundle: {
            local: `${VALID_DIR}/${mockArgv.outfileName}`,
            url: `http://localhost:${VALID_PORT}/${VALID_DIR}/${mockArgv.outfileName}`,
          },
          initialPermissions: {
            alert: {},
          },
        },
        { dist: VALID_DIR, outfileName: 'bundle.js', port: VALID_PORT },
      ];

      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => String(VALID_PORT))
        .mockImplementationOnce(async () => VALID_DIR)
        .mockImplementationOnce(async () => ''); // to accept default permissions
      const mkdirMock = jest.spyOn(fs.promises, 'mkdir').mockImplementation();

      expect(await buildWeb3Wallet(mockArgv as any)).toStrictEqual(
        expectedMockWallet,
      );
      expect(promptMock).toHaveBeenCalledTimes(4);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
    });

    it('treats already existing directory as a success', async () => {
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => String(VALID_PORT))
        .mockImplementationOnce(async () => VALID_DIR)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);
      const mkdirMock = (fs.promises.mkdir as jest.Mock).mockImplementation(
        () => {
          const err: ErrorWithCode = new Error('file already exists');
          err.code = 'EEXIST';
          throw err;
        },
      );
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();

      await buildWeb3Wallet(getMockArgv() as any);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(4);
      expect(errorMock).not.toHaveBeenCalled();
    });

    it('logs error and reprompts if user inputs invalid port', async () => {
      const invalidPort = '-1';
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => invalidPort)
        .mockImplementationOnce(async () => String(VALID_PORT))
        .mockImplementationOnce(async () => VALID_DIR)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();

      await buildWeb3Wallet(getMockArgv() as any);
      expect(promptMock).toHaveBeenCalledTimes(5);
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(errorMock).toHaveBeenLastCalledWith(
        expect.stringContaining(invalidPort),
      );
    });

    it('logs error and reprompts if user inputs directory that could not be made', async () => {
      const invalidDist = 'invalidDir';
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => String(VALID_PORT))
        .mockImplementationOnce(async () => invalidDist)
        .mockImplementationOnce(async () => VALID_DIR)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);

      const mockErrorCode = 'notEEXIST';
      (fs.promises.mkdir as jest.Mock)
        .mockResolvedValue(undefined)
        .mockImplementationOnce(() => {
          const err: ErrorWithCode = new Error(
            'an error message that is not `file already exists`',
          );
          err.code = mockErrorCode;
          throw err;
        });
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();

      await buildWeb3Wallet(getMockArgv() as any);
      expect(promptMock).toHaveBeenCalledTimes(5);
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(errorMock).toHaveBeenLastCalledWith(
        expect.stringContaining(invalidDist),
        expect.objectContaining({ code: mockErrorCode }),
      );
    });

    it('logs error and reprompts if user inputs invalid permission', async () => {
      const invalidPermissions = '@!*XYZ123 confirm';
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => String(VALID_PORT))
        .mockImplementationOnce(async () => VALID_DIR)
        .mockImplementationOnce(async () => invalidPermissions)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);

      await buildWeb3Wallet(getMockArgv() as any);
      expect(promptMock).toHaveBeenCalledTimes(5);
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(errorMock).toHaveBeenLastCalledWith(
        expect.stringContaining(invalidPermissions),
        expect.any(Error),
      );
    });
  });

  describe('validateEmptyDir', () => {
    it('warns user if files may be overwritten', async () => {
      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(() => ['index.js', 'dist'] as any);
      const warningMock = jest
        .spyOn(miscUtils, 'logWarning')
        .mockImplementation();
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'n');
      jest
        .spyOn(process, 'exit')
        .mockImplementationOnce(() => undefined as never);
      jest.spyOn(console, 'log').mockImplementation();

      await validateEmptyDir();
      expect(warningMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('handles continue correctly', async () => {
      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(() => ['index.js', 'dist'] as any);
      const warningMock = jest
        .spyOn(miscUtils, 'logWarning')
        .mockImplementation();
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'YES');
      jest
        .spyOn(process, 'exit')
        .mockImplementationOnce(() => undefined as never);
      jest.spyOn(console, 'log').mockImplementation();

      await validateEmptyDir();
      expect(warningMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(1);
    });
  });
});
