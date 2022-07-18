import fs from 'fs';
import { SnapManifest } from '@metamask/snap-utils';
import * as snapUtils from '@metamask/snap-utils';
import initPackageJson from 'init-package-json';
import mkdirp from 'mkdirp';
import { Arguments } from 'yargs';
import {
  FakeFsError,
  getPackageJson,
  getSnapManifest,
} from '../../../test/utils';
import { YargsArgs } from '../../types/yargs';
// We have to import utils separately or else we run into trouble with our mocks
import * as fsUtils from '../../utils/fs';
import * as miscUtils from '../../utils/misc';
import * as readlineUtils from '../../utils/readline';
import { TemplateType } from '../../builders';
import {
  asyncPackageInit,
  buildSnapManifest,
  correctDefaultArgs,
  prepareWorkingDirectory,
} from './initUtils';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

jest.mock('@metamask/snap-utils');
jest.mock('init-package-json');
jest.mock('mkdirp');

const mkdirpMock = mkdirp as unknown as jest.Mock;
const PLACEHOLDER_SHASUM = '2QqUxo5joo4kKKr7yiCjdYsZOZcIFBnIBEdwU9Yx7+M=';
const getMockedArgv = () => {
  return {
    dist: 'dist',
    outfileName: 'bundle.js',
    src: 'src/index.js',
    port: 8081,
  } as any;
};

describe('initUtils', () => {
  describe('asyncPackageInit', () => {
    it('console logs if successful', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementation(() => true);

      const readJsonFileMock = jest
        .spyOn(fsUtils, 'readJsonFile')
        .mockImplementationOnce(async () => '');

      const validateSnapJsonFileMock = jest
        .spyOn(snapUtils, 'validateSnapJsonFile')
        .mockImplementationOnce(() => true);

      jest.spyOn(console, 'log').mockImplementation();

      await asyncPackageInit(getMockedArgv());
      expect(existsSyncMock).toHaveBeenCalledTimes(1);
      expect(readJsonFileMock).toHaveBeenCalledTimes(1);
      expect(validateSnapJsonFileMock).toHaveBeenCalledTimes(1);
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
      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      await expect(asyncPackageInit(getMockedArgv())).rejects.toThrow(
        'error message',
      );
      expect(existsSyncMock).toHaveBeenCalled();
      expect(readFileMock).toHaveBeenCalledTimes(1);
      expect(parseMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('yarn lock logic works throws error if initpackagejson is rejected', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);
      (initPackageJson as unknown as jest.Mock).mockImplementation(
        (_, __, ___, cb) => cb(new Error('initpackage error'), true),
      );

      await expect(asyncPackageInit(getMockedArgv())).rejects.toThrow(
        'initpackage error',
      );
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
    });

    it('yarn lock logic works', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);
      (initPackageJson as unknown as jest.Mock).mockImplementation(
        (_, __, ___, cb) => cb(false, true),
      );

      await asyncPackageInit(getMockedArgv());
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
    });

    it('logs error when yarn lock is found', async () => {
      const existsSyncMock = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => true);
      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      await expect(asyncPackageInit(getMockedArgv())).rejects.toThrow(
        'Already existing yarn.lock file found',
      );
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildSnapManifest', () => {
    const getMockArgv = () => {
      return {
        dist: 'dist',
        outfileName: 'bundle.js',
      } as any;
    };

    const NO = 'no';
    const VALID_PERMISSIONS_INPUT = 'snap_confirm snap_manageState';

    it('applies default manifest values if user inputs "yes"', async () => {
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'y');
      jest.spyOn(console, 'log').mockImplementation();

      const manifestAndArgs = await buildSnapManifest(
        getMockArgv(),
        getPackageJson(),
      );
      expect(manifestAndArgs).not.toBeNull();
      const [manifest, argv] = manifestAndArgs as [SnapManifest, YargsArgs];
      expect(manifest).toStrictEqual(
        getSnapManifest({ shasum: PLACEHOLDER_SHASUM }),
      );

      expect(argv).toStrictEqual({
        ...getMockArgv(),
        src: 'src/index.js',
      });

      expect(promptMock).toHaveBeenCalledTimes(1);

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenCalledWith(getMockArgv().dist);

      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('handles missing "description" property in package.json', async () => {
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'y');
      jest.spyOn(console, 'log').mockImplementation();

      const packageJson = getPackageJson();
      delete packageJson.description;

      const manifestAndArgs = await buildSnapManifest(
        getMockArgv(),
        packageJson,
      );
      expect(manifestAndArgs).not.toBeNull();
      const [manifest, argv] = manifestAndArgs as [SnapManifest, YargsArgs];
      expect(manifest).toStrictEqual(
        getSnapManifest({
          description: 'The @metamask/example-snap Snap.',
          shasum: PLACEHOLDER_SHASUM,
        }),
      );

      expect(argv).toStrictEqual({
        ...getMockArgv(),
        src: 'src/index.js',
      });

      expect(promptMock).toHaveBeenCalledTimes(1);

      expect(mkdirpMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenCalledWith(getMockArgv().dist);

      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('handles missing "repository" property in package.json', async () => {
      jest.spyOn(readlineUtils, 'prompt').mockImplementation(async () => 'y');
      jest.spyOn(console, 'log').mockImplementation();
      const packageJson = getPackageJson();
      delete packageJson.repository;

      const manifestAndArgs = await buildSnapManifest(
        getMockArgv(),
        packageJson,
      );
      expect(manifestAndArgs).not.toBeNull();
      const [manifest] = manifestAndArgs as [SnapManifest, YargsArgs];
      expect(manifest.repository).toBeNull();
    });

    it('handles missing "main" property in package.json', async () => {
      jest.spyOn(readlineUtils, 'prompt').mockImplementation(async () => 'y');
      jest.spyOn(console, 'log').mockImplementation();
      const packageJson = getPackageJson();
      delete packageJson.main;

      const manifestAndArgs = await buildSnapManifest(
        getMockArgv(),
        packageJson,
      );
      expect(manifestAndArgs).not.toBeNull();
      const [, argv] = manifestAndArgs as [SnapManifest, YargsArgs];
      expect(argv.src).toBe('src/index.js');
    });

    it('throws if the "dist" directory cannot be created', async () => {
      mkdirpMock.mockImplementationOnce(() => {
        throw new FakeFsError('some file system error', 'ERROR');
      });
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'y');
      jest.spyOn(console, 'log').mockImplementation();
      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      await expect(
        buildSnapManifest(getMockArgv(), getPackageJson()),
      ).rejects.toThrow('some file system error');
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledTimes(2);
    });

    it('handles valid user inputs when not using default values', async () => {
      const packageJson = getPackageJson();
      const { dist } = getMockArgv();

      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => packageJson.name)
        .mockImplementationOnce(async () => packageJson.description)
        .mockImplementationOnce(async () => dist)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);

      expect(
        await buildSnapManifest(getMockArgv(), getPackageJson()),
      ).toStrictEqual([
        getSnapManifest({
          initialPermissions: {
            snap_confirm: {},
            snap_manageState: {},
          },
          shasum: PLACEHOLDER_SHASUM,
        }),
        { dist, outfileName: 'bundle.js', src: 'src/index.js' },
      ]);
      expect(promptMock).toHaveBeenCalledTimes(5);
      expect(mkdirpMock).toHaveBeenCalledTimes(1);
    });

    it('handles invalid "proposedName" input', async () => {
      const packageJson = getPackageJson();
      const { dist } = getMockArgv();

      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => new Array(215).fill('a').join(''))
        .mockImplementationOnce(async () => packageJson.name)
        .mockImplementationOnce(async () => packageJson.description)
        .mockImplementationOnce(async () => dist)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      expect(
        await buildSnapManifest(getMockArgv(), getPackageJson()),
      ).toStrictEqual([
        getSnapManifest({
          initialPermissions: {
            snap_confirm: {},
            snap_manageState: {},
          },
          shasum: PLACEHOLDER_SHASUM,
        }),
        { dist, outfileName: 'bundle.js', src: 'src/index.js' },
      ]);

      expect(promptMock).toHaveBeenCalledTimes(6);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledWith(
        expect.stringMatching(
          /the proposed name must adhere to npm package naming conventions/iu,
        ),
      );
      expect(mkdirpMock).toHaveBeenCalledTimes(1);
    });

    it('handles invalid "description" input', async () => {
      const packageJson = getPackageJson();
      const { dist } = getMockArgv();

      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => packageJson.name)
        .mockImplementationOnce(async () => new Array(281).fill('a').join(''))
        .mockImplementationOnce(async () => packageJson.description)
        .mockImplementationOnce(async () => dist)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      expect(
        await buildSnapManifest(getMockArgv(), getPackageJson()),
      ).toStrictEqual([
        getSnapManifest({
          initialPermissions: {
            snap_confirm: {},
            snap_manageState: {},
          },
          shasum: PLACEHOLDER_SHASUM,
        }),
        { dist, outfileName: 'bundle.js', src: 'src/index.js' },
      ]);

      expect(promptMock).toHaveBeenCalledTimes(6);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledWith(
        `The description must be a non-empty string less than or equal to 280 characters.`,
      );
      expect(mkdirpMock).toHaveBeenCalledTimes(1);
    });

    it('handles invalid "dist" input', async () => {
      const packageJson = getPackageJson();
      const { dist } = getMockArgv();

      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => packageJson.name)
        .mockImplementationOnce(async () => packageJson.description)
        .mockImplementationOnce(async () => 'invalid/directory')
        .mockImplementationOnce(async () => dist)
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);

      mkdirpMock.mockImplementationOnce(async () => {
        throw new Error('invalid directory');
      });

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      expect(
        await buildSnapManifest(getMockArgv(), getPackageJson()),
      ).toStrictEqual([
        getSnapManifest({
          initialPermissions: {
            snap_confirm: {},
            snap_manageState: {},
          },
          shasum: PLACEHOLDER_SHASUM,
        }),
        { dist, outfileName: 'bundle.js', src: 'src/index.js' },
      ]);

      expect(promptMock).toHaveBeenCalledTimes(6);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledWith(
        `Unable to create directory 'invalid/directory'. Ensure that the path is valid and try again.`,
        new Error('invalid directory'),
      );
      expect(mkdirpMock).toHaveBeenCalledTimes(2);
    });

    it('handles "default" initialPermission input', async () => {
      for (const mockInput of ['', 'snap_confirm']) {
        const packageJson = getPackageJson();
        const { dist } = getMockArgv();

        const promptMock = jest
          .spyOn(readlineUtils, 'prompt')
          .mockImplementationOnce(async () => NO)
          .mockImplementationOnce(async () => packageJson.name)
          .mockImplementationOnce(async () => packageJson.description)
          .mockImplementationOnce(async () => dist)
          .mockImplementationOnce(async () => mockInput);

        const logErrorMock = jest
          .spyOn(miscUtils, 'logError')
          .mockImplementation();

        expect(
          await buildSnapManifest(getMockArgv(), getPackageJson()),
        ).toStrictEqual([
          getSnapManifest({
            shasum: PLACEHOLDER_SHASUM,
          }),
          { dist, outfileName: 'bundle.js', src: 'src/index.js' },
        ]);

        expect(promptMock).toHaveBeenCalledTimes(5);
        expect(logErrorMock).not.toHaveBeenCalled();
        expect(mkdirpMock).toHaveBeenCalledTimes(1);

        jest.resetAllMocks();
      }
    });

    it('handles invalid "initialPermissions" input', async () => {
      const packageJson = getPackageJson();
      const { dist } = getMockArgv();

      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementationOnce(async () => NO)
        .mockImplementationOnce(async () => packageJson.name)
        .mockImplementationOnce(async () => packageJson.description)
        .mockImplementationOnce(async () => dist)
        .mockImplementationOnce(async () => '@invalid ~permissions')
        .mockImplementationOnce(async () => VALID_PERMISSIONS_INPUT);

      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();

      expect(
        await buildSnapManifest(getMockArgv(), getPackageJson()),
      ).toStrictEqual([
        getSnapManifest({
          initialPermissions: {
            snap_confirm: {},
            snap_manageState: {},
          },
          shasum: PLACEHOLDER_SHASUM,
        }),
        { dist, outfileName: 'bundle.js', src: 'src/index.js' },
      ]);

      expect(promptMock).toHaveBeenCalledTimes(6);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledWith(
        `Invalid permissions '@invalid ~permissions'.\nThe permissions must be specified as a space-separated list of strings with only characters, digits, underscores ('_'), and colons (':').`,
        new Error('Invalid permission: @invalid'),
      );
      expect(mkdirpMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('prepareWorkingDirectory', () => {
    it('warns user if files may be overwritten', async () => {
      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(() => ['src/index.js', 'dist'] as any);
      const warningMock = jest
        .spyOn(miscUtils, 'logWarning')
        .mockImplementation();
      const promptMock = jest
        .spyOn(readlineUtils, 'prompt')
        .mockImplementation(async () => 'n');
      jest.spyOn(console, 'log').mockImplementation();

      await expect(prepareWorkingDirectory()).rejects.toThrow(
        'User refused to continue',
      );
      expect(warningMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('handles continue correctly', async () => {
      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(() => ['src/index.js', 'dist'] as any);
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

      await prepareWorkingDirectory();
      expect(warningMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(1);
    });

    it('handles a situation where there are no existing files in the directory correctly', async () => {
      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(() => [] as any);
      const promptMock = jest.spyOn(readlineUtils, 'prompt');
      await prepareWorkingDirectory();
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('correctDefaultArgs', () => {
    it('should change default source file from index.js to index.ts when typescript is enabled', () => {
      const mockArgv = {
        dist: 'dist',
        outfileName: 'bundle.js',
        src: 'src/index.js',
        port: 8081,
        template: TemplateType.TypeScript,
      } as unknown as Arguments;
      expect(correctDefaultArgs(mockArgv)).toStrictEqual({
        ...mockArgv,
        src: 'src/index.ts',
      });
    });

    it('should not change custom source file name when typescript is enabled', () => {
      const customFileName = 'src/foo.ts';
      const mockArgv = {
        dist: 'dist',
        outfileName: 'bundle.js',
        src: customFileName,
        port: 8081,
        template: TemplateType.TypeScript,
      } as unknown as Arguments;
      expect(correctDefaultArgs(mockArgv)).toStrictEqual({
        ...mockArgv,
        src: customFileName,
      });
    });
  });
});
