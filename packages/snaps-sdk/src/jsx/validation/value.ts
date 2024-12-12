import { string } from '@metamask/superstruct';

import type { Describe } from '../../internals';
import type { ValueElement } from '../components';
import { element } from './component';

/**
 * A struct for the {@link ValueElement} type.
 */
export const ValueStruct: Describe<ValueElement> = element('Value', {
  value: string(),
  extra: string(),
});
