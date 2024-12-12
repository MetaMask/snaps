import { string } from '@metamask/superstruct';

import type { Describe } from '../../../internals';
import type { RadioElement } from '../../components';
import { element } from '../component';

/**
 * A struct for the {@link RadioElement} type.
 */
export const RadioStruct: Describe<RadioElement> = element('Radio', {
  value: string(),
  children: string(),
});
