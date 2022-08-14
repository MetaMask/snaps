import path from 'path';
import * as snapUtils from '@metamask/snap-utils';
import * as snapEvalModule from '../eval/evalHandler';
import * as manifestModule from '../manifest/manifestHandler';
import * as buildBundle from './bundle';
import buildModule from '.';

const build = buildModule.handler;

jest.mock('@metamask/snap-utils', () => ({
  validateDirPath: jest.fn(),
  validateFilePath: jest.fn(),
  validateOutfileName: jest.fn(),
  getOutfilePath: () => path.normalize('dist/bundle.js'),
}));

describe('build', () => {
  describe('build', () => {
    global.snaps = {
      verboseErrors: false,
    };

    it('processes yargs properties correctly', async () => {
      const mockArgv = {
        src: 'src/index.js',
        dist: 'dist',
        outfileName: 'bundle.js',
        eval: true,
        manifest: true,
      };

      const outfilePath = path.normalize(
        `${mockArgv.dist}/${mockArgv.outfileName}`,
      );
      const validateOutfileNameMock = jest
        .spyOn(snapUtils, 'validateOutfileName')
        .mockImplementation();
      const validateFilePathMock = jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation();
      const validateDirPathMock = jest
        .spyOn(snapUtils, 'validateDirPath')
        .mockImplementation();
      const bundleMock = jest
        .spyOn(buildBundle, 'bundle')
        .mockImplementation(async () => true);
      const evalMock = jest
        .spyOn(snapEvalModule, 'evalHandler')
        .mockImplementation();
      const manifestMock = jest
        .spyOn(manifestModule, 'manifestHandler')
        .mockImplementation();

      await build(mockArgv as any);
      expect(bundleMock).toHaveBeenCalledWith(
        mockArgv.src,
        outfilePath,
        mockArgv,
        undefined,
      );

      expect(evalMock).toHaveBeenCalledWith({
        ...mockArgv,
        bundle: outfilePath,
      });
      expect(manifestMock).toHaveBeenCalledWith(mockArgv);
      expect(validateOutfileNameMock).toHaveBeenCalledTimes(1);
      expect(validateFilePathMock).toHaveBeenCalledTimes(1);
      expect(validateDirPathMock).toHaveBeenCalledTimes(1);
    });

    it('does not call validateOutfileName, snapEval, or manifest without argv parameters', async () => {
      const mockArgv = {
        src: 'src/index.js',
        dist: 'dist',
      };
      const outfilePath = path.normalize(`${mockArgv.dist}/bundle.js`);
      const validateOutfileNameMock = jest
        .spyOn(snapUtils, 'validateOutfileName')
        .mockImplementation();
      const validateFilePathMock = jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation();
      const validateDirPathMock = jest
        .spyOn(snapUtils, 'validateDirPath')
        .mockImplementation();
      const bundleMock = jest
        .spyOn(buildBundle, 'bundle')
        .mockImplementation(async () => true);
      const evalMock = jest
        .spyOn(snapEvalModule, 'evalHandler')
        .mockImplementation();
      const manifestMock = jest
        .spyOn(manifestModule, 'manifestHandler')
        .mockImplementation();

      await build(mockArgv as any);
      expect(bundleMock).toHaveBeenCalledWith(
        mockArgv.src,
        outfilePath,
        mockArgv,
        undefined,
      );
      expect(evalMock).not.toHaveBeenCalled();
      expect(manifestMock).not.toHaveBeenCalled();
      expect(validateOutfileNameMock).not.toHaveBeenCalled();
      expect(validateFilePathMock).toHaveBeenCalledTimes(1);
      expect(validateDirPathMock).toHaveBeenCalledTimes(1);
    });

    it('does not call eval if bundle fails', async () => {
      const mockArgv = {
        src: 'src/index.js',
        dist: 'dist',
        outfileName: 'bundle.js',
        eval: true,
        manifest: true,
      };

      jest.spyOn(snapUtils, 'validateOutfileName').mockImplementation();
      jest.spyOn(snapUtils, 'validateFilePath').mockImplementation();
      jest.spyOn(snapUtils, 'validateDirPath').mockImplementation();
      const evalMock = jest
        .spyOn(snapEvalModule, 'evalHandler')
        .mockImplementation();
      jest.spyOn(manifestModule, 'manifestHandler').mockImplementation();
      jest.spyOn(buildBundle, 'bundle').mockImplementation();

      await build(mockArgv as any);
      expect(evalMock).not.toHaveBeenCalled();
    });
  });
});
