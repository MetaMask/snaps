import path from 'path';
import builders from '../builders';
import * as miscUtils from './misc';
import { applyConfig, loadConfig, SnapConfig } from './snap-config';

const CONFIG_FILE_LOCATION = path.resolve(process.cwd(), miscUtils.CONFIG_FILE);

const getYargsArgv = ({
  bundle = builders.bundle.default,
  dist = builders.dist.default,
  outfileName = builders.outfileName.default,
  port = builders.port.default,
  src = builders.src.default,
} = {}) => {
  return {
    bundle,
    dist,
    outfileName,
    port,
    src,
  };
};

const getYargsInstance = ({ keys = {}, aliases = {} } = {}) => {
  return {
    getOptions: () => {
      return {
        key: {
          version: true,
          verboseErrors: true,
          suppressWarnings: true,
          help: true,
          ...keys,
        },
        alias: {
          help: ['h'],
          ...aliases,
        },
      };
    },
  };
};

jest.mock('fs');

describe('snap-config', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  describe('loadConfig', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('handles a proper config file', () => {
      const config: SnapConfig = {
        options: {
          port: 8080,
        },
      };
      jest.doMock(CONFIG_FILE_LOCATION, () => config, { virtual: true });

      const result = loadConfig();

      expect(result).toStrictEqual(config);
    });

    it('handles config file read errors (MODULE_NOT_FOUND)', () => {
      const mockLogError = jest.spyOn(miscUtils, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      jest.doMock(
        CONFIG_FILE_LOCATION,
        (): never => {
          const err: Error & { code?: string } = new Error('foo');
          err.code = 'MODULE_NOT_FOUND';
          throw err;
        },
        { virtual: true },
      );

      const result = loadConfig();

      expect(result).toStrictEqual({});
      expect(mockLogError).not.toHaveBeenCalled();
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('handles config file read errors (non-MODULE_NOT_FOUND)', () => {
      const mockLogError = jest.spyOn(miscUtils, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      jest.doMock(
        CONFIG_FILE_LOCATION,
        (): never => {
          throw new Error('foo');
        },
        { virtual: true },
      );

      loadConfig();

      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('handles parseable but invalid config file', () => {
      const mockLogError = jest.spyOn(miscUtils, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      jest.setMock(CONFIG_FILE_LOCATION, null);

      loadConfig();

      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('applyConfig', () => {
    beforeEach(() => {
      global.snaps = {
        verboseErrors: false,
        suppressWarnings: false,
        isWatching: false,
      };
    });

    afterEach(() => {
      global.snaps = {};
    });

    it('applies a valid config file', () => {
      const outfileName = 'foo.js';
      const dist = 'build';
      const config: SnapConfig = {
        options: {
          dist,
          outfileName,
        },
      };

      const argv = getYargsArgv();
      applyConfig(
        config,
        ['build'],
        argv as any,
        getYargsInstance({ keys: { outfileName: true, dist: true } }) as any,
      );

      expect(argv.dist).toStrictEqual(dist);
      expect(argv.outfileName).toStrictEqual(outfileName);
    });

    it('applies a valid config file, but ignores keys given on the command line', () => {
      const outfileName = 'foo.js';
      const configDist = 'build';
      const config: SnapConfig = {
        options: {
          dist: configDist,
          outfileName,
        },
      };

      const argvDist = 'build2';
      const argv = getYargsArgv({ dist: argvDist });
      applyConfig(
        config,
        ['build', '--dist', argvDist],
        argv as any,
        getYargsInstance({ keys: { outfileName: true, dist: true } }) as any,
      );

      expect(argv.dist).toStrictEqual(argvDist);
      expect(argv.outfileName).toStrictEqual(outfileName);
    });

    it('handles valid config file with invalid property', () => {
      const mockLogError = jest.spyOn(miscUtils, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();
      const config: SnapConfig = {
        options: { foo: 'bar' },
      };

      applyConfig(
        config,
        ['build'],
        getYargsArgv() as any,
        getYargsInstance() as any,
      );
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
