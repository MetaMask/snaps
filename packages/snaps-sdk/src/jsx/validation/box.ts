import type { Struct } from '@metamask/superstruct';
import { boolean, lazy, optional } from '@metamask/superstruct';

import { BoxChildStruct } from '.';
import type { Describe } from '../../internals';
import { literal, nullUnion } from '../../internals';
import type { GenericSnapElement, SnapsChildren } from '../component';
import type { BoxElement } from '../components';
import { children, element } from './component';

export const BoxChildrenStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [lazy(() => BoxChildStruct)],
) as unknown as Struct<SnapsChildren<GenericSnapElement>, null>;

/**
 * A struct for the {@link BoxElement} type.
 */
export const BoxStruct: Describe<BoxElement> = element('Box', {
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
  center: optional(boolean()),
});
