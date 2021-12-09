import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';
import { getPackageJson, getSnapManifest } from '../../../test/utils';
import * as readlineUtils from '../../utils/readline';
import * as miscUtils from '../../utils/misc';
import * as initUtils from './initUtils';
import { initHandler } from './initHandler';
import template from './init-template.json';

jest.mock('mkdirp');
const mkdirpMock = mkdirp as unknown as jest.Mock;

const getMockArgv = () => {
  return {
    dist: 'dist',
    outfileName: 'bundle.js',
    src: 'src/index.js',
    port: 8081,
  } as any;
};

describe('initialize', () => {
  describe('initHandler', () => {
    beforeEach(() => {
      jest
        .spyOn(initUtils, 'buildSnapManifest')
        .mockImplementation(async () => [getSnapManifest(), getMockArgv()]);
      jest.spyOn(initUtils, 'prepareWorkingDirectory').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(readlineUtils, 'closePrompt').mockImplementation();
    });

    afterEach(() => {
      global.snaps = {};
    });

    it('successfully initializes a Snap project', async () => {
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation();

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      const closePromptMock = jest
        .spyOn(readlineUtils, 'closePrompt')
        .mockImplementation();

      const mockArgv = getMockArgv();
      const expected = {
        dist: 'dist',
        outfileName: 'bundle.js',
        port: 8081,
        src: 'src/index.js',
      };

      expect(await initHandler({ ...getMockArgv() })).toStrictEqual({
        ...expected,
      });
      expect(global.console.log).toHaveBeenCalledTimes(6);
      expect(fsWriteMock).toHaveBeenCalledTimes(4);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        mockArgv.src,
        template.js.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        miscUtils.CONFIG_FILE,
        JSON.stringify(expected, null, 2),
      );
      expect(closePromptMock).toHaveBeenCalledTimes(1);
    });

    it('successfully initializes a Snap project (source file in root)', async () => {
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation();

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson({ main: 'index.js' }));

      const mockArgv = getMockArgv();
      mockArgv.src = 'index.js';

      jest
        .spyOn(initUtils, 'buildSnapManifest')
        .mockImplementation(async () => [getSnapManifest(), { ...mockArgv }]);

      const closePromptMock = jest
        .spyOn(readlineUtils, 'closePrompt')
        .mockImplementation();

      const expected = {
        dist: 'dist',
        outfileName: 'bundle.js',
        port: 8081,
        src: 'index.js',
      };

      expect(await initHandler({ ...mockArgv })).toStrictEqual({
        ...expected,
      });
      expect(global.console.log).toHaveBeenCalledTimes(6);
      expect(fsWriteMock).toHaveBeenCalledTimes(4);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(mkdirpMock).not.toHaveBeenCalled();

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        mockArgv.src,
        template.js.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        miscUtils.CONFIG_FILE,
        JSON.stringify(expected, null, 2),
      );
      expect(closePromptMock).toHaveBeenCalledTimes(1);
    });

    it('handles manifest write failure', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        // failed write to snap.manifest.json
        .mockRejectedValueOnce(new Error('failed to write'));

      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'process exited',
      );
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'snap.manifest.json'.`,
        new Error('failed to write'),
      );

      expect(fsWriteMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(mkdirpMock).not.toHaveBeenCalled();
    });

    it('handles src directory creation failure', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation();
      mkdirpMock.mockRejectedValueOnce(new Error('failed to create directory'));

      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'process exited',
      );

      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'src/index.js'.`,
        new Error('failed to create directory'),
      );

      expect(fsWriteMock).toHaveBeenCalledTimes(1);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('handles src file write failure', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        .mockImplementationOnce(async () => undefined)
        .mockRejectedValueOnce(new Error('failed to write'));

      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'process exited',
      );
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'src/index.js'.`,
        new Error('failed to write'),
      );

      expect(fsWriteMock).toHaveBeenCalledTimes(2);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        getMockArgv().src,
        template.js.source,
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('handles index.html file write failure', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        .mockImplementationOnce(async () => undefined)
        .mockImplementationOnce(async () => undefined)
        .mockRejectedValueOnce(new Error('failed to write'));

      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'process exited',
      );

      const mockArgv = getMockArgv();

      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'index.html'.`,
        new Error('failed to write'),
      );

      expect(fsWriteMock).toHaveBeenCalledTimes(3);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        mockArgv.src,
        template.js.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('handles snap.config.json file write failure', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      const fsWriteMock = jest
        .spyOn(fs, 'writeFile')
        .mockImplementationOnce(async () => undefined)
        .mockImplementationOnce(async () => undefined)
        .mockImplementationOnce(async () => undefined)
        .mockRejectedValueOnce(new Error('failed to write'));

      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'process exited',
      );

      const mockArgv = getMockArgv();

      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'snap.config.json'.`,
        new Error('failed to write'),
      );

      expect(fsWriteMock).toHaveBeenCalledTimes(4);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        mockArgv.src,
        template.js.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        miscUtils.CONFIG_FILE,
        JSON.stringify(
          {
            dist: 'dist',
            outfileName: 'bundle.js',
            port: 8081,
            src: 'src/index.js',
          },
          null,
          2,
        ),
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
