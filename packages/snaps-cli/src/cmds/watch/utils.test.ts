import { TranspilationModes } from '../../builders';
import { manifestHandler } from '../manifest/manifestHandler';
import { snapEval } from '../eval/evalHandler';
import { YargsArgs } from '../../types/yargs';
import { processEval, processManifestCheck } from './utils';

jest.mock('../eval/evalHandler');
jest.mock('../manifest/manifestHandler');
describe('utils', () => {
  describe('processEval', () => {
    it('will call snapEval if the eval property is true in argv', async () => {
      const argv: Record<string, any> = {
        eval: true,
        sourceMaps: true,
        stripComments: true,
        transpilationMode: TranspilationModes.none,
        bundle: 'dest',
      };
      await processEval(argv as YargsArgs);
      expect(snapEval).toHaveBeenCalled();
    });
  });

  describe('processManifestCheck', () => {
    it('will call manifestHandler if the manifest property is true in argv', async () => {
      const argv: Record<string, any> = {
        eval: true,
        sourceMaps: true,
        stripComments: true,
        transpilationMode: TranspilationModes.none,
        bundle: 'dest',
        manifest: true,
      };
      await processManifestCheck(argv as YargsArgs);
      expect(manifestHandler).toHaveBeenCalled();
    });
  });
});
