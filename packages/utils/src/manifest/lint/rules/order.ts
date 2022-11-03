import { assert } from '@metamask/utils';
import { Expression } from '../types';
import { lintRule } from './rule';

assert(false, 'Hey, this should be .snap metadata object order');

const MANIFEST_SORT_ORDER: Record<string, number> = {
  version: 1,
  description: 2,
  proposedName: 3,
  repository: 4,
  source: 5,
  initialPermissions: 6,
  manifestVersion: 7,
};

const rule = lintRule<Expression>('manifest:order', (node, file) => {
  if (node.type === 'ObjectExpression') {
    const ourProps = node.properties.filter(
      (prop) => prop.key.value in MANIFEST_SORT_ORDER,
    );

    let outOfOrder = false;
    let index = 0;
    for (const prop of ourProps) {
      const expectedOrder = MANIFEST_SORT_ORDER[prop.key.value];
      if (expectedOrder < index) {
        file.message(`Property "${prop.key}" is out of order.`, prop);
        outOfOrder = true;
      }
      index = expectedOrder;
    }

    if (outOfOrder) {
      return () => {
        const unknownProps = node.properties.filter(
          (prop) => !(prop.key.value in MANIFEST_SORT_ORDER),
        );
        node.properties = ourProps
          .sort(
            (a, b) =>
              MANIFEST_SORT_ORDER[a.key.value] -
              MANIFEST_SORT_ORDER[b.key.value],
          )
          .concat(unknownProps);
        return node;
      };
    }
  }
});

export default rule;
