import { optional } from '@metamask/superstruct';

import { literal, nullUnion, type Describe } from '../../internals';
import type { SectionElement } from '../components';
import { BoxChildrenStruct } from './box';
import { element } from './component';

/**
 * A struct for the {@link SectionElement} type.
 */
export const SectionStruct: Describe<SectionElement> = element('Section', {
  children: BoxChildrenStruct,
  direction: optional(nullUnion([literal('horizontal'), literal('vertical')])),
  alignment: optional(
    nullUnion([
      literal('start'),
      literal('center'),
      literal('end'),
      literal('space-between'),
      literal('space-around'),
    ]),
  ),
});
