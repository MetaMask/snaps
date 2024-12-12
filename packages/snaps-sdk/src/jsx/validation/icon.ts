import { literal, optional, type Struct } from '@metamask/superstruct';

import type { Describe } from '../../internals';
import { nullUnion } from '../../internals';
import type { IconElement } from '../components';
import { IconName } from '../components';
import { element } from './component';

const IconNameStruct: Struct<`${IconName}`, null> = nullUnion(
  Object.values(IconName).map((name) => literal(name)) as any,
);

/**
 * A struct for the {@link IconElement} type.
 */
export const IconStruct: Describe<IconElement> = element('Icon', {
  name: IconNameStruct,
  color: optional(
    nullUnion([literal('default'), literal('primary'), literal('muted')]),
  ),
  size: optional(nullUnion([literal('md'), literal('inherit')])),
});
