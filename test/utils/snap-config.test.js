const { promises: fs } = require('fs');
const { default: builders } = require('../../dist/src/builders');
const { applyConfig } = require('../../dist/src/utils/snap-config');
const misc = require('../../dist/src/utils/misc');

const getDefaultWeb3Wallet = () => {
  return {
    'bundle': {
      'local': 'dist/foo.js',
      'url': 'http://localhost:8084/dist/bundle.js',
    },
    'initialPermissions': {
      'confirm': {},
    },
  };
};

const getPackageJson = async (
  main = 'index.js',
  web3Wallet = getDefaultWeb3Wallet(),
) => {
  return {
    main,
    web3Wallet,
  };
};

const getDefaultSnapConfig = () => {
  return {
    'port': 8084,
    'outfileName': 'test.js',
  };
};

const getArgv = ({
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

describe('snap-config', () => {
  let fsMock;

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
    fsMock.mockRestore();
    fsMock = null;
    delete global.snaps;
  });

  describe('applyConfig - uses package.json in absence of config file', () => {
    it('sets default packageJSON correctly', async () => {
      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => {
          return {};
        });

      const argv = getArgv();
      await applyConfig(argv);

      expect(argv.src).toStrictEqual(builders.src.default);
      expect(argv.bundle).toStrictEqual('dist/foo.js');
      expect(argv.dist).toStrictEqual('dist/');
    });

    it('sets web3wallet with no local property correctly', async () => {
      const main = 'custom.js';
      const web3Wallet = {
        'bundle': {
          'url': 'http://localhost:8084/dist/bundle.js',
        },
        'initialPermissions': {
          'confirm': {},
        },
      };

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson(main, web3Wallet))
        .mockImplementationOnce(async () => {
          return {};
        });

      const argv = getArgv();
      await applyConfig(argv);

      expect(argv.src).toStrictEqual(main);
      expect(argv.bundle).toStrictEqual(builders.bundle.default);
      expect(argv.dist).toStrictEqual(builders.dist.default);
    });

    it('sets dist field correctly in edge case', async () => {
      const main = 'custom.js';
      const web3Wallet = {
        'bundle': {
          'local': 'foo.js',
          'url': 'http://localhost:8084/dist/bundle.js',
        },
        'initialPermissions': {
          'confirm': {},
        },
      };

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson(main, web3Wallet))
        .mockImplementationOnce(async () => {
          return {};
        });

      const argv = getArgv();
      await applyConfig(argv);

      expect(argv.src).toStrictEqual(main);
      expect(argv.bundle).toStrictEqual(web3Wallet.bundle.local);
      expect(argv.dist).toStrictEqual('.');
    });

    it('package.json read error is handled correctly', async () => {
      const mockLogError = jest.spyOn(misc, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => {
          throw new Error('foo');
        });

      await applyConfig(getArgv());
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('applyConfig - prefers config file over package.json', () => {
    it('finds and uses config file correctly', async () => {
      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => getDefaultSnapConfig());

      const argv = getArgv();
      await applyConfig(argv);

      expect(argv.port).toStrictEqual(8084);
      expect(argv.outfileName).toStrictEqual('test.js');
    });

    it('config file read error is handled correctly', async () => {
      const mockLogError = jest.spyOn(misc, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => {
          throw new Error('foo');
        });

      await applyConfig(getArgv());
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('parseable but invalid config file is handled correctly', async () => {
      const mockLogError = jest.spyOn(misc, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => 'foo');

      await applyConfig(getArgv());
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('valid config file with invalid property is handled correctly', async () => {
      const mockLogError = jest.spyOn(misc, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => {
          return { foo: 'bar' };
        });

      await applyConfig(getArgv());
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
