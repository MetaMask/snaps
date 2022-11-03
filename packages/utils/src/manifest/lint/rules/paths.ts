import fs from 'fs';
import { select } from '../select';
import { Expression } from '../types';
import { lintRule } from './rule';

const rule = lintRule<Expression>('manifest:path', (tree, file) => {
  if (tree.type !== 'ObjectExpression') {
    return;
  }

  // .main
  check(select(tree)('main')());

  // .snap.icon
  check(select(tree)('snap')('icon')());

  function check(node: Expression | null) {
    if (!node || node.type !== 'Literal' || typeof node.value !== 'string') {
      return;
    }

    const path = node.value;
    if (!fs.existsSync(path)) {
      file.message(`Path "${path}" couldn't be found.`, node);
    }
  }
});
export default rule;
