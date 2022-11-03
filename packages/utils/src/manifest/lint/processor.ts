import { FrozenProcessor, unified } from 'unified';
import compiler from './compiler';
import parser from './parser';
import * as rules from './rules';
import { Expression } from './types';

const processor: FrozenProcessor<Expression, Expression, Expression> = unified()
  .use(parser)
  .use(compiler as any) // unified types don't like union types (type A = Node works, type B = Node1 | Node2 doesn't)
  .use(Object.values(rules) as any)
  .freeze();

export default processor;
