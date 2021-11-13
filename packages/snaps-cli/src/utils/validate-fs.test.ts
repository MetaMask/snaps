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
      let path1, path2, path3, path4, path5, path6;
      // eslint-disable-next-line jest/no-if
      if (os.platform() === 'win32') {
        path1 = 'src\\outDir';
        path2 = '..\\src\\outDir\\';
        path3 = '..\\src\\lol\\outDir\\';
        path4 = 'src\\outDir';
        path5 = 'src\\outDir\\';
        path6 = 'src\\bundle.js';
      } else {
        path1 = 'src/outDir';
        path2 = '../src/outDir/';
        path3 = '../src/lol/outDir/';
        path4 = 'src/outDir';
        path5 = 'src/outDir/';
        path6 = 'src/bundle.js';
      }
      expect(getOutfilePath('./src', 'outDir')).toStrictEqual(path1);
      expect(getOutfilePath('../src', '///outDir////')).toStrictEqual(path2);
      expect(getOutfilePath('../src', '/lol//outDir////')).toStrictEqual(path3);
      expect(getOutfilePath('src', 'outDir')).toStrictEqual(path4);
      expect(getOutfilePath('src/', './outDir/')).toStrictEqual(path5);
      expect(getOutfilePath('src/', '')).toStrictEqual(path6);
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
