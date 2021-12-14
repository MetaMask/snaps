import fs from 'fs';
import * as snapUtils from '@metamask/snap-controllers/dist/snaps';
import initPackageJson from 'init-package-json';
import mkdirp from 'mkdirp';
import {
  FakeFsError,
  getPackageJson,
  getSnapManifest,
} from '../../../test/utils';
// We have to import utils separately or else we run into trouble with our mocks
import * as fsUtils from '../../utils/fs';
import * as miscUtils from '../../utils/misc';
import * as readlineUtils from '../../utils/readline';
import {
  asyncPackageInit,
  buildSnapManifest,
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

jest.mock('@metamask/snap-controllers/dist/snaps');

jest.mock('init-package-json');

jest.mock('mkdirp');
const mkdirpMock = mkdirp as unknown as jest.Mock;

const PLACEHOLDER_SHASUM = '2QqUxo5joo4kKKr7yiCjdYsZOZcIFBnIBEdwU9Yx7+M=';

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

      await asyncPackageInit();
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
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });

      await expect(asyncPackageInit()).rejects.toThrow(
        new Error('process exited'),
      );
      expect(existsSyncMock).toHaveBeenCalled();
      expect(readFileMock).toHaveBeenCalledTimes(1);
      expect(parseMock).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(1);
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

      await expect(asyncPackageInit()).rejects.toThrow('initpackage error');
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

      await asyncPackageInit();
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
      const processExitMock = jest
        .spyOn(process, 'exit')
        .mockImplementationOnce(() => {
          throw new Error('process exited');
        });

      await expect(asyncPackageInit()).rejects.toThrow(
        new Error('process exited'),
      );
      expect(existsSyncMock).toHaveBeenCalledTimes(2);
      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(processExitMock).toHaveBeenCalledWith(1);
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

      const [manifest, argv] = await buildSnapManifest(
        getMockArgv(),
        getPackageJson(),
      );
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

      const [manifest, argv] = await buildSnapManifest(
        getMockArgv(),
        packageJson,
      );
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
      jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process exit');
      });

      await expect(
        buildSnapManifest(getMockArgv(), getPackageJson()),
      ).rejects.toThrow(new Error('process exit'));
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
      expect(logErrorMock).toHaveBeenCalledTimes(2);
      expect(process.exit).toHaveBeenCalledWith(1);
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
      jest
        .spyOn(process, 'exit')
        .mockImplementationOnce(() => undefined as never);
      jest.spyOn(console, 'log').mockImplementation();

      await prepareWorkingDirectory();
      expect(warningMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(1);
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
  });
});
