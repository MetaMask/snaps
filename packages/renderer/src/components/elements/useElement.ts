import { assert, Struct } from 'superstruct';
import { Element } from '../../elements';

export const useElement = <T extends Element>(
  element: T,
  schema: Struct<any>,
): T => {
  assert(element, schema);

  return element;
};
