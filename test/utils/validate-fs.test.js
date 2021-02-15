const { getOutfilePath, validateOutfileName, validateFilePath, validateDirPath } = require('../../dist/src/utils/validate-fs');
const filesystem = require('../../dist/src/utils/fs');

describe('validate', () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getOutfilePath', () => {
    it('gets the complete out file path', () => {
      expect(getOutfilePath('./src', 'outDir')).toStrictEqual('src/outDir');
      expect(getOutfilePath('../src', '///outDir////')).toStrictEqual('../src/outDir/');
      expect(getOutfilePath('../src', '/lol//outDir////')).toStrictEqual('../src/lol/outDir/');
      expect(getOutfilePath('src', 'outDir')).toStrictEqual('src/outDir');
      expect(getOutfilePath('src/', './outDir/')).toStrictEqual('src/outDir/');
      expect(getOutfilePath('src/', '')).toStrictEqual('src/bundle.js');
      expect(getOutfilePath('', '')).toStrictEqual('bundle.js');
    });
  });

  describe('validateOutfileName', () => {
    it('ensures outfile name is just a js file name', () => {
      expect(() => {
        validateOutfileName('file.ts');
      }).toThrow('Invalid outfile name: file.ts');

      expect(() => {
        validateOutfileName('/');
      }).toThrow('Invalid outfile name: /');

      expect(() => {
        validateOutfileName('');
      }).toThrow('Invalid outfile name: ');

      expect(() => {
        validateOutfileName('./src/file');
      }).toThrow('Invalid outfile name: ./src/file');

      expect(() => {
        validateOutfileName('.js');
      }).toThrow('Invalid outfile name: .js');

      expect(validateOutfileName('file.js')).toStrictEqual(true);
      expect(validateOutfileName('two.file.js')).toStrictEqual(true);
    });
  });

  describe('validates a file path', () => {
    it('checks whether the given path string resolves to an existing file', async () => {
      jest.spyOn(filesystem, 'isFile').mockReturnValue(true);
      const result = await validateFilePath('/some/file/path.js');
      expect(result).toStrictEqual(true);
    });

    it('checks whether an invalid path string throws an error', async () => {
      jest.spyOn(filesystem, 'isFile').mockReturnValue(false);
      await expect(validateFilePath('/some/file/path.js'))
        .rejects
        .toThrow('Invalid params: \'/some/file/path.js\' is not a file or does not exist.');
    });
  });

  describe('validates a directory path', () => {
    it('checks whether the given path string resolves to an existing directory', async () => {
      jest.spyOn(filesystem, 'isDirectory').mockReturnValue(true);
      const result = await validateDirPath('/some/directory', true);
      expect(result).toStrictEqual(true);
    });

    it('checks whether an invalid path string to a directory throws an error', async () => {
      jest.spyOn(filesystem, 'isDirectory').mockReturnValue(false);
      await expect(validateDirPath('/some/directory', true))
        .rejects
        .toThrow('Invalid params: \'/some/directory\' is not a directory or could not be created.');
    });
  });
});
