import assert from 'assert';
import { validate } from 'superstruct';
import { SnapPackageJsonStruct } from '../../types';
import { Expression } from '../types';
import { lintRule } from './rule';

const rule = lintRule<Expression>('manifest:structure', (tree, file) => {
  assert(file.data.parsed !== undefined);
  const [error] = validate(file.data.parsed, SnapPackageJsonStruct);
  if (error) {
    for (const failure of error.failures()) {
      file.message(failure.message, tree);
    }
  }
});

export default rule;
