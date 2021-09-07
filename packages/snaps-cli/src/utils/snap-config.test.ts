import fs from 'fs';
import builders from '../builders';
import { applyConfig } from './snap-config';
import * as miscUtils from './misc';

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
          verboseErrors: ['v'],
          suppressWarnings: ['sw'],
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
    jest.spyOn(JSON, 'parse').mockImplementation((value) => value);

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
    (fs.readFileSync as jest.Mock).mockReturnValueOnce({ dist, outfileName });

    const argv = getYargsArgv();
    applyConfig(
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
    (fs.readFileSync as jest.Mock).mockReturnValueOnce({
      dist: configDist,
      outfileName,
    });

    const argvDist = 'build2';
    const argv = getYargsArgv({ dist: argvDist });
    applyConfig(
      ['build', '--dist', argvDist],
      argv as any,
      getYargsInstance({ keys: { outfileName: true, dist: true } }) as any,
    );

    expect(argv.dist).toStrictEqual(argvDist);
    expect(argv.outfileName).toStrictEqual(outfileName);
  });

  it('handles config file read errors (ENOENT)', () => {
    const mockLogError = jest.spyOn(miscUtils, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
      const err: Error & { code?: string } = new Error('foo');
      err.code = 'ENOENT';
      throw err;
    });

    const argv = getYargsArgv();
    applyConfig(['build'], argv as any, getYargsInstance() as any);

    expect(argv).toStrictEqual(getYargsArgv());
    expect(mockLogError).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('handles config file read errors (non-ENOENT)', () => {
    const mockLogError = jest.spyOn(miscUtils, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('foo');
    });

    applyConfig(['build'], getYargsArgv() as any, getYargsInstance() as any);
    expect(mockLogError).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles parseable but invalid config file', () => {
    const mockLogError = jest.spyOn(miscUtils, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    (fs.readFileSync as jest.Mock).mockReturnValueOnce('foo');

    applyConfig(['build'], getYargsArgv() as any, getYargsInstance() as any);
    expect(mockLogError).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles valid config file with invalid property', () => {
    const mockLogError = jest.spyOn(miscUtils, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    (fs.readFileSync as jest.Mock).mockReturnValueOnce({ foo: 'bar' });

    applyConfig(['build'], getYargsArgv() as any, getYargsInstance() as any);
    expect(mockLogError).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
