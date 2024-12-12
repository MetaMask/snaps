import { string } from '@metamask/superstruct';

import type { Describe } from '../../../internals';
import type { OptionElement } from '../../components';
import { element } from '../component';

/**
 * A struct for the {@link OptionElement} type.
 */
export const OptionStruct: Describe<OptionElement> = element('Option', {
  value: string(),
  children: string(),
});
