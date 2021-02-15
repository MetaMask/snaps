const { promises: fs } = require('fs');
const { default: builders } = require('../../dist/src/builders');
const { applyConfig } = require('../../dist/src/utils/snap-config');
const misc = require('../../dist/src/utils/misc');

const originalBuilders = Object.keys(builders).reduce((snapshot, key) => {
  snapshot[key] = builders[key];
  return builders[key];
}, {});

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
    Object.keys(originalBuilders).forEach((key) => {
      builders[key] = originalBuilders[key];
    });
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

      await applyConfig();
      expect(builders.src.default).toStrictEqual('index.js');
      expect(builders.bundle.default).toStrictEqual('dist/foo.js');
      expect(builders.dist.default).toStrictEqual('dist/');
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

      await applyConfig();
      expect(builders.src.default).toStrictEqual(main);
      expect(builders.bundle.default).toStrictEqual(builders.bundle.default);
      expect(builders.dist.default).toStrictEqual(builders.dist.default);
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

      await applyConfig();
      expect(builders.src.default).toStrictEqual(main);
      expect(builders.bundle.default).toStrictEqual(web3Wallet.bundle.local);
      expect(builders.dist.default).toStrictEqual('.');
    });

    it('package.json read error is handled correctly', async () => {
      const mockLogError = jest.spyOn(misc, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => {
          throw new Error('foo');
        });

      await applyConfig();
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('applyConfig - prefers config file over package.json', () => {
    it('finds and uses config file correctly', async () => {
      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => getDefaultSnapConfig());

      await applyConfig();
      expect(builders.port.default).toStrictEqual(8084);
      expect(builders.outfileName.default).toStrictEqual('test.js');
    });

    it('config file read error is handled correctly', async () => {
      const mockLogError = jest.spyOn(misc, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => {
          throw new Error('foo');
        });

      await applyConfig();
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('parseable but invalid config file is handled correctly', async () => {
      const mockLogError = jest.spyOn(misc, 'logError');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => 'foo');

      await applyConfig();
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

      await applyConfig();
      expect(mockLogError).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('applyConfig', () => {
    it('sets default values correctly', async () => {
      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => {
          return {};
        });

      await applyConfig();
      expect(builders.src.default).toStrictEqual('index.js');
      expect(builders.bundle.default).toStrictEqual('dist/foo.js');
      expect(builders.dist.default).toStrictEqual('dist/');
    });

    it('config file overrides package.json fields', async () => {
      const customConfig = {
        'src': 'custom.js',
      };

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => customConfig);

      await applyConfig();
      expect(builders.src.default).toStrictEqual('custom.js');
    });
  });
});
