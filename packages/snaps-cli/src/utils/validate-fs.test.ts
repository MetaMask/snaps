import os from 'os';
import {
  getOutfilePath,
  validateOutfileName,
  validateFilePath,
  validateDirPath,
} from './validate-fs';
import * as filesystem from './fs';

describe('validate', () => {
  describe('getOutfilePath', () => {
    it('gets the complete out file path', () => {
      let expPath1, expPath2, expPath3, expPath4, expPath5, expPath6;
      // eslint-disable-next-line jest/no-if
      if (os.platform() === 'win32') {
        expPath1 = 'src\\outDir';
        expPath2 = '..\\src\\outDir\\';
        expPath3 = '..\\src\\lol\\outDir\\';
        expPath4 = 'src\\outDir';
        expPath5 = 'src\\outDir\\';
        expPath6 = 'src\\bundle.js';
      } else {
        expPath1 = 'src/outDir';
        expPath2 = '../src/outDir/';
        expPath3 = '../src/lol/outDir/';
        expPath4 = 'src/outDir';
        expPath5 = 'src/outDir/';
        expPath6 = 'src/bundle.js';
      }
      expect(getOutfilePath('./src', 'outDir')).toStrictEqual(expPath1);
      expect(getOutfilePath('../src', '///outDir////')).toStrictEqual(expPath2);

      expect(getOutfilePath('../src', '/lol//outDir////')).toStrictEqual(
        expPath3,
      );
      expect(getOutfilePath('src', 'outDir')).toStrictEqual(expPath4);
      expect(getOutfilePath('src/', './outDir/')).toStrictEqual(expPath5);
      expect(getOutfilePath('src/', '')).toStrictEqual(expPath6);
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
      jest.spyOn(filesystem, 'isFile').mockReturnValue(Promise.resolve(true));
      const result = await validateFilePath('/some/file/path.js');
      expect(result).toStrictEqual(true);
    });

    it('checks whether an invalid path string throws an error', async () => {
      jest.spyOn(filesystem, 'isFile').mockReturnValue(Promise.resolve(false));
      await expect(validateFilePath('/some/file/path.js')).rejects.toThrow(
        "Invalid params: '/some/file/path.js' is not a file or does not exist.",
      );
    });
  });

  describe('validates a directory path', () => {
    it('checks whether the given path string resolves to an existing directory', async () => {
      jest
        .spyOn(filesystem, 'isDirectory')
        .mockReturnValue(Promise.resolve(true));
      const result = await validateDirPath('/some/directory', true);
      expect(result).toStrictEqual(true);
    });

    it('checks whether an invalid path string to a directory throws an error', async () => {
      jest
        .spyOn(filesystem, 'isDirectory')
        .mockReturnValue(Promise.resolve(false));

      await expect(validateDirPath('/some/directory', true)).rejects.toThrow(
        "Invalid params: '/some/directory' is not a directory or could not be created.",
      );
    });
  });
});
