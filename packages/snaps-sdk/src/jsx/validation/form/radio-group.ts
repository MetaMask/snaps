import { optional, string } from '@metamask/superstruct';

import type { Describe } from '../../../internals';
import type { RadioGroupElement } from '../../components';
import { children, element } from '../component';
import { RadioStruct } from './radio';

/**
 * A struct for the {@link RadioGroupElement} type.
 */
export const RadioGroupStruct: Describe<RadioGroupElement> = element(
  'RadioGroup',
  {
    name: string(),
    value: optional(string()),
    children: children([RadioStruct]),
  },
);
