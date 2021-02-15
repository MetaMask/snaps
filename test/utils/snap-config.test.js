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
    jest.spyOn(JSON, 'parse').mockImplementation((value) => value);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    Object.keys(originalBuilders).forEach((key) => {
      builders[key] = originalBuilders[key];
    });
    fsMock.mockRestore();
    fsMock = null;
    delete global.snaps;
  });

  describe('applyConfig -- part 1: checks reads of package.json', () => {
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
      const custom = {
        main: 'custom.js',
        web3Wallet: {
          'bundle': {
            'url': 'http://localhost:8084/dist/bundle.js',
          },
          'initialPermissions': {
            'confirm': {},
          },
        },
      };

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson(custom.main, custom.web3Wallet))
        .mockImplementationOnce(async () => {
          return {};
        });

      await applyConfig();
      expect(builders.src.default).toStrictEqual(custom.main);
      expect(builders.bundle.default).toStrictEqual(builders.bundle.default);
      expect(builders.dist.default).toStrictEqual(builders.dist.default);
    });

    it('sets dist field correctly in edge case', async () => {
      const custom = {
        main: 'custom.js',
        web3Wallet: {
          'bundle': {
            'local': 'foo.js',
            'url': 'http://localhost:8084/dist/bundle.js',
          },
          'initialPermissions': {
            'confirm': {},
          },
        },
      };

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson(custom.main, custom.web3Wallet))
        .mockImplementationOnce(async () => {
          return {};
        });

      await applyConfig();
      expect(builders.src.default).toStrictEqual(custom.main);
      expect(builders.bundle.default).toStrictEqual(custom.web3Wallet.bundle.local);
      expect(builders.dist.default).toStrictEqual('.');
    });

    it('jsonpackage read error is handled correctly', async () => {
      global.snaps = {
        verboseErrors: false,
        suppressWarnings: false,
        isWatching: false,
      };

      const mockLogWarning = jest.spyOn(misc, 'logWarning');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => {
          throw new Error();
        })
        .mockImplementationOnce(async () => {
          return {};
        });

      await applyConfig();
      expect(mockLogWarning).toHaveBeenCalled();
      expect(global.console.warn).toHaveBeenCalledWith('Warning: Could not parse package.json');
    });
  });

  describe('applyConfig -- part 2: checks reads of config file', () => {

    it('sets configpath correctly', async () => {
      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => getDefaultSnapConfig());

      await applyConfig();
      expect(builders.port.default).toStrictEqual(8084);
      expect(builders.outfileName.default).toStrictEqual('test.js');
    });

    it('read config file error is handled correctly', async () => {

      global.snaps = {
        verboseErrors: false,
        suppressWarnings: false,
        isWatching: false,
      };

      const mockLogWarning = jest.spyOn(misc, 'logWarning');
      jest.spyOn(console, 'warn').mockImplementation();

      fsMock = jest.spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => getPackageJson())
        .mockImplementationOnce(async () => {
          throw new Error();
        });

      await applyConfig();
      expect(mockLogWarning).toHaveBeenCalled();
      expect(global.console.warn).toHaveBeenCalledWith('Warning: \'snap.config.json\' exists but could not be parsed.');
    });
  });

  describe('applyConfig', () => {
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

    it('configpath overrides jsonpackage fields', async () => {
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
