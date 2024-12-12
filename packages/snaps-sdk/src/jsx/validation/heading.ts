import { optional } from '@metamask/superstruct';

import { literal, nullUnion, type Describe } from '../../internals';
import type { HeadingElement } from '../components';
import { element, StringElementStruct } from './component';

/**
 * A struct for the {@link HeadingElement} type.
 */
export const HeadingStruct: Describe<HeadingElement> = element('Heading', {
  children: StringElementStruct,
  size: optional(nullUnion([literal('sm'), literal('md'), literal('lg')])),
});
