import { YargsArgs } from '../../types/yargs';
import { snapEval } from '../eval/evalHandler';
import { manifestHandler } from '../manifest/manifestHandler';

export async function processEval(argv: YargsArgs) {
  if (argv.eval) {
    await snapEval(argv);
  }
}

export async function processManifestCheck(argv: YargsArgs) {
  if (argv.manifest) {
    await manifestHandler(argv);
  }
}
