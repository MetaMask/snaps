import { boolean, optional, string } from '@metamask/superstruct';

import { literal, nullUnion, type Describe } from '../../../internals';
import type { CheckboxElement } from '../../components';
import { element } from '../component';

/**
 * A struct for the {@link CheckboxElement} type.
 */
export const CheckboxStruct: Describe<CheckboxElement> = element('Checkbox', {
  name: string(),
  checked: optional(boolean()),
  label: optional(string()),
  variant: optional(nullUnion([literal('default'), literal('toggle')])),
});
