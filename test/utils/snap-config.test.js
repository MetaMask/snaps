const fs = require('fs');
const { default: builders } = require('../../dist/src/builders');
const { applyConfig } = require('../../dist/src/utils/snap-config');
const misc = require('../../dist/src/utils/misc');

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
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(process, 'exit').mockImplementation(() => undefined);
    jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    global.snaps = {
      verboseErrors: false,
      suppressWarnings: false,
      isWatching: false,
    };
  });

  afterEach(() => {
    delete global.snaps;
  });

  it('applies a valid config file', () => {
    const outfileName = 'foo.js';
    const dist = 'build';
    fs.readFileSync.mockReturnValueOnce({ dist, outfileName });

    const argv = getYargsArgv();
    applyConfig(
      ['build'],
      argv,
      getYargsInstance({ keys: { outfileName: true, dist: true } }),
    );

    expect(argv.dist).toStrictEqual(dist);
    expect(argv.outfileName).toStrictEqual(outfileName);
  });

  it('applies a valid config file, but ignores keys given on the command line', () => {
    const outfileName = 'foo.js';
    const configDist = 'build';
    fs.readFileSync.mockReturnValueOnce({ dist: configDist, outfileName });

    const argvDist = 'build2';
    const argv = getYargsArgv({ dist: argvDist });
    applyConfig(
      ['build', '--dist', argvDist],
      argv,
      getYargsInstance({ keys: { outfileName: true, dist: true } }),
    );

    expect(argv.dist).toStrictEqual(argvDist);
    expect(argv.outfileName).toStrictEqual(outfileName);
  });

  it('handles config file read errors (ENOENT)', () => {
    const mockLogError = jest.spyOn(misc, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    fs.readFileSync.mockImplementationOnce(() => {
      const err = new Error('foo');
      err.code = 'ENOENT';
      throw err;
    });

    const argv = getYargsArgv();
    applyConfig(['build'], argv, getYargsInstance());

    expect(argv).toStrictEqual(getYargsArgv());
    expect(mockLogError).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('handles config file read errors (non-ENOENT)', () => {
    const mockLogError = jest.spyOn(misc, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    fs.readFileSync.mockImplementationOnce(() => {
      throw new Error('foo');
    });

    applyConfig(['build'], getYargsArgv(), getYargsInstance());
    expect(mockLogError).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles parseable but invalid config file', () => {
    const mockLogError = jest.spyOn(misc, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    fs.readFileSync.mockReturnValueOnce('foo');

    applyConfig(['build'], getYargsArgv(), getYargsInstance());
    expect(mockLogError).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles valid config file with invalid property', () => {
    const mockLogError = jest.spyOn(misc, 'logError');
    jest.spyOn(console, 'warn').mockImplementation();

    fs.readFileSync.mockReturnValueOnce({ foo: 'bar' });

    applyConfig(['build'], getYargsArgv(), getYargsInstance());
    expect(mockLogError).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
