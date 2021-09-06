import fs from 'fs';
import * as utils from '../../utils/fs';
import * as manifestHandlerModule from './manifestHandler';
import manifestModule from '.';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
  },
}));

const getMockArgv = () => {
  return { dist: 'dist' } as any;
};

const getDefaultWeb3Wallet = () => {
  return {
    bundle: {
      local: 'dist/bundle.js',
      url: 'http://localhost:8081/dist/bundle.js',
    },
    initialPermissions: { alert: {} },
  };
};

const getPackageJson = (
  web3Wallet = getDefaultWeb3Wallet(),
  name = 'foo',
  version = 1,
  description = 'bar',
  main = 'index.js',
  repository = 'git',
) => {
  return {
    name,
    version,
    description,
    main,
    web3Wallet,
    repository,
  };
};

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

describe('manifest', () => {
  it('manifest handler: success', async () => {
    const foobar = { foo: 'bar' };
    const manifestHandlerMock = jest
      .spyOn(manifestHandlerModule, 'manifest')
      .mockImplementation();

    await (manifestModule as any).handler({ ...(foobar as any) });
    expect(manifestHandlerMock).toHaveBeenCalledWith(foobar);
  });

  it('manifest handler: failure', async () => {
    const foobar = { foo: 'bar' };
    const manifestHandlerMock = jest
      .spyOn(manifestHandlerModule, 'manifest')
      .mockImplementation(() => {
        throw new Error('manifest failure');
      });

    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(process, 'exit').mockImplementation();

    await (manifestModule as any).handler({ ...(foobar as any) });
    expect(manifestHandlerMock).toHaveBeenCalledWith(foobar);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  const { manifest } = manifestHandlerModule;

  describe('manifest function validates a snap package.json file', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation();
    });

    it('throws an error if there is no dist property', async () => {
      const noDistArgv = {};

      await expect(manifest(noDistArgv as any)).rejects.toThrow(
        "Invalid params: must provide 'dist'",
      );
    });

    it('throws error if fs.readfile fails', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        const err: Error & { code?: string } = new Error('file already exists');
        err.code = 'ENOENT';
        throw err;
      });
      const fsMock = jest.spyOn(fs.promises, 'readFile').mockImplementation();

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest error: Could not find package.json. Please ensure that you are running the command in the project root directory.',
      );
      expect(fsMock).toHaveBeenCalledTimes(1);
    });

    it('throws error if parse fails', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new Error('error');
      });
      const fsMock = jest
        .spyOn(fs.promises, 'readFile')
        .mockImplementationOnce(async () => getPackageJson() as any);

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Could not parse package.json',
      );
      expect(fsMock).toHaveBeenCalledTimes(1);
    });

    it('throws error if parsed json is invalid', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation(() => false);
      const fsMock = jest
        .spyOn(fs.promises, 'readFile')
        .mockImplementationOnce(async () => getPackageJson() as any);
      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Invalid parsed package.json: false',
      );
      expect(fsMock).toHaveBeenCalledTimes(1);
    });

    it('checks presence of required and recommended keys', async () => {
      const badJSON = {};
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();
      jest
        .spyOn(fs.promises, 'readFile')
        .mockImplementationOnce(async () => badJSON as any);

      await manifest(getMockArgv());
      expect(global.console.warn).toHaveBeenCalledTimes(2);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('checks web3Wallet bundle has valid local and url properties', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(utils, 'isFile').mockImplementation(async () => false);
      jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
        async () =>
          getPackageJson({
            bundle: {
              local: 'dist/bundle.js',
              url: {} as any,
            },
            initialPermissions: { alert: {} },
          }) as any,
      );

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest Error: package.json validation failed, please see above errors.',
      );
      expect(global.console.error).toHaveBeenCalledTimes(2);
    });

    it('checks web3Wallet bundle local property exists', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
      jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
        async () =>
          getPackageJson({
            bundle: {
              url: 'http://localhost:8081/dist/bundle.js',
            } as any,
            initialPermissions: { alert: {} },
          }) as any,
      );

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest Error: package.json validation failed, please see above errors.',
      );
      expect(global.console.error).toHaveBeenCalledTimes(1);
    });

    it('checks web3Wallet bundle url property exists', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
      jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
        async () =>
          getPackageJson({
            bundle: {
              local: 'dist/bundle.js',
            } as any,
            initialPermissions: { alert: {} },
          }) as any,
      );

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest Error: package.json validation failed, please see above errors.',
      );
      expect(global.console.error).toHaveBeenCalledTimes(1);
    });

    it('checks web3Wallet initial permissions property: throws error if not object', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
      jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
        async () =>
          getPackageJson({
            bundle: {
              local: 'dist/bundle.js',
              url: 'http://localhost:8081/dist/bundle.js',
            },
            initialPermissions: 'foo' as any,
          }) as any,
      );

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest Error: package.json validation failed, please see above errors.',
      );
      expect(global.console.error).toHaveBeenCalledTimes(1);
    });

    it('checks web3Wallet initial permissions property: throws error if array', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
      jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
        async () =>
          getPackageJson({
            bundle: {
              local: 'dist/bundle.js',
              url: 'http://localhost:8081/dist/bundle.js',
            },
            initialPermissions: ['alert', 'read'] as any,
          }) as any,
      );

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest Error: package.json validation failed, please see above errors.',
      );
      expect(global.console.error).toHaveBeenCalledTimes(1);
    });

    it('checks web3Wallet initial permissions property: throws error if permission objects are not objects', async () => {
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
      jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
        async () =>
          getPackageJson({
            bundle: {
              local: 'dist/bundle.js',
              url: 'http://localhost:8081/dist/bundle.js',
            },
            initialPermissions: { alert: 'foo', read: ['foo', 'bar'] } as any,
          }) as any,
      );

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest Error: package.json validation failed, please see above errors.',
      );
      expect(global.console.error).toHaveBeenCalledTimes(2);
    });

    it("checks web3Wallet initial permissions property: handles valid and throws error if object's permission keys are invalid", async () => {
      jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
      jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
        async () =>
          getPackageJson({
            bundle: {
              local: 'dist/bundle.js',
              url: 'http://localhost:8081/dist/bundle.js',
            },
            initialPermissions: {
              approve: { invoker: 'foo', date: 4546 },
              bad: { dangerous: 'scary' },
              parent: { parentCapability: 'mother' },
            } as any,
          }) as any,
      );

      await expect(manifest(getMockArgv())).rejects.toThrow(
        'Manifest Error: package.json validation failed, please see above errors.',
      );
      expect(global.console.error).toHaveBeenCalledTimes(2);
    });

    describe('checks if log error and warning aligns to global settings', () => {
      afterEach(() => {
        global.snaps.suppressWarnings = false;
      });

      it('logs manifest errors per global settings', async () => {
        jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
        jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
        jest.spyOn(fs.promises, 'readFile').mockImplementationOnce(
          async () =>
            getPackageJson({
              bundle: {
                local: 'dist/bundle.js',
                url: 'http://localhost:8081/dist/bundle.js',
              },
              initialPermissions: { alert: 'foo', read: ['foo', 'bar'] } as any,
            }) as any,
        );

        await expect(manifest(getMockArgv())).rejects.toThrow(
          'Manifest Error: package.json validation failed, please see above errors.',
        );
        expect(global.console.error).toHaveBeenCalledTimes(2);
      });

      it('suppresses manifest errors per global settings', async () => {
        global.snaps.suppressWarnings = true;
        const badJSON = {};
        jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'log').mockImplementation();
        jest
          .spyOn(fs.promises, 'readFile')
          .mockImplementationOnce(async () => badJSON as any);

        await manifest(getMockArgv());
        expect(global.console.warn).not.toHaveBeenCalled();
      });
    });

    describe('attempt to set missing/erroneous properties if commanded', () => {
      beforeEach(() => {
        jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
      });

      const populateArgv = {
        dist: 'dist',
        port: 8081,
        populate: true,
      };

      it('attempts to set missing web3wallet and throws if write fails', async () => {
        const mockJSON = {
          name: 'bob',
          version: 1.1,
          description: 'describe my snap',
          repository: 'git repository',
          main: 'index.js',
        };
        jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
        jest
          .spyOn(fs.promises, 'readFile')
          .mockImplementationOnce(async () => mockJSON as any);

        jest.spyOn(fs.promises, 'writeFile').mockImplementationOnce(() => {
          throw new Error('error');
        });

        await expect(manifest(populateArgv as any)).rejects.toThrow(
          'Could not write package.json',
        );
      });

      it('successfully sets missing web3wallet', async () => {
        const mockJSON = {
          name: 'bob',
          version: 1.1,
          description: 'describe my snap',
          repository: 'git repository',
          main: 'index.js',
        };

        const doneJSON = {
          name: 'bob',
          version: 1.1,
          description: 'describe my snap',
          repository: 'git repository',
          main: 'index.js',
          web3Wallet: {
            bundle: {
              local: 'dist/bundle.js',
              url: 'http://localhost:8081/dist/bundle.js',
            },
            initialPermissions: {},
          },
        };

        jest.spyOn(utils, 'isFile').mockImplementation(async () => true);
        jest
          .spyOn(fs.promises, 'readFile')
          .mockImplementationOnce(async () => mockJSON as any);

        jest
          .spyOn(fs.promises, 'writeFile')
          .mockImplementationOnce(() => doneJSON as any);
        jest.spyOn(console, 'log').mockImplementation();

        await manifest(populateArgv as any);
        expect(global.console.log).toHaveBeenCalledTimes(2);
      });
    });
  });
});
