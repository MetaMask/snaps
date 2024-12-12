import { optional, string } from '@metamask/superstruct';

import type { Describe } from '../../../internals';
import type { SelectorElement } from '../../components';
import { children, element } from '../component';
import { SelectorOptionStruct } from './selector-option';

/**
 * A struct for the {@link SelectorElement} type.
 */
export const SelectorStruct: Describe<SelectorElement> = element('Selector', {
  name: string(),
  title: string(),
  value: optional(string()),
  children: children([SelectorOptionStruct]),
});
