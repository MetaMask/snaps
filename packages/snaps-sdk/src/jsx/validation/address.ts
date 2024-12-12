import { boolean, optional } from '@metamask/superstruct';
import { CaipAccountIdStruct, HexChecksumAddressStruct } from '@metamask/utils';

import { nullUnion, type Describe } from '../../internals';
import type { AddressElement } from '../components';
import { element } from './component';

/**
 * A struct for the {@link AddressElement} type.
 */
export const AddressStruct: Describe<AddressElement> = element('Address', {
  address: nullUnion([HexChecksumAddressStruct, CaipAccountIdStruct]),
  truncate: optional(boolean()),
  displayName: optional(boolean()),
  avatar: optional(boolean()),
});
