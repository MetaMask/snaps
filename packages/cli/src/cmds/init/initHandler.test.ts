import { promises as fs } from 'fs';
import { getSnapSourceShasum, NpmSnapFileNames } from '@metamask/snap-utils';
import mkdirp from 'mkdirp';
import { getPackageJson, getSnapManifest } from '../../../test/utils';
import * as fsUtils from '../../utils/fs';
import * as miscUtils from '../../utils/misc';
import * as readlineUtils from '../../utils/readline';
import { getWritableManifest } from '../manifest/manifestHandler';
import { TemplateType } from '../../builders';
import template from './init-template.json';
import { initHandler, updateManifestShasum } from './initHandler';
import * as initUtils from './initUtils';

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
      expect(global.console.log).toHaveBeenCalledTimes(7);
      expect(fsWriteMock).toHaveBeenCalledTimes(5);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(2);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        mockArgv.src,
        template.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        miscUtils.CONFIG_FILE,
        expect.anything(),
      );
      expect(closePromptMock).toHaveBeenCalledTimes(1);
    });

    it('successfully initializes a TypeScript Snap project', async () => {
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation();

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      const closePromptMock = jest
        .spyOn(readlineUtils, 'closePrompt')
        .mockImplementation();

      const mockArgv = getMockArgv();
      // Change mocked argv to enable typescript
      mockArgv.template = TemplateType.TypeScript;
      mockArgv.src = 'src/index.ts';
      const expected = {
        template: TemplateType.TypeScript,
        dist: 'dist',
        outfileName: 'bundle.js',
        port: 8081,
        src: 'src/index.ts',
      };
      jest
        .spyOn(initUtils, 'buildSnapManifest')
        .mockImplementation(async () => [getSnapManifest(), { ...mockArgv }]);

      expect(await initHandler({ ...mockArgv })).toStrictEqual({
        ...expected,
      });
      expect(global.console.log).toHaveBeenCalledTimes(8);
      expect(fsWriteMock).toHaveBeenCalledTimes(6);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );
      expect(mkdirpMock).toHaveBeenCalledTimes(2);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        mockArgv.src,
        template.typescriptSource,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.typescriptHtml
          .toString()
          .replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        'tsconfig.json',
        template.typescriptConfig,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        5,
        miscUtils.CONFIG_FILE,
        expect.anything(),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        6,
        'images/icon.svg',
        template.icon,
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
      expect(global.console.log).toHaveBeenCalledTimes(7);
      expect(fsWriteMock).toHaveBeenCalledTimes(5);
      expect(fsWriteMock).toHaveBeenNthCalledWith(
        1,
        'snap.manifest.json',
        `${JSON.stringify(getSnapManifest(), null, 2)}\n`,
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        2,
        mockArgv.src,
        template.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        miscUtils.CONFIG_FILE,
        expect.anything(),
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

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'failed to write',
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

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'failed to create directory',
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

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'failed to write',
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
        template.source,
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
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

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'failed to write',
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
        template.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
    });

    it('handles tsconfig file write failure', async () => {
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

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      const mockArgv = getMockArgv();
      mockArgv.template = TemplateType.TypeScript;
      await expect(initHandler(mockArgv)).rejects.toThrow('failed to write');
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'tsconfig.json'.`,
        new Error('failed to write'),
      );
      expect(fsWriteMock).toHaveBeenCalledTimes(4);

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        'tsconfig.json',
        template.typescriptConfig,
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
    });

    it('handles snap.config.js file write failure', async () => {
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

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      await expect(initHandler(getMockArgv())).rejects.toThrow(
        'failed to write',
      );

      const mockArgv = getMockArgv();

      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'snap.config.js'.`,
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
        template.source,
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        3,
        'index.html',
        template.html.toString().replace(/_PORT_/gu, mockArgv.port.toString()),
      );

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        4,
        miscUtils.CONFIG_FILE,
        expect.anything(),
      );

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenNthCalledWith(1, 'src');
    });

    it('handles icon file write failure', async () => {
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
        .mockImplementationOnce(async () => undefined)
        .mockImplementationOnce(async () => undefined)
        .mockRejectedValueOnce(new Error('failed to write'));

      jest
        .spyOn(initUtils, 'asyncPackageInit')
        .mockImplementation(async () => getPackageJson());

      const mockArgv = getMockArgv();
      mockArgv.template = TemplateType.TypeScript;
      await expect(initHandler(mockArgv)).rejects.toThrow('failed to write');
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenNthCalledWith(
        1,
        `Init Error: Failed to write 'images/icon.svg'.`,
        new Error('failed to write'),
      );
      expect(fsWriteMock).toHaveBeenCalledTimes(6);

      expect(fsWriteMock).toHaveBeenNthCalledWith(
        6,
        'images/icon.svg',
        template.icon,
      );
    });
  });

  describe('updateManifestShasum', () => {
    it('updates the manifest shasum', async () => {
      const mockBundleContents = 'console.log("Very serious business.");';
      const expectedShasum = getSnapSourceShasum(mockBundleContents);

      const readJsonFileMock = jest
        .spyOn(fsUtils, 'readJsonFile')
        .mockImplementationOnce(async () => getSnapManifest());
      const readFileMock = jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => mockBundleContents);
      const writeFileMock = jest.spyOn(fs, 'writeFile').mockImplementation();

      await updateManifestShasum();

      expect(readJsonFileMock).toHaveBeenCalledTimes(1);
      expect(readJsonFileMock).toHaveBeenCalledWith(NpmSnapFileNames.Manifest);

      expect(readFileMock).toHaveBeenCalledTimes(1);
      expect(readFileMock).toHaveBeenCalledWith('dist/bundle.js', 'utf8');

      expect(writeFileMock).toHaveBeenCalledTimes(1);
      expect(writeFileMock).toHaveBeenCalledWith(
        NpmSnapFileNames.Manifest,
        JSON.stringify(
          getWritableManifest(getSnapManifest({ shasum: expectedShasum })),
          null,
          2,
        ),
      );
    });
  });
});
