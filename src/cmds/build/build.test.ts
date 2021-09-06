import * as snapEvalModule from '../eval/evalHandler';
import * as manifestModule from '../manifest/manifestHandler';
import * as fsUtils from '../../utils/validate-fs';
import * as buildBundle from './bundle';
import buildModule from '.';

const build = buildModule.handler;

describe('build', () => {
  describe('build', () => {
    global.snaps = {
      verboseErrors: false,
    };

    it('processes yargs properties correctly', async () => {
      const mockArgv = {
        src: 'index.js',
        dist: 'dist',
        outfileName: 'bundle.js',
        eval: true,
        manifest: true,
      };

      const outfilePath = `${mockArgv.dist}/${mockArgv.outfileName}`;
      const validateOutfileNameMock = jest
        .spyOn(fsUtils, 'validateOutfileName')
        .mockImplementation();
      const validateFilePathMock = jest
        .spyOn(fsUtils, 'validateFilePath')
        .mockImplementation();
      const validateDirPathMock = jest
        .spyOn(fsUtils, 'validateDirPath')
        .mockImplementation();
      const bundleMock = jest
        .spyOn(buildBundle, 'bundle')
        .mockImplementation(async () => true);
      const evalMock = jest
        .spyOn(snapEvalModule, 'snapEval')
        .mockImplementation();
      const manifestMock = jest
        .spyOn(manifestModule, 'manifest')
        .mockImplementation();

      await build(mockArgv as any);
      expect(bundleMock).toHaveBeenCalledWith(
        mockArgv.src,
        outfilePath,
        mockArgv,
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
        src: 'index.js',
        dist: 'dist',
      };
      const outfilePath = `${mockArgv.dist}/bundle.js`;
      const validateOutfileNameMock = jest
        .spyOn(fsUtils, 'validateOutfileName')
        .mockImplementation();
      const validateFilePathMock = jest
        .spyOn(fsUtils, 'validateFilePath')
        .mockImplementation();
      const validateDirPathMock = jest
        .spyOn(fsUtils, 'validateDirPath')
        .mockImplementation();
      const bundleMock = jest
        .spyOn(buildBundle, 'bundle')
        .mockImplementation(async () => true);
      const evalMock = jest
        .spyOn(snapEvalModule, 'snapEval')
        .mockImplementation();
      const manifestMock = jest
        .spyOn(manifestModule, 'manifest')
        .mockImplementation();

      await build(mockArgv as any);
      expect(bundleMock).toHaveBeenCalledWith(
        mockArgv.src,
        outfilePath,
        mockArgv,
      );
      expect(evalMock).not.toHaveBeenCalled();
      expect(manifestMock).not.toHaveBeenCalled();
      expect(validateOutfileNameMock).not.toHaveBeenCalled();
      expect(validateFilePathMock).toHaveBeenCalledTimes(1);
      expect(validateDirPathMock).toHaveBeenCalledTimes(1);
    });

    it('does not call eval if bundle fails', async () => {
      const mockArgv = {
        src: 'index.js',
        dist: 'dist',
        outfileName: 'bundle.js',
        eval: true,
        manifest: true,
      };

      jest.spyOn(fsUtils, 'validateOutfileName').mockImplementation();
      jest.spyOn(fsUtils, 'validateFilePath').mockImplementation();
      jest.spyOn(fsUtils, 'validateDirPath').mockImplementation();
      const evalMock = jest
        .spyOn(snapEvalModule, 'snapEval')
        .mockImplementation();
      jest.spyOn(manifestModule, 'manifest').mockImplementation();
      jest.spyOn(buildBundle, 'bundle').mockImplementation();

      await build(mockArgv as any);
      expect(evalMock).not.toHaveBeenCalled();
    });
  });
});
