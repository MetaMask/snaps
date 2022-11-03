import { assert } from '@metamask/utils';
import { format } from 'prettier';
import { Compiler, Plugin } from 'unified';
import { Expression, Identifier } from './types';

/**
 * Dirty stringify
 */
function stringify(value: Expression | Identifier): string {
  switch (value.type) {
    case 'Literal':
      return JSON.stringify(value.value);
    case 'ArrayExpression':
      return `[${value.elements.map(stringify).join(',')}]`;
    case 'UnaryExpression':
      return `${value.operator}${stringify(value.argument)}`;
    case 'Identifier':
      return value.name;
    case 'ObjectExpression':
      const props = value.properties.map((prop) => {
        assert(
          prop.key.type === 'Literal' && typeof prop.key.value === 'string',
        );
        return `"${prop.key.value}": ${stringify(prop.value)}`;
      });
      return `{${props.join(',')}}`;
  }
}

const plugin: Plugin<any[], Expression, string> = function () {
  const compiler: Compiler<Expression> = (tree) =>
    format(stringify(tree), { parser: 'json' });

  Object.assign(this, { Compiler: compiler });
};
export default plugin;
