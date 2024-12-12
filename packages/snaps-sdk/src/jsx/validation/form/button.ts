import { boolean, optional, string } from '@metamask/superstruct';

import { literal, nullUnion, type Describe } from '../../../internals';
import type { ButtonElement } from '../../components';
import { children, element, StringElementStruct } from '../component';
import { IconStruct } from '../icon';
import { ImageStruct } from '../image';

/**
 * A struct for the {@link ButtonElement} type.
 */
export const ButtonStruct: Describe<ButtonElement> = element('Button', {
  children: children([StringElementStruct, ImageStruct, IconStruct]),
  name: optional(string()),
  type: optional(nullUnion([literal('button'), literal('submit')])),
  variant: optional(nullUnion([literal('primary'), literal('destructive')])),
  disabled: optional(boolean()),
  loading: optional(boolean()),
  form: optional(string()),
});
