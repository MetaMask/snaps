const { promises: fs } = require('fs');
const initUtils = require('../../../dist/src/cmds/init/initUtils');
const readlineUtils = require('../../../dist/src/utils/readline');
const miscUtils = require('../../../dist/src/utils/misc');
const { initHandler } = require('../../../dist/src/cmds/init/initHandler');
const template = require('../../../dist/src/cmds/init/initTemplate.json');
const { CONFIG_PATHS } = require('../../../dist/src/utils/misc');

describe('initialize', () => {
  describe('initHandler', () => {
    beforeEach(() => {
      const mockWallet = [
        {
          bundle: {},
          initialPermissions: {},
        },
        { dist: 'dist', outfileName: 'bundle.js', port: 8081 },
      ];

      jest.spyOn(initUtils, 'buildWeb3Wallet').mockImplementation(() => mockWallet);
      jest.spyOn(initUtils, 'validateEmptyDir').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(readlineUtils, 'closePrompt').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      delete global.snaps;
    });

    const getMockPackage = () => {
      return {
        main: 'index.js',
      };
    };

    const getMockPackageAndWallet = () => {
      return {
        main: 'index.js',
        web3Wallet: {
          bundle: {},
          initialPermissions: {},
        },
      };
    };

    const getMockArgv = () => {
      return { foo: 'bar' };
    };

    const getExpectedReturnValue = () => {
      return {
        foo: 'bar',
        src: 'index.js',
        dist: 'dist',
        outfileName: 'bundle.js',
        port: 8081,
      };
    };

    const newArgs = { dist: 'dist', outfileName: 'bundle.js', port: 8081, src: 'index.js' };
    const CONFIG_PATH = CONFIG_PATHS[0];

    it('function successfully executes under normal conditions', async () => {
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation(() => true);
      jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => getMockPackage());
      const closePromptMock = jest.spyOn(readlineUtils, 'closePrompt')
        .mockImplementation();
      const mockArgv = getMockArgv();

      expect(await initHandler({ ...mockArgv })).toStrictEqual(getExpectedReturnValue());
      expect(global.console.log).toHaveBeenCalledTimes(6);
      expect(fsWriteMock)
        .toHaveBeenNthCalledWith(1, 'package.json', `${JSON.stringify(getMockPackageAndWallet(), null, 2)}\n`);
      expect(fsWriteMock)
        .toHaveBeenNthCalledWith(2, getMockPackage().main, template.js);
      expect(fsWriteMock).toHaveBeenNthCalledWith(3, 'index.html', template.html.toString()
        .replace(/_PORT_/gu, newArgs.port.toString() || mockArgv.port.toString()));
      expect(fsWriteMock).toHaveBeenNthCalledWith(4, CONFIG_PATH, JSON.stringify(newArgs, null, 2));
      expect(closePromptMock).toHaveBeenCalledTimes(1);
    });

    it('function logs error when write to main is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockRejectedValue();
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });
      jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => getMockPackage());

      await expect(initHandler(getMockArgv()))
        .rejects
        .toThrow('process exited');
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('function logs error when write to index is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest.spyOn(fs, 'writeFile')
        .mockResolvedValueOnce('successful write to packagejson')
        .mockRejectedValue();
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });
      jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => getMockPackage());

      await expect(initHandler(getMockArgv()))
        .rejects
        .toThrow('process exited');
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenCalledTimes(2);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('function logs error when write to config is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest.spyOn(fs, 'writeFile')
        .mockResolvedValueOnce('successful write to packagejson')
        .mockResolvedValueOnce('successful write to main')
        .mockRejectedValue();
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });
      jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => getMockPackage());

      await expect(initHandler(getMockArgv()))
        .rejects
        .toThrow('process exited');
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenCalledTimes(3);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('function logs error when write to confdig is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest.spyOn(fs, 'writeFile')
        .mockResolvedValueOnce('successful write to packagejson')
        .mockResolvedValueOnce('successful write to main')
        .mockResolvedValueOnce('successful write to index')
        .mockRejectedValue();
      jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => getMockPackage());

      await initHandler(getMockArgv());
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenCalledTimes(4);
    });

    it('function does not write to main if undefined', async () => {
      const mockUndefinedMain = { foo: 'bar' };
      const expectedReturn = {
        foo: 'bar',
        dist: 'dist',
        outfileName: 'bundle.js',
        port: 8081,
      };

      jest.spyOn(fs, 'writeFile').mockImplementation(() => true);
      jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => mockUndefinedMain);
      jest.spyOn(readlineUtils, 'closePrompt').mockImplementation();
      expect(await initHandler(getMockArgv())).toStrictEqual(expectedReturn);
    });
  });
});
