import { assert } from '@metamask/utils';
import { Expression } from './types';

type Selector = {
  /**
   * Selects the property from an object node with the property key.
   *
   * @example
   * ```typescript
   * const obj = ast(`
   *   {
   *     "myProperty": 42,
   *     "another": "bar"
   *   }
   * `);
   * const notObj = ast("null");
   *
   * select(obj)("myProperty")()
   * //^? Node<Literal> = 42
   * select(obj)("myProperty")("nested")()
   * //^? null
   * select(notObj)("hello")()
   * //^? null
   * ```
   *
   * @param property - The name of the property to select
   * @returns Selector with the property node, null Selector if not an object / no such property
   */
  (property: string): Selector;
  /**
   * Selects the element from an array node by the index.
   * Supports negative indexes
   *
   * @example
   * ```typescript
   * const arr = ast(`[1, 2, 3, 4]`);
   * const notArr = ast("null");
   *
   * select(arr)(0)()
   * //^? Node<Literal> = 1
   * select(arr)(-1)()
   * //^? Node<Literal> = 4
   * select(arr)(10)()
   * //^? null
   * select(arr)(0)("nested")()
   * //^? null
   * select(notArr)(0)()
   * //^? null
   * ```
   *
   * @param index - The index of the element to select.
   * @returns Selector with the element node, null Selector if not an array / no such index
   */
  (index: number): Selector;
  /**
   * Returns the result of selection
   *    * @example
   * ```typescript
   * const obj = ast(`
   *   {
   *     "foo": [null, { "bar": { "nested": 42 } }],
   *     "another": "bar"
   *   }
   * `);
   *
   * select(obj)("foo")(1)("bar")("nested")()
   * //^? Node<Literal> = 42
   * select(obj)("myProperty")("nested")()
   * //^? null
   * select(obj)(0)()
   * //^? null
   * ```
   *
   * @returns Node if exists and was proper types, null otherwise
   */
  (): Expression | null;
};

export function select(node: Expression | null | undefined): Selector {
  function selector(key?: string | number) {
    if (key === undefined) {
      return node ?? null;
    }

    if (typeof key === 'number') {
      if (node?.type === 'ArrayExpression') {
        assert(Number.isSafeInteger(key));
        if (key < 0) {
          key = node.elements.length + key;
        }
        return select(node.elements[key]);
      }
      return select(null);
    } else {
      if (node?.type === 'ObjectExpression') {
        return select(
          node.properties.find((prop) => prop.key.value === key)?.value,
        );
      }
      return select(null);
    }
  }
  return selector as Selector;
}
