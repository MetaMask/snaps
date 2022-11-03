import * as fs from 'fs/promises';
import { getSnapSourceShasum } from '../../../snaps';
import { select } from '../select';
import { Expression } from '../types';
import { lintRule } from './rule';

const rule = lintRule<Expression>('manifest:shashum', async (tree, file) => {
  // .snap.checksum.hash
  const hash = select(tree)('snap')('checksum')('hash')();
  if (hash?.type !== 'Literal' || typeof hash?.value !== 'string') {
    return;
  }

  let sourceCode = (file as any).sourceCode;
  if (!sourceCode) {
    // .main
    const main = select(tree)('main')();
    if (main?.type !== 'Literal' || typeof main.value !== 'string') {
      return;
    }
    sourceCode = await fs.readFile(main.value, { encoding: 'utf-8' });
  }

  const shasum = getSnapSourceShasum(sourceCode);

  if (hash.value !== shasum) {
    file.message(`Shashum mismatch, expected "${shasum}".`, hash);
    return () => {
      hash.value = shasum;
      return tree;
    };
  }
});
export default rule;
