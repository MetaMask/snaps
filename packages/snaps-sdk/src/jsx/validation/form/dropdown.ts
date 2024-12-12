import { optional, string } from '@metamask/superstruct';

import type { Describe } from '../../../internals';
import type { DropdownElement } from '../../components';
import { children, element } from '../component';
import { OptionStruct } from './option';

/**
 * A struct for the {@link DropdownElement} type.
 */
export const DropdownStruct: Describe<DropdownElement> = element('Dropdown', {
  name: string(),
  value: optional(string()),
  children: children([OptionStruct]),
});
