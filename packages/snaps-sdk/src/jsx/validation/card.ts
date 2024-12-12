import { optional, string } from '@metamask/superstruct';

import { selectiveUnion, type Describe } from '../../internals';
import type { CardElement } from '../components';
import { AddressStruct } from './address';
import { element } from './component';

/**
 * A struct for the {@link CardElement} type.
 */
export const CardStruct: Describe<CardElement> = element('Card', {
  image: optional(string()),
  title: selectiveUnion((value) => {
    if (typeof value === 'object') {
      return AddressStruct;
    }
    return string();
  }),
  description: optional(string()),
  value: string(),
  extra: optional(string()),
});
