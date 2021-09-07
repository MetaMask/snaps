import { promises as fs } from 'fs';
import * as readlineUtils from '../../utils/readline';
import * as miscUtils from '../../utils/misc';
import * as initUtils from './initUtils';
import { initHandler } from './initHandler';
import template from './initTemplate.json';

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

      jest
        .spyOn(initUtils, 'buildWeb3Wallet')
        .mockImplementation(() => mockWallet as any);
      jest.spyOn(initUtils, 'validateEmptyDir').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(readlineUtils, 'closePrompt').mockImplementation();
    });

    afterEach(() => {
      global.snaps = {};
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
      return { foo: 'bar' } as any;
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

    const newArgs = {
      dist: 'dist',
      outfileName: 'bundle.js',
      port: 8081,
      src: 'index.js',
    };
    const CONFIG_PATH = miscUtils.CONFIG_PATHS[0];

    it('function successfully executes under normal conditions', async () => {
      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        .mockImplementation(() => true as any);
      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(() => getMockPackage() as any);
      const closePromptMock = jest
        .spyOn(readlineUtils, 'closePrompt')
        .mockImplementation();
      const mockArgv = getMockArgv();

      expect(await initHandler({ ...mockArgv })).toStrictEqual(
        getExpectedReturnValue(),
      );
      expect(global.console.log).toHaveBeenCalledTimes(6);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'package.json',
        `${JSON.stringify(getMockPackageAndWallet(), null, 2)}\n`,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        getMockPackage().main,
        template.js,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html
          .toString()
          .replace(
            /_PORT_/gu,
            newArgs.port.toString() ||
              ((mockArgv as unknown) as { port: number }).port.toString(),
          ),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        CONFIG_PATH,
        JSON.stringify(newArgs, null, 2),
      );
      expect(closePromptMock).toHaveBeenCalledTimes(1);
    });

    it('function logs error when write to main is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        // failed write to package.json
        .mockRejectedValue(undefined);
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(() => getMockPackage() as any);

      await expect(initHandler(getMockArgv() as any)).rejects.toThrow(
        'process exited',
      );
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('function logs error when write to index is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        // succesful write to package.json
        .mockResolvedValueOnce()
        // failed write to index.js
        .mockRejectedValue(undefined);
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(() => getMockPackage() as any);

      await expect(initHandler(getMockArgv() as any)).rejects.toThrow(
        'process exited',
      );
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenCalledTimes(2);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('function logs error when write to config is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        // succesful write to package.json
        .mockResolvedValueOnce()
        // successful write to index.js
        .mockResolvedValueOnce()
        // failed write to index.html
        .mockRejectedValue(undefined);
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(() => getMockPackage() as any);

      await expect(initHandler(getMockArgv() as any)).rejects.toThrow(
        'process exited',
      );
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenCalledTimes(3);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('function logs error when write to confdig is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        // succesful write to package.json
        .mockResolvedValueOnce()
        // succesful write to index.js
        .mockResolvedValueOnce()
        // succesful write to index.html
        .mockResolvedValueOnce()
        // failed write to snap.config.json
        .mockRejectedValue(undefined);
      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(() => getMockPackage() as any);

      await initHandler(getMockArgv() as any);
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

      jest.spyOn(fs, 'writeFile').mockImplementation(() => true as any);
      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(() => mockUndefinedMain as any);
      jest.spyOn(readlineUtils, 'closePrompt').mockImplementation();
      expect(await initHandler(getMockArgv() as any)).toStrictEqual(
        expectedReturn,
      );
    });
  });
});
