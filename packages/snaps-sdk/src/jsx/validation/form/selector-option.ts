import { string } from '@metamask/superstruct';

import type { Describe } from '../../../internals';
import type { SelectorOptionElement } from '../../components';
import { CardStruct } from '../card';
import { element } from '../component';

/**
 * A struct for the {@link SelectorOptionElement} type.
 */
export const SelectorOptionStruct: Describe<SelectorOptionElement> = element(
  'SelectorOption',
  {
    value: string(),
    children: CardStruct,
  },
);
