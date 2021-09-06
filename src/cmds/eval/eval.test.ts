import * as fsUtils from '../../utils/validate-fs';
import * as workerEvalModule from './workerEval';
import evalModule from '.';

const snapEval = evalModule.handler;

describe('eval', () => {
  describe('snapEval', () => {
    const getMockArgv = () =>
      ({
        bundle: 'dist/bundle.js',
      } as any);

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => undefined);
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      jest
        .spyOn(fsUtils, 'validateFilePath')
        .mockImplementation(async () => true);
    });

    afterEach(() => {
      global.snaps = {};
    });

    it('snapEval successfully executes and logs to console', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      jest
        .spyOn(workerEvalModule, 'workerEval')
        .mockImplementation(async () => null);

      await snapEval(getMockArgv());
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('snapEval handles error when workerEval throws', async () => {
      global.snaps = {
        verboseErrors: false,
      };

      jest
        .spyOn(workerEvalModule, 'workerEval')
        .mockImplementation(async () => {
          throw new Error();
        });

      (process.exit as any).mockImplementationOnce(() => {
        throw new Error('process exited');
      });

      await expect(async () => {
        await snapEval(getMockArgv());
      }).rejects.toThrow('process exited');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });
});
