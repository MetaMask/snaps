const fs = require('fs');
const initPackageJson = require('init-package-json');
const {
  asyncPackageInit,
  buildWeb3Wallet,
  validateEmptyDir,
} = require('../../../dist/src/cmds/init/initUtils');
const readlineUtils = require('../../../dist/src/utils/readline');
const miscUtils = require('../../../dist/src/utils/misc');

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

jest.mock('init-package-json');

describe('initUtils', () => {
  describe('asyncPackageInit', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('console logs if successful', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementation(() => true);
      const readFileMock = jest
        .spyOn(fs.promises, 'readFile')
        .mockImplementationOnce();
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
        .mockImplementationOnce();
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
      initPackageJson.mockImplementation((_, __, ___, cb) =>
        cb(new Error('initpackage error'), true),
      );

      await expect(asyncPackageInit()).rejects.toThrow('initpackage error');
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
    });

    it('yarn lock logic works', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);
      initPackageJson.mockImplementation((_, __, ___, cb) => cb(false, true));

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
    afterEach(() => {
      jest.restoreAllMocks();
    });

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
      const mkdirMock = fs.promises.mkdir.mockImplementation();
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(() => 'y');
      jest.spyOn(console, 'log').mockImplementation();

      await buildWeb3Wallet(getMockArgv());
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('throws error if fails to make directory and apply default values', async () => {
      fs.promises.mkdir.mockImplementation(() => {
        const err = new Error(
          'an error message that is not `file already exists`',
        );
        err.code = 'notEEXIST';
        throw err;
      });
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(() => 'y');
      jest.spyOn(console, 'log').mockImplementation();
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('error message');
      });

      await expect(buildWeb3Wallet(getMockArgv())).rejects.toThrow(
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
        .mockImplementationOnce(() => NO)
        .mockImplementationOnce(() => VALID_PORT)
        .mockImplementationOnce(() => VALID_DIR)
        .mockImplementationOnce(() => VALID_PERMISSIONS_INPUT);
      const mkdirMock = jest.spyOn(fs.promises, 'mkdir').mockImplementation();

      expect(await buildWeb3Wallet(mockArgv)).toStrictEqual(expectedMockWallet);
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
        .mockImplementationOnce(() => NO)
        .mockImplementationOnce(() => VALID_PORT)
        .mockImplementationOnce(() => VALID_DIR)
        .mockImplementationOnce(() => ''); // to accept default permissions
      const mkdirMock = jest.spyOn(fs.promises, 'mkdir').mockImplementation();

      expect(await buildWeb3Wallet(mockArgv)).toStrictEqual(expectedMockWallet);
      expect(promptMock).toHaveBeenCalledTimes(4);
      expect(mkdirMock).toHaveBeenCalledTimes(1);
    });

    it('treats already existing directory as a success', async () => {
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(() => NO)
        .mockImplementationOnce(() => VALID_PORT)
        .mockImplementationOnce(() => VALID_DIR)
        .mockImplementationOnce(() => VALID_PERMISSIONS_INPUT);
      const mkdirMock = fs.promises.mkdir.mockImplementation(() => {
        const err = new Error('file already exists');
        err.code = 'EEXIST';
        throw err;
      });
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();

      await buildWeb3Wallet(getMockArgv());
      expect(mkdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(4);
      expect(errorMock).not.toHaveBeenCalled();
    });

    it('logs error and reprompts if user inputs invalid port', async () => {
      const invalidPort = '-1';
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(() => NO)
        .mockImplementationOnce(() => invalidPort)
        .mockImplementationOnce(() => VALID_PORT)
        .mockImplementationOnce(() => VALID_DIR)
        .mockImplementationOnce(() => VALID_PERMISSIONS_INPUT);

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();

      await buildWeb3Wallet(getMockArgv());
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
        .mockImplementationOnce(() => NO)
        .mockImplementationOnce(() => VALID_PORT)
        .mockImplementationOnce(() => invalidDist)
        .mockImplementationOnce(() => VALID_DIR)
        .mockImplementationOnce(() => VALID_PERMISSIONS_INPUT);

      const mockErrorCode = 'notEEXIST';
      fs.promises.mkdir.mockResolvedValue().mockImplementationOnce(() => {
        const err = new Error(
          'an error message that is not `file already exists`',
        );
        err.code = mockErrorCode;
        throw err;
      });
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();

      await buildWeb3Wallet(getMockArgv());
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
        .mockImplementationOnce(() => NO)
        .mockImplementationOnce(() => VALID_PORT)
        .mockImplementationOnce(() => VALID_DIR)
        .mockImplementationOnce(() => invalidPermissions)
        .mockImplementationOnce(() => VALID_PERMISSIONS_INPUT);
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      fs.promises.mkdir.mockResolvedValue();

      await buildWeb3Wallet(getMockArgv());
      expect(promptMock).toHaveBeenCalledTimes(5);
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(errorMock).toHaveBeenLastCalledWith(
        expect.stringContaining(invalidPermissions),
        expect.any(Error),
      );
    });
  });

  describe('validateEmptyDir', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('warns user if files may be overwritten', async () => {
      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(() => ['index.js', 'dist']);
      const warningMock = jest
        .spyOn(miscUtils, 'logWarning')
        .mockImplementation();
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(() => 'n');
      jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined);
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
        .mockImplementation(() => ['index.js', 'dist']);
      const warningMock = jest
        .spyOn(miscUtils, 'logWarning')
        .mockImplementation();
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(() => 'YES');
      jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined);
      jest.spyOn(console, 'log').mockImplementation();

      await validateEmptyDir();
      expect(warningMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(1);
    });
  });
});
